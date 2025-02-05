import { connectToDB } from "@/app/lib/utils";
import { Ticket } from "@/app/lib/models";

export async function PUT(req) {
  try {
    const {
      id, // Ticket ID
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
    if (!id) {
      return new Response(JSON.stringify({ error: "Ticket ID is required!" }), {
        status: 400,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Connect to the database
    await connectToDB();

    // Find the ticket by ID
    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found!" }), {
        status: 404,
        headers: {
          "Content-Type": "application/json",
        },
      });
    }

    // Update the ticket fields
    ticket.name = name || ticket.name;
    ticket.email = email || ticket.email;
    ticket.phone = phone || ticket.phone;
    ticket.department = department || ticket.department;
    ticket.issue = issue || ticket.issue;
    ticket.status = status || ticket.status;
    ticket.comment = comment || ticket.comment;
    ticket.assignedTo = assignedTo || ticket.assignedTo;
    ticket.assignedDepartment = assignedDepartment || ticket.assignedDepartment;

    // Save the updated ticket
    await ticket.save();

    return new Response(
      JSON.stringify({
        message: "Ticket updated!",
        ticket,
      }),
      {
        status: 200,
        headers: {
          "Content-Type": "application/json",
        },
      }
    );
  } catch (err) {
    console.error("Error updating ticket:", err);
    return new Response(
      JSON.stringify({
        error: "Failed to update ticket!",
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
