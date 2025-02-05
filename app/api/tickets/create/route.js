import { connectToDB } from "@/app/lib/utils";
import { Ticket } from "@/app/lib/models";

export async function POST(req) {
  try {
    const {
      user,
      name,
      email,
      phone,
      department,
      issue,
      status,
      comment,
      assignedTo,
      assignedDepartment,
    } = await req.json();

    // Validate input
    if (
      !user ||
      !name ||
      !email ||
      !phone ||
      !department ||
      !issue ||
      !comment ||
      !assignedTo ||
      !assignedDepartment
    ) {
      return new Response(
        JSON.stringify({
          error: "All fields are required!",
        }),
        {
          status: 400,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    const ticketStatus = status || "Open"; // Default status is "Open"

    // Connect to the database
    await connectToDB();

    // Create a new ticket
    const newTicket = new Ticket({
      user,
      name,
      email,
      phone,
      department,
      issue,
      comment,
      status: ticketStatus,
      createdAt: new Date(),
      assignedTo,
      assignedDepartment,
    });

    // Save the ticket to the database
    await newTicket.save();

    return new Response(
      JSON.stringify({
        message: "Ticket created!",
        ticket: newTicket,
      }),
      {
        status: 201,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error creating ticket:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to create ticket!",
      }),
      {
        status: 500,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  }
}
