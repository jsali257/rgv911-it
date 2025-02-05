import { connectToDB } from "@/app/lib/utils";
import { Reply } from "@/app/lib/models";
import mongoose from "mongoose";

export async function POST(req) {
  try {
    const { ticketID, userID, text } = await req.json();

    // Validate input
    if (!ticketID || !userID || !text) {
      return new Response(
        JSON.stringify({
          error: "All fields (ticketID, userID, text) are required!",
        }),
        { status: 400, headers: { "Content-Type": "application/json" } }
      );
    }

    // Connect to the database
    await connectToDB();

    // Convert userID to ObjectId
    const userObjectId = mongoose.Types.ObjectId(userID);

    // Create a new reply
    const reply = new Reply({ ticketID, userID: userObjectId, text });
    await reply.save();

    return new Response(
      JSON.stringify({ message: "Reply created successfully!", reply }),
      { status: 201, headers: { "Content-Type": "application/json" } }
    );
  } catch (error) {
    console.error("Error creating reply:", error);
    return new Response(JSON.stringify({ error: "Failed to create reply!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
