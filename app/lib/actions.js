"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { Ticket, User, Reply, Product, Assignment, Project, PubEdEvent } from "./models";
import { connectToDB } from "./utils";
import bcrypt from "bcrypt";
import { signIn } from "../auth";
import moment from "moment-timezone";
import {
  sendTicketConfirmationEmail,
  sendTicketUpdateEmail,
  sendPasswordResetEmail,
} from "./emailUtils";
import mongoose from "mongoose"; // Import mongoose
import crypto from "crypto"; // Import crypto
import { auth } from "@/app/auth";

const formatDateForMongoDB = (date) => {
  return moment.tz(date, "America/Chicago").format();
};

export const addUser = async (formData) => {
  const {
    username,
    email,
    password,
    phone,
    address,
    isAdmin,
    isActive,
    department,
  } = Object.fromEntries(formData);

  try {
    connectToDB();

    const salt = await bcrypt.genSalt(10);
    const hashedPassword = await bcrypt.hash(password, salt);

    const newUser = new User({
      username,
      email,
      password: hashedPassword,
      phone,
      address,
      isAdmin,
      isActive,
      department,
    });

    await newUser.save();
  } catch (err) {
    console.log(err);
    throw new Error("Failed to create user!");
  }

  revalidatePath("/dashboard/users");
  redirect("/dashboard/users");
};

export const updateUser = async (formData) => {
  const {
    id,
    username,
    email,
    password,
    phone,
    address,
    isAdmin,
    isActive,
    department,
  } = Object.fromEntries(formData);

  if (!id) {
    throw new Error("User ID is required!");
  }

  try {
    connectToDB();

    // Prepare the fields for update
    const updateFields = {
      username,
      email,
      phone,
      address,
      isAdmin: isAdmin === "true",
      isActive: isActive === "true",
      department,
    };

    // If password is provided, hash it and add it to updateFields
    if (password && password !== "") {
      const salt = await bcrypt.genSalt(10);
      const hashedPassword = await bcrypt.hash(password, salt);
      updateFields.password = hashedPassword;
    }

    // Remove any fields that are empty or undefined
    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || updateFields[key] === undefined) &&
        delete updateFields[key]
    );

    // Perform the update
    const updatedUser = await User.findByIdAndUpdate(id, updateFields, {
      new: true,
      runValidators: true,
    });

    if (!updatedUser) {
      throw new Error("User not found");
    }

    return { success: true, message: "User updated successfully" };
  } catch (err) {
    console.error("Update error:", err);
    throw new Error(err.message || "Failed to update user!");
  }
};

export const updateUserProfilePicture = async (formData) => {
  const { id, img } = Object.fromEntries(formData);

  try {
    connectToDB();

    const updatedFields = {};
    if (img) updatedFields.img = img;

    const updatedUser = await User.findByIdAndUpdate(
      id,
      { $set: updatedFields },
      { new: true }
    );

    return updatedUser;
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update user!");
  }
};

export async function addTicket(formData) {
  try {
    await connectToDB();

    const data = {
      name: formData.get("name"),
      email: formData.get("email"),
      phone: formData.get("phone"),
      department: formData.get("department"),
      issue: formData.get("issue"),
      comment: formData.get("comment"),
      status: formData.get("status"),
      assignedDepartment: formData.get("assignedDepartment"),
      attachments: formData.get("attachments")
        ? JSON.parse(formData.get("attachments"))
        : [],
    };

    // Handle user and assignedTo fields
    const userId = formData.get("user");
    const assignedTo = formData.get("assignedTo");

    // Add user and assignedTo if they exist and are valid
    if (userId && mongoose.Types.ObjectId.isValid(userId)) {
      data.user = new mongoose.Types.ObjectId(userId);
    }

    if (assignedTo && mongoose.Types.ObjectId.isValid(assignedTo)) {
      data.assignedTo = new mongoose.Types.ObjectId(assignedTo);
    }

    const newTicket = new Ticket(data);
    await newTicket.save();

    // Send confirmation email
    try {
      await sendTicketConfirmationEmail(newTicket);
    } catch (emailError) {
      console.error("Error sending confirmation email:", emailError);
      // Continue even if email fails
    }

    revalidatePath("/dashboard/tickets");
    return { success: true };
  } catch (err) {
    console.error("Error adding ticket:", err);
    return {
      success: false,
      error: err.message || "Failed to add ticket",
    };
  }
}

export const createTicketApi = async ({
  user,
  name,
  email,
  phone,
  department,
  issue,
  comment,
  status,
}) => {
  await connectToDB();

  const newTicket = new Ticket({
    user,
    name,
    email,
    phone,
    department,
    issue,
    comment,
    status,
  });

  const savedTicket = await newTicket.save();

  // Send confirmation email
  await sendTicketConfirmationEmail(savedTicket);

  return savedTicket;
};

export const addReply = async (formData) => {
  try {
    await connectToDB();

    // Log the incoming data
    console.log('Adding reply with data:', formData);

    // Create new reply with consistent property names
    const newReply = new Reply({
      ticketID: formData.ticketID,
      user: formData.user, // Use user field directly
      text: formData.text,
    });

    // Log the reply object before saving
    console.log('Reply object before save:', newReply);

    const savedReply = await newReply.save();
    console.log('Reply saved successfully:', savedReply);

    revalidatePath(`/dashboard/tickets/${formData.ticketID}`);
    return { message: "Reply added successfully" };
  } catch (err) {
    console.error("Error adding reply:", err);
    // Include more error details in the thrown error
    throw new Error(`Failed to add reply: ${err.message}`);
  }
};

export const deleteReply = async (replyId) => {
  try {
    connectToDB();

    const reply = await Reply.findByIdAndDelete(replyId);
    if (!reply) {
      throw new Error("Reply not found");
    }

    revalidatePath("/dashboard/tickets/[id]");
    return { message: "Reply deleted successfully" };
  } catch (error) {
    console.error("Error deleting reply:", error);
    throw new Error("Failed to delete reply");
  }
};

export const updateTicket = async (formData) => {
  const {
    id,
    name,
    email,
    phone,
    department,
    issue,
    comment,
    status,
    assignedTo,
    assignedDepartment,
  } = Object.fromEntries(formData);

  if (!id) {
    return { error: "Ticket ID is required" };
  }

  try {
    connectToDB();

    // First get the current ticket to check status change
    const currentTicket = await Ticket.findById(id);
    if (!currentTicket) {
      return { error: "Ticket not found!" };
    }

    const updateFields = {
      name,
      email,
      phone,
      department,
      issue,
      comment,
      status,
      assignedTo,
      assignedDepartment,
    };

    // Handle time tracking based on status changes
    if (status && status !== currentTicket.status) {
      const now = new Date();

      // If changing to "In Progress"
      if (status === "In Progress") {
        updateFields.lastStartTime = now;
      }
      // If changing from "In Progress" to another status
      else if (currentTicket.status === "In Progress" && currentTicket.lastStartTime) {
        // Calculate time elapsed since last start
        const elapsedSeconds = Math.floor(
          (now - new Date(currentTicket.lastStartTime)) / 1000
        );
        // Add to total time
        updateFields.totalTime = (currentTicket.totalTime || 0) + elapsedSeconds;
        updateFields.lastStartTime = null;
      }
    }

    // Remove empty fields
    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || updateFields[key] === undefined) &&
        delete updateFields[key]
    );

    const updatedTicket = await Ticket.findByIdAndUpdate(
      id, 
      { $set: updateFields },
      { new: true, runValidators: true }
    );

    if (!updatedTicket) {
      return { error: "Failed to update ticket" };
    }

    // Send update email asynchronously if status or department changed
    if ((status && status !== currentTicket.status) || 
        (assignedDepartment && assignedDepartment !== currentTicket.assignedDepartment)) {
      // Don't await the email sending
      sendTicketUpdateEmail(
        updatedTicket,
        assignedDepartment ? "department" : "status"
      ).catch(emailError => {
        console.error("Failed to send update email:", emailError);
      });
    }

    revalidatePath("/dashboard/tickets");
    return { success: true, ticket: updatedTicket };
  } catch (err) {
    console.error("Failed to update ticket:", err);
    return { error: err.message || "Failed to update ticket" };
  }
};

export const updateTicketStatus = async (ticketId, newStatus) => {
  try {
    const validStatuses = ["Open", "In Progress", "On Hold", "Closed"];
    if (!validStatuses.includes(newStatus)) {
      throw new Error("Invalid status");
    }

    await connectToDB();
    
    const updatedTicket = await Ticket.findByIdAndUpdate(
      ticketId,
      { status: newStatus },
      { new: true }
    );

    if (!updatedTicket) {
      throw new Error("Ticket not found");
    }

    revalidatePath("/dashboard/tickets");
    return { success: true };
  } catch (err) {
    console.error("Error updating ticket status:", err);
    return { success: false, error: err.message };
  }
};

export const escalateTicket = async (formData) => {
  const { id } = Object.fromEntries(formData);

  if (!id) {
    console.error("Escalate Ticket Error: No ID provided");
    throw new Error("Ticket ID is required");
  }

  try {
    // Connect to the database
    await connectToDB();

    // Fetch the ticket by ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      console.error(`Escalate Ticket Error: No ticket found with ID ${id}`);
      throw new Error("Ticket not found");
    }

    // Fetch all users in the RGV911 department
    const itUsers = await User.find({
      department: "RGV911",
    });
    if (!itUsers.length) {
      throw new Error("No IT users found to assign the ticket");
    }

    // Randomly select a user from the list
    const randomIndex = Math.floor(Math.random() * itUsers.length);
    const randomUser = itUsers[randomIndex];

    // Update ticket fields for escalation
    ticket.assignedTo = randomUser._id; // Assign to a random IT user
    ticket.assignedDepartment = "RGV911"; // Set the department as IT
    ticket.status = "In Progress"; // Mark as escalated
    await ticket.save();

    // Log the escalation for debugging purposes
    console.log(
      `Ticket ${id} escalated to IT user ${randomUser._id} (${randomUser.username})`
    );

    // Revalidate and redirect
    revalidatePath("/dashboard/tickets");
    redirect("/dashboard/");
    
  } catch (err) {
    console.error("Failed to escalate ticket:", err);
    throw new Error(err.message || "Failed to escalate ticket!");
  }
};

export const addItem = async (formData) => {
  const { itemName, modelNumber, stock } = Object.fromEntries(formData);

  try {
    await connectToDB();

    const newItem = new Product({
      itemName,
      modelNumber,
      stock: parseInt(stock),
    });

    await newItem.save();
    console.log("Created product:", newItem); // Debugging: Log the document
    return {
      success: true,
      message: "Item added successfully!",
    };
  } catch (err) {
    console.error("Error adding item:", err);
    return {
      success: false,
      error: "Failed to add item.",
    };
  }
};

export const updateItem = async (formData) => {
  const { id, modelNumber, itemName, stock } = Object.fromEntries(formData);

  try {
    connectToDB();

    const updateFields = {
      modelNumber,
      itemName,
      stock,
    };

    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || undefined) && delete updateFields[key]
    );

    await Product.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to update product!");
  }

  revalidatePath("/dashboard/inventory/[id]");
  redirect("/dashboard/inventory");
};

export const assignItem = async (formData) => {
  const { modelNumber, assignedTo, agency, serialNumber } =
    Object.fromEntries(formData);

  try {
    // Validate input
    if (!modelNumber || !assignedTo || !agency || !serialNumber) {
      throw new Error("All fields are required.");
    }

    // Check if there's already an assignment with the same serial number
    const existingAssignment = await Assignment.findOne({
      serialNumber,
    });
    if (existingAssignment) {
      throw new Error("An assignment with this serial number already exists.");
    }

    // Create a new assignment record
    const assignment = new Assignment({
      modelNumber,
      assignedTo,
      agency,
      serialNumber,
    });

    await assignment.save();

    // Find the product by modelNumber
    const product = await Product.findOne({
      modelNumber,
    });
    if (!product) {
      throw new Error("Item not found in inventory.");
    }

    // Check if there is enough stock
    if (product.stock <= 0) {
      throw new Error("Insufficient stock to assign the item.");
    }

    // Decrease the stock by 1
    product.stock -= 1;

    // Save the updated stock for the product
    await product.save();

    // Update inventory to reference the new assignment
    await Product.findOneAndUpdate(
      {
        modelNumber,
      },
      {
        $push: {
          assignments: assignment._id,
        },
      },
      {
        new: true,
      } // Return the updated document
    );

    // Revalidate the path (if applicable)
    revalidatePath("/dashboard/inventory/[id]");

    return {
      success: true,
      message: `Item assigned successfully. Stock Updated: ${product.stock}`,
    };
  } catch (err) {
    console.error(err.message);
    return {
      success: false,
      error: err.message || "Failed to assign item and update stock.",
    };
  }
};

export const unassignItem = async (formData) => {
  const { assignmentId } = Object.fromEntries(formData); // Get assignment ID from form data

  try {
    connectToDB();

    // Find the assignment record
    const assignment = await Assignment.findById(assignmentId);
    if (!assignment) {
      throw new Error("Assignment not found.");
    }

    // Find the associated product by model number
    const product = await Product.findOne({
      modelNumber: assignment.modelNumber,
    });
    if (!product) {
      throw new Error("Item not found in inventory.");
    }

    // Increase the stock by 1
    product.stock += 1;
    await product.save();

    // Remove the assignment reference from the product's assignments array
    await Product.findOneAndUpdate(
      {
        modelNumber: assignment.modelNumber,
      },
      {
        $pull: {
          assignments: assignment._id,
        },
      },
      {
        new: true,
      }
    );

    // Delete the assignment record
    await Assignment.findByIdAndDelete(assignmentId);
    // Trigger revalidation for the specific path (page) after the unassign process is completed
    revalidatePath("/dashboard/inventory/[id]"); // Adjust the path to your actual page path

    return {
      success: true,
      message: `Item unassigned successfully and stock updated. `,
    };
  } catch (err) {
    console.error(err);
    return {
      success: false,
      error: "Failed to unassign item and update stock.",
    };
  }
};

export const addProject = async (formData) => {
  const {
    name,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    status,
    createdBy,
  } = Object.fromEntries(formData);

  // Get all selected team members as an array
  const teamMembers = formData.getAll("teamMembers");

  try {
    connectToDB();

    const newProject = new Project({
      name,
      description,
      startDate: formatDateForMongoDB(startDate),
      endDate: formatDateForMongoDB(endDate),
      startTime: startTime || "09:00",
      endTime: endTime || "17:00",
      status,
      teamMembers,
      createdBy,
    });

    await newProject.save();
  } catch (err) {
    console.error(err);
    throw new Error("Failed to create project!");
  }

  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
};

export const updateProject = async (formData) => {
  const {
    id,
    name,
    description,
    startDate,
    endDate,
    startTime,
    endTime,
    status,
    teamMembers,
  } = formData;

  try {
    await connectToDB();

    const updateFields = {
      name,
      description,
      startDate: startDate ? formatDateForMongoDB(startDate) : undefined,
      endDate: endDate ? formatDateForMongoDB(endDate) : undefined,
      startTime,
      endTime,
      status,
      teamMembers,
    };

    // Remove any fields with empty or undefined values
    Object.keys(updateFields).forEach(
      (key) =>
        (updateFields[key] === "" || updateFields[key] === undefined) &&
        delete updateFields[key]
    );

    await Project.findByIdAndUpdate(id, updateFields);
  } catch (err) {
    console.error(err);
    throw new Error("Failed to update project!");
  }

  revalidatePath("/dashboard/projects");
  redirect("/dashboard/projects");
};

export const deleteUser = async (formData) => {
  const { id } = Object.fromEntries(formData);

  try {
    connectToDB();
    await User.findByIdAndDelete(id);
  } catch (err) {
    console.log(err);
    throw new Error("Failed to delete user!");
  }

  revalidatePath("/dashboard/tickets");
};

export const deleteTicket = async (formData) => {
  const { id } = Object.fromEntries(formData);

  if (!id) {
    console.error("Delete Ticket Error: No ID provided");
    throw new Error("Ticket ID is required");
  }

  try {
    await connectToDB();
    const result = await Ticket.findByIdAndDelete(id);
    
    if (!result) {
      console.error(`Delete Ticket Error: No ticket found with ID ${id}`);
      throw new Error("Ticket not found");
    }

    revalidatePath("/dashboard/tickets");
    return { success: true };
  } catch (err) {
    console.error("Failed to delete ticket:", err);
    throw new Error(err.message || "Failed to delete ticket!");
  }
};

export const authenticate = async (prevState, formData) => {
  const { username, password } = Object.fromEntries(formData);

  try {
    const res = await signIn("credentials", {
      username,
      password,
      redirect: false,
    });

    if (res?.error) {
      return "Invalid username or password";
    }

    return { success: true };
  } catch (err) {
    console.log("Authentication error:", err);
    return "Invalid username or password";
  }
};

export const sendPasswordResetRequest = async (userId) => {
  try {
    connectToDB();

    // Find the user
    const user = await User.findById(userId);
    console.log(
      "Found user for reset:",
      user ? user.username : "No user found"
    );

    if (!user) {
      throw new Error("User not found");
    }

    // Generate a reset token (random string)
    const resetToken = crypto.randomBytes(32).toString("hex");
    const resetTokenExpiry = new Date(Date.now() + 3600000); // 1 hour from now

    console.log("Generated token:", resetToken);
    console.log("Token expiry:", resetTokenExpiry);

    // Save the reset token and expiry to the user
    const updatedUser = await User.findByIdAndUpdate(
      userId,
      {
        resetToken,
        resetTokenExpiry,
      },
      { new: true } // Return the updated document
    );

    console.log("Updated user reset token:", updatedUser.resetToken);
    console.log("Updated user token expiry:", updatedUser.resetTokenExpiry);

    // Send the reset email
    await sendPasswordResetEmail(user, resetToken);

    return { success: true, message: "Password reset email sent successfully" };
  } catch (err) {
    console.error("Password reset error:", err);
    throw new Error(err.message || "Failed to send password reset email!");
  }
};

export const createEvent = async (formData) => {
  try {
    connectToDB();

    const session = await auth();
    if (!session?.user) {
      return { error: "You must be logged in to create an event" };
    }

    // Get form data
    const title = formData.get('title');
    const description = formData.get('description');
    const date = formData.get('date');
    const imagesJson = formData.get('images');

    // Validate required fields
    if (!title || !description || !date) {
      return { error: "Missing required fields" };
    }

    // Parse images data
    let images = [];
    try {
      images = JSON.parse(imagesJson || '[]');
    } catch (err) {
      console.error('Error parsing images:', err);
      images = [];
    }

    // Create new event
    const newEvent = new PubEdEvent({
      title,
      description,
      date: new Date(date),
      images,
      createdBy: session.user.id
    });

    await newEvent.save();
    
    // Revalidate the path
    revalidatePath("/dashboard/pubEdEvents");
    
    // Return success instead of redirecting
    return { success: true };
  } catch (err) {
    console.error("Error creating event:", err);
    return { error: err.message || "Error creating event" };
  }
};

export const updateEvent = async (formData) => {
  const { id, title, date, description, images, updatedBy } = Object.fromEntries(formData);

  try {
    connectToDB();

    // Parse images from JSON string
    const parsedImages = JSON.parse(images);

    // Create event date (without time)
    const eventDate = date ? new Date(date) : new Date();
    eventDate.setHours(0, 0, 0, 0);

    const updatedEvent = await PubEdEvent.findByIdAndUpdate(
      id,
      {
        $set: {
          title,
          date: eventDate,
          description,
          images: parsedImages,
          updatedBy,
          updatedAt: new Date()
        }
      },
      { new: true }
    );

    if (!updatedEvent) {
      return { error: 'Event not found' };
    }

    revalidatePath('/dashboard/pubEdEvents');
    return { success: true };
  } catch (err) {
    console.error('Error updating event:', err);
    return { error: 'Failed to update event' };
  }
};

export const deleteEvent = async (id) => {
  try {
    connectToDB();
    await PubEdEvent.findByIdAndDelete(id);
    revalidatePath("/dashboard/pubEdEvents");
    return { success: true };
  } catch (err) {
    console.error(err);
    return { success: false, error: err.message };
  }
};

export async function deleteAttachment(ticketId, attachmentUrl) {
  try {
    // Ensure we have a valid base URL
    let baseUrl;
    if (typeof window !== 'undefined') {
      baseUrl = window.location.origin;
      if (!baseUrl.startsWith('http')) {
        baseUrl = window.location.protocol + '//' + window.location.host;
      }
    } else {
      baseUrl = process.env.NEXT_PUBLIC_APP_URL || 'http://localhost:3000';
    }

    // Construct the full URL
    const apiUrl = new URL(`/api/tickets/${ticketId}/attachments`, baseUrl).toString();

    console.log('Deleting attachment:', { ticketId, attachmentUrl, apiUrl });

    const response = await fetch(apiUrl, {
      method: 'DELETE',
      headers: {
        'Content-Type': 'application/json',
      },
      body: JSON.stringify({ attachmentUrl }),
    });

    const data = await response.json();

    if (!response.ok) {
      console.error('Server error:', data);
      return { error: data.error || data.details || 'Failed to delete attachment' };
    }

    return { success: true };
  } catch (error) {
    console.error('Client error in deleteAttachment:', error);
    return { error: error.message || 'Failed to delete attachment' };
  }
}
