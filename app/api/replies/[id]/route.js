import { connectToDB } from "@/app/lib/utils";
import { Reply } from "@/app/lib/models";

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

    // Find the replies by ticket ID
    const replies = await Reply.find({ ticketID: id })
      .populate("userID") // Optionally populate user information
      .sort({ createdAt: -1 }); // Sort by the most recent reply

    if (!replies || replies.length === 0) {
      return new Response(
        JSON.stringify({ error: "No replies found for this ticket." }),
        {
          status: 404,
          headers: {
            "Content-Type": "application/json",
          },
        }
      );
    }

    // Return the replies data
    return new Response(JSON.stringify({ replies }), {
      status: 200,
      headers: {
        "Content-Type": "application/json",
      },
    });
  } catch (err) {
    console.error("Error fetching replies:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch replies!" }), {
      status: 500,
      headers: {
        "Content-Type": "application/json",
      },
    });
  }
}
