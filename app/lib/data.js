'use strict';

import { Ticket, User, Reply, Product, Assignment, Project, PubEdEvent } from "./models";
import { connectToDB } from "./utils";
import { auth } from "@/app/auth";
import moment from "moment-timezone";

const combineDateAndTime = (date, time) => {
  if (!date) return null;

  // Create a moment object from the UTC date and set it to Central time
  const m = moment.utc(date).tz("America/Chicago");

  // If we have a time, set it
  if (time) {
    const [hours, minutes] = time.split(":").map(Number);
    m.set({ hours, minutes, seconds: 0, milliseconds: 0 });
  }

  return m;
};

export const fetchUsers = async (q, page) => {
  const regex = new RegExp(q, "i");
  const ITEM_PER_PAGE = 100;

  try {
    connectToDB();
    const total = await User.countDocuments();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Get the total count from the previous week
    const previousTotal = await User.countDocuments({
      createdAt: {
        $lt: oneWeekAgo,
      }, // Users created before one week ago
    });

    const count = await User.find({
      username: {
        $regex: regex,
      },
    }).count();
    const users = await User.find({
      $or: [
        {
          username: {
            $regex: regex,
          },
        },
        {
          email: {
            $regex: regex,
          },
        },
        {
          phone: {
            $regex: regex,
          },
        },
      ],
    })
      .limit(ITEM_PER_PAGE)
      .skip(ITEM_PER_PAGE * (page - 1));
    return {
      count,
      users,
      total,
      previousTotal,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch users!");
  }
};

export const fetchUser = async (id) => {
  console.log(id);
  try {
    connectToDB();
    const user = await User.findById(id);
    return user;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch user!");
  }
};

export const fetchProducts = async () => {
  try {
    connectToDB();

    const products = await Product.find();

    console.log("Poducts: ", products);

    return {
      products,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch products!");
  }
};

export const fetchProduct = async (id) => {
  try {
    await connectToDB(); // Ensure the connection is established
    const product = await Product.findById(id);

    if (!product) {
      throw new Error("Product not found.");
    }

    return product; // Return product data if found
  } catch (err) {
    console.log(err.message);
    throw new Error("Failed to fetch product!");
  }
};

export const getAssignmentsByModelNumber = async (modelNumber) => {
  try {
    await connectToDB(); // Ensure the connection is established
    const assignments = await Assignment.find({
      modelNumber,
    }).exec();

    if (assignments.length === 0) {
      return {
        success: true, // Success, but no assignments
        assignments: [],
      };
    }

    return {
      success: true,
      assignments,
    }; // Return assignments if found
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to fetch assignments.",
    };
  }
};

export const fetchAssignmentsByMonth = async () => {
  try {
    connectToDB(); // Ensure the connection is established

    // Aggregate tickets by month
    const monthlyData = await Assignment.aggregate([
      {
        $group: {
          _id: {
            $month: "$assignedAt", // Group by the month of the ticket creation date
          },
          assignments: {
            $sum: 1, // Count the number of tickets
          },
        },
      },
      {
        $sort: {
          _id: 1, // Sort by month in ascending order
        },
      },
    ]);

    // Map MongoDB month numbers (1–12) to month names
    const monthMap = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedData = monthlyData.map((entry) => ({
      name: monthMap[entry._id - 1], // Use "name" for the month
      value: entry.assignments, // Use "value" for the count
    }));

    return formattedData; // Return the formatted monthly data
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch assignments by month!");
  }
};

export const fetchTicketDepartmentByMonth = async () => {
  try {
    await connectToDB(); // Ensure the database connection is established

    // Aggregate tickets grouped by department and month
    const monthlyData = await Ticket.aggregate([
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }, // Group by month
            department: "$department", // Group by department
          },
          count: { $sum: 1 }, // Count tickets per group
        },
      },
      { $sort: { "_id.month": 1 } }, // Sort by month in ascending order
    ]);

    // Map MongoDB month numbers (1–12) to month names
    const monthMap = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Initialize an empty object to hold the reformatted data
    const reformattedData = [];

    // Use an object to mimic the behavior of a Set (fallback for older environments)
    const departmentSet = {};
    monthlyData.forEach((entry) => {
      departmentSet[entry._id.department] = true;
    });

    // Convert the department keys to an array for easy iteration
    const departments = Object.keys(departmentSet);

    // Loop through the monthlyData to transform it
    monthlyData.forEach((entry) => {
      const month = monthMap[entry._id.month - 1]; // Convert month number to name
      const department = entry._id.department; // Department name
      const count = entry.count; // Count of tickets for that department

      // Find if the month already exists in the reformatted data
      let monthData = reformattedData.find((item) => item.month === month);

      // If the month doesn't exist, add it
      if (!monthData) {
        monthData = { month, [department]: count };
        reformattedData.push(monthData);
      } else {
        // If the month exists, update the department count
        monthData[department] = count;
      }
    });

    // Ensure every month has all departments (even if a department has 0 tickets)
    reformattedData.forEach((monthData) => {
      departments.forEach((department) => {
        if (!monthData[department]) {
          monthData[department] = 0; // Assign 0 if department doesn't exist in the month
        }
      });
    });

    console.log(reformattedData); // View the final reformatted data structure
    return reformattedData; // Return the reformatted data
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch tickets by department and month!");
  }
};

export const fetchTicketDepartmentByMonthReport = async (fromDate, toDate) => {
  try {
    await connectToDB(); // Ensure the database connection is established

    // Aggregate tickets grouped by department and month, with date filtering
    const monthlyData = await Ticket.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(fromDate), // Filter tickets created after fromDate
            $lte: new Date(toDate), // Filter tickets created before toDate
          },
        },
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" }, // Group by month
            department: "$department", // Group by department
          },
          count: { $sum: 1 }, // Count tickets per group
        },
      },
      { $sort: { "_id.month": 1 } }, // Sort by month in ascending order
    ]);

    // Map MongoDB month numbers (1–12) to month names
    const monthMap = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Initialize an empty object to hold the reformatted data
    const reformattedData = [];

    // Use an object to mimic the behavior of a Set (fallback for older environments)
    const departmentSet = {};
    monthlyData.forEach((entry) => {
      departmentSet[entry._id.department] = true;
    });

    // Convert the department keys to an array for easy iteration
    const departments = Object.keys(departmentSet);

    // Loop through the monthlyData to transform it
    monthlyData.forEach((entry) => {
      const month = monthMap[entry._id.month - 1]; // Convert month number to name
      const department = entry._id.department; // Department name
      const count = entry.count; // Count of tickets for that department

      // Find if the month already exists in the reformatted data
      let monthData = reformattedData.find((item) => item.month === month);

      // If the month doesn't exist, add it
      if (!monthData) {
        monthData = { month, [department]: count };
        reformattedData.push(monthData);
      } else {
        // If the month exists, update the department count
        monthData[department] = count;
      }
    });

    // Ensure every month has all departments (even if a department has 0 tickets)
    reformattedData.forEach((monthData) => {
      departments.forEach((department) => {
        if (!monthData[department]) {
          monthData[department] = 0; // Assign 0 if department doesn't exist in the month
        }
      });
    });

    console.log(reformattedData); // View the final reformatted data structure
    return reformattedData; // Return the reformatted data
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch tickets by department and month!");
  }
};

export const fetchTickets = async (q) => {
  console.log(q);
  const regex = new RegExp(q, "i");

  try {
    connectToDB();
    const total = await Ticket.countDocuments();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    const previousTotal = await Ticket.countDocuments({
      createdAt: {
        $lt: oneWeekAgo,
      },
    });

    // Update the query to search for name, email, or phone and populate assignedTo
    const tickets = await Ticket.find({
      $or: [
        {
          name: {
            $regex: regex,
          },
        },
        {
          email: {
            $regex: regex,
          },
        },
        {
          phone: {
            $regex: regex,
          },
        },
      ],
    })
    .sort({ updatedAt: -1 }) // Sort by creation date in descending order
    .populate({
      path: "assignedTo",
      model: "User",
      select: "username",
    });

    console.log(
      "Raw tickets with populated data:",
      JSON.stringify(tickets, null, 2)
    );

    // Map through tickets to handle null assignedTo
    const formattedTickets = tickets.map((ticket) => {
      const formatted = ticket.toObject(); // Convert to plain object
      return {
        ...formatted,
        id: formatted._id.toString(),
        assignedTo: formatted.assignedTo
          ? formatted.assignedTo.username
          : "Not Assigned",
      };
    });

    console.log(
      "Formatted tickets:",
      JSON.stringify(formattedTickets, null, 2)
    );

    return {
      tickets: formattedTickets,
      total,
      previousTotal,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch tickets!");
  }
};

export const fetchMyTickets = async (q, limit = 15) => {
  // Default limit is 15
  const session = await auth();
  console.log(q);
  const regex = new RegExp(q, "i");

  try {
    connectToDB();

    // Get tickets assigned to the user and not closed
    const tickets = await Ticket.find({
      assignedTo: session.user.id,
      // status: { $nin: ['Closed'] }, // Exclude closed tickets
      $or: [
        {
          name: {
            $regex: regex,
          },
        },
        {
          email: {
            $regex: regex,
          },
        },
        {
          phone: {
            $regex: regex,
          },
        },
      ],
    })
    .sort({ updatedAt: -1 }) // Sort by creation date in descending order
    .limit(limit)
    .populate({
      path: "assignedTo",
      model: "User",
      select: "username",
    });

    // Convert to plain objects and format
    const formattedTickets = tickets.map((ticket) => {
      const formatted = ticket.toObject();
      return {
        ...formatted,
        id: formatted._id.toString(),
        assignedTo: formatted.assignedTo
          ? formatted.assignedTo.username
          : "Not Assigned",
      };
    });

    return {
      myTickets: formattedTickets,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch tickets!");
  }
};

export const fetchTicket = async (id) => {
  try {
    connectToDB();
    const ticket = await Ticket.findById(id).populate("user", "username").lean({
      virtuals: true,
    });

    if (!ticket) {
      throw new Error("Ticket not found");
    }

    // Fallback calculation for currentTrackedTime
    let totalTrackedTime;
    if (ticket.status === "In Progress" && ticket.lastStartTime) {
      const now = new Date();
      totalTrackedTime =
        Math.floor((now - new Date(ticket.lastStartTime)) / 1000) +
        ticket.totalTime;
    } else {
      totalTrackedTime = ticket.totalTime;
    }

    const days = Math.floor(totalTrackedTime / (24 * 3600));
    const hours = Math.floor((totalTrackedTime % (24 * 3600)) / 3600);
    const minutes = Math.floor((totalTrackedTime % 3600) / 60);

    // Attach the formatted time explicitly
    ticket.currentTrackedTimeFormatted = `${days}d ${hours}h ${minutes}m`;

    console.log("Ticket with Tracked Time:", ticket);
    return ticket;
  } catch (err) {
    console.error("Error fetching ticket:", err.message);
    throw new Error("Failed to fetch ticket!");
  }
};

export const fetchTicketsByWeek = async () => {
  try {
    connectToDB();

    const oneWeekAgo = new Date();
    oneWeekAgo.setDate(oneWeekAgo.getDate() - 7);

    // Aggregate tickets by day of the week
    const weeklyData = await Ticket.aggregate([
      {
        $match: {
          createdAt: {
            $gte: oneWeekAgo,
          },
        }, // Tickets created within the past week
      },
      {
        $group: {
          _id: {
            $dayOfWeek: "$createdAt",
          }, // Group by day of the week (1 = Sunday, 7 = Saturday)
          tickets: {
            $sum: 1,
          }, // Count tickets
        },
      },
      {
        $sort: {
          _id: 1,
        },
      }, // Sort by day of the week
    ]);

    // Map MongoDB day-of-week numbers to day names
    const dayMap = ["Sun", "Mon", "Tue", "Wed", "Thu", "Fri", "Sat"];
    const formattedData = weeklyData.map((entry) => ({
      day: dayMap[entry._id - 1],
      tickets: entry.tickets,
    }));

    return formattedData;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch weekly ticket data!");
  }
};

export const fetchTicketsByMonth = async () => {
  try {
    connectToDB(); // Ensure the connection is established

    // Aggregate tickets by month
    const monthlyData = await Ticket.aggregate([
      {
        $group: {
          _id: {
            $month: "$createdAt", // Group by the month of the ticket creation date
          },
          tickets: {
            $sum: 1,
          }, // Count the number of tickets
          totalTime: {
            $sum: "$totalTime",
          }, // Sum the total time for tickets in the month
        },
      },
      {
        $sort: {
          _id: 1, // Sort by month in ascending order
        },
      },
    ]);

    // Map MongoDB month numbers (1–12) to month names
    const monthMap = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];

    // Format the result into chart data format
    const formattedData = monthlyData.map((entry) => ({
      name: monthMap[entry._id - 1], // Use "name" for the month
      value: entry.tickets, // Use "value" for the count of tickets
      totalTime: entry.totalTime, // Add the total time for the month
    }));

    return formattedData; // Return the formatted monthly data
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch tickets by month!");
  }
};

export const fetchProjects = async (q) => {
  const regex = new RegExp(q, "i");

  try {
    connectToDB();

    const projects = await Project.find({
      name: {
        $regex: regex,
      },
    });
    console.log(projects);

    return {
      projects,
    };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch projects!");
  }
};

export const fetchProject = async (id) => {
  try {
    connectToDB();
    const project = await Project.findById(id);
    if (!project) {
      throw new Error("Project not found.");
    }
    return project;
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch project!");
  }
};

export const fetchProjectsCalendar = async () => {
  try {
    await connectToDB();

    const projects = await Project.find().populate({
      path: "teamMembers",
      select: "username email department",
    });

    // Define status colors
    const statusColors = {
      "Not Started": "#ff9800", // Orange
      "In Progress": "#2196f3", // Blue
      Completed: "#4caf50", // Green
      "On Hold": "#f44336", // Red
      Cancelled: "#9e9e9e", // Grey
    };

    const formattedProjects = projects
      .map((project) => {
        // Create moment objects in Central time
        const start = combineDateAndTime(
          project.startDate,
          project.startTime || "09:00"
        );
        const end = combineDateAndTime(
          project.endDate,
          project.endTime || "17:00"
        );

        // If either date is invalid, skip this project
        if (!start || !end) {
          console.error("Invalid dates for project:", project._id);
          return null;
        }

        // Format dates in ISO format with timezone
        const startStr = start.format();
        const endStr = end.format();

        console.log(`Project ${project.name} dates:`, {
          originalStart: project.startDate,
          originalEnd: project.endDate,
          formattedStart: startStr,
          formattedEnd: endStr,
        });

        // Get color based on status, fallback to a default color
        const backgroundColor = statusColors[project.status] || "#607d8b";

        return {
          id: project._id,
          title: project.name,
          start: startStr,
          end: endStr,
          backgroundColor,
          borderColor: backgroundColor,
          textColor: "#ffffff",
          extendedProps: {
            id: project._id,
            description: project.description,
            status: project.status,
            startTime: project.startTime || "09:00",
            endTime: project.endTime || "17:00",
            teamMembers: project.teamMembers.map((member) => ({
              username: member.username,
              email: member.email,
              department: member.department,
            })),
          },
        };
      })
      .filter(Boolean);

    return formattedProjects;
  } catch (err) {
    console.error("Error fetching projects:", err.message);
    throw new Error("Failed to fetch projects!");
  }
};

export const fetchProjectsByMonth = async () => {
  try {
    connectToDB(); // Ensure the connection is established

    // Aggregate tickets by month
    const monthlyData = await Project.aggregate([
      {
        $group: {
          _id: {
            $month: "$startDate", // Group by the month of the project creation date
          },
          projects: {
            $sum: 1, // Count the number of projects
          },
        },
      },
      {
        $sort: {
          _id: 1, // Sort by month in ascending order
        },
      },
    ]);

    // Map MongoDB month numbers (1–12) to month names
    const monthMap = [
      "January",
      "February",
      "March",
      "April",
      "May",
      "June",
      "July",
      "August",
      "September",
      "October",
      "November",
      "December",
    ];
    const formattedData = monthlyData.map((entry) => ({
      name: monthMap[entry._id - 1], // Use "name" for the month
      value: entry.projects, // Use "value" for the count
    }));

    return formattedData; // Return the formatted monthly data
  } catch (err) {
    console.error(err);
    throw new Error("Failed to fetch projects by month!");
  }
};

export const fetchReply = async (ticketID) => {
  try {
    await connectToDB();
    console.log("Fetching replies for ticket:", ticketID);

    const myReplies = await Reply.find({ ticketID }).lean();
    console.log("Found raw replies:", myReplies);

    // Populate user data for each reply sequentially
    const populatedReplies = [];
    
    for (const reply of myReplies) {
      let userData = null;
      
      // Try to populate userID first
      if (reply.userID) {
        userData = await User.findById(reply.userID).select('username _id').lean();
        if (userData) {
          reply.userID = userData;
          reply.userID._id = reply.userID._id.toString();
        }
      }
      
      // If no userID or no user found, try user field
      if (!userData && reply.user) {
        userData = await User.findById(reply.user).select('username _id').lean();
        if (userData) {
          reply.user = userData;
          reply.user._id = reply.user._id.toString();
        }
      }

      populatedReplies.push(reply);
    }

    console.log("Populated replies:", populatedReplies);
    return populatedReplies;
  } catch (error) {
    console.error("Error fetching replies:", error);
    throw new Error("Failed to fetch replies");
  }
};

// DUMMY DATA

export const fetchTicketsByDateRange = async (fromDate, toDate) => {
  try {
    connectToDB();

    // Convert date strings to Date objects if necessary
    const startDate = new Date(fromDate);
    const endDate = new Date(toDate);

    // Ensure the end date is inclusive
    endDate.setHours(23, 59, 59, 999); // Set to the last moment of the end date

    const tickets = await Ticket.find({
      createdAt: {
        $gte: startDate, // Greater than or equal to fromDate
        $lte: endDate, // Less than or equal to toDate
      },
    });

    return {
      tickets,
    };
  } catch (err) {
    console.log(err);
    throw new Error("Failed to fetch tickets by date range!");
  }
};

export const fetchProjectsByDateRange = async (fromDate, toDate) => {
  try {
    await connectToDB();
    
    // Convert dates to local timezone
    const localFromDate = moment(fromDate).tz("America/Chicago").startOf('day').toDate();
    const localToDate = moment(toDate).tz("America/Chicago").endOf('day').toDate();
    
    // First get all projects in date range to verify data
    const projects = await Project.aggregate([
      {
        $match: {
          $or: [
            {
              startDate: { 
                $gte: localFromDate, 
                $lte: localToDate 
              }
            },
            {
              endDate: { 
                $gte: localFromDate, 
                $lte: localToDate 
              }
            }
          ]
        }
      },
      {
        $project: {
          month: { $month: "$startDate" },
          status: 1
        }
      },
      {
        $group: {
          _id: "$month",
          notStarted: { 
            $sum: { $cond: [{ $eq: ["$status", "Not Started"] }, 1, 0] }
          },
          completed: { 
            $sum: { $cond: [{ $eq: ["$status", "Completed"] }, 1, 0] }
          },
          inProgress: { 
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          onHold: {
            $sum: { $cond: [{ $eq: ["$status", "On Hold"] }, 1, 0] }
          },
          cancelled: {
            $sum: { $cond: [{ $eq: ["$status", "Cancelled"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    const monthMap = [
      "January", "February", "March", "April", "May", "June",
      "July", "August", "September", "October", "November", "December"
    ];

    // If no data for current month, add an empty entry
    const currentMonth = new Date().getMonth() + 1;
    if (!projects.some(p => p._id === currentMonth)) {
      projects.push({
        _id: currentMonth,
        notStarted: 0,
        completed: 0,
        inProgress: 0,
        onHold: 0,
        cancelled: 0
      });
    }

    const result = projects.map(p => ({
      month: monthMap[p._id - 1],
      notStarted: p.notStarted || 0,
      inProgress: p.inProgress || 0,
      completed: p.completed || 0,
      onHold: p.onHold || 0,
      cancelled: p.cancelled || 0
    }));

    console.log('Final result:', result);
    return result;
  } catch (err) {
    console.error("Error fetching projects by date range:", err);
    throw new Error("Failed to fetch projects report data!");
  }
};

export const fetchAssignmentsByDateRange = async (fromDate, toDate) => {
  try {
    await connectToDB();
    
    const tickets = await Ticket.aggregate([
      {
        $match: {
          assignedTo: { $exists: true, $ne: null },
          createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assigneeInfo"
        }
      },
      {
        $unwind: "$assigneeInfo"
      },
      {
        $group: {
          _id: "$assigneeInfo.username",
          open: { 
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          inProgress: { 
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          onHold: { 
            $sum: { $cond: [{ $eq: ["$status", "On Hold"] }, 1, 0] }
          },
          closed: { 
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return tickets;
  } catch (err) {
    console.error("Error fetching assignments by date range:", err);
    throw new Error("Failed to fetch assignments report data!");
  }
};

export const fetchDepartmentsByDateRange = async (fromDate, toDate) => {
  try {
    await connectToDB();
    
    const departments = await Ticket.aggregate([
      {
        $match: {
          createdAt: { $gte: new Date(fromDate), $lte: new Date(toDate) }
        }
      },
      {
        $group: {
          _id: "$department",
          open: { 
            $sum: { $cond: [{ $eq: ["$status", "Open"] }, 1, 0] }
          },
          inProgress: { 
            $sum: { $cond: [{ $eq: ["$status", "In Progress"] }, 1, 0] }
          },
          onHold: { 
            $sum: { $cond: [{ $eq: ["$status", "On Hold"] }, 1, 0] }
          },
          closed: { 
            $sum: { $cond: [{ $eq: ["$status", "Closed"] }, 1, 0] }
          }
        }
      },
      { $sort: { _id: 1 } }
    ]);

    return departments;
  } catch (err) {
    console.error("Error fetching departments by date range:", err);
    throw new Error("Failed to fetch departments report data!");
  }
};

export const fetchTicketsByUserMonthly = async () => {
  try {
    connectToDB();
    const currentYear = new Date().getFullYear();
    
    const tickets = await Ticket.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $lookup: {
          from: "users",
          localField: "assignedTo",
          foreignField: "_id",
          as: "assignedUser"
        }
      },
      {
        $unwind: "$assignedUser"
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            username: "$assignedUser.username"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.month": 1,
          "_id.username": 1
        }
      }
    ]);

    return tickets;
  } catch (err) {
    console.error("Error fetching tickets by user monthly:", err);
    throw new Error("Failed to fetch tickets by user monthly!");
  }
};

export const fetchTicketsByStatusMonthly = async () => {
  try {
    connectToDB();
    const currentYear = new Date().getFullYear();
    
    const tickets = await Ticket.aggregate([
      {
        $match: {
          createdAt: {
            $gte: new Date(currentYear, 0, 1),
            $lt: new Date(currentYear + 1, 0, 1)
          }
        }
      },
      {
        $group: {
          _id: {
            month: { $month: "$createdAt" },
            status: "$status"
          },
          count: { $sum: 1 }
        }
      },
      {
        $sort: {
          "_id.month": 1
        }
      }
    ]);

    return tickets;
  } catch (err) {
    console.error("Error fetching tickets by status monthly:", err);
    throw new Error("Failed to fetch tickets by status monthly!");
  }
};

export const fetchPubEdEvents = async () => {
  try {
    await connectToDB();
    const events = await PubEdEvent.find({ isActive: true })
      .sort({ date: -1 })
      .populate('createdBy', 'username')
      .lean();

    // Transform the events to ensure proper data structure
    const transformedEvents = events.map(event => ({
      ...event,
      _id: event._id.toString(),
      createdBy: event.createdBy ? {
        ...event.createdBy,
        _id: event.createdBy._id.toString()
      } : null,
      images: Array.isArray(event.images) ? event.images.map(img => ({
        url: img.url || '',
        publicId: img.publicId || '',
        originalFilename: img.originalFilename || ''
      })) : []
    }));

    return { events: transformedEvents };
  } catch (error) {
    console.error('Error fetching events:', error);
    throw new Error('Failed to fetch events');
  }
};

export const fetchPubEdEvent = async (id) => {
  try {
    await connectToDB();
    const event = await PubEdEvent.findOne({
      _id: id,
      isActive: true
    })
    .populate('createdBy', 'username')
    .lean();

    if (!event) return null;

    // Transform the event to ensure proper data structure
    const transformedEvent = {
      ...event,
      _id: event._id.toString(),
      createdBy: event.createdBy ? {
        ...event.createdBy,
        _id: event.createdBy._id.toString()
      } : null,
      images: Array.isArray(event.images) ? event.images.map(img => ({
        url: img.url || '',
        publicId: img.publicId || '',
        originalFilename: img.originalFilename || ''
      })) : []
    };

    return transformedEvent;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw new Error('Failed to fetch event');
  }
};

export const deleteEvent = async (id) => {
  try {
    connectToDB();
    await PubEdEvent.findByIdAndDelete(id);
    return { success: true };
  } catch (err) {
    console.error(err);
    throw new Error("Failed to delete event!");
  }
};
