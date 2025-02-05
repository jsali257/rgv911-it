import { connectToDB } from "@/app/lib/utils";
import { Ticket } from "@/app/lib/models";

export async function GET(req, { params }) {
  try {
    const { id } = params; // Get the ticket ID from the route params

    // Validate the ID
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

    // Return the ticket data
    return new Response(JSON.stringify({ ticket }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error fetching ticket:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch ticket!" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
