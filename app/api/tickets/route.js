// app/api/tickets/route.js
import {
  connectToDB
} from "@/app/lib/utils";
import {
  Ticket
} from "@/app/lib/models";

export async function POST(req) {
  try {
    const {
      query
    } = await req.json();
    const regex = new RegExp(query || "", "i");

    await connectToDB();

    const tickets = await Ticket.find({
      $or: [{
          name: {
            $regex: regex
          }
        },
        {
          email: {
            $regex: regex
          }
        },
        {
          phone: {
            $regex: regex
          }
        },
      ],
    });

    return new Response(JSON.stringify({
      tickets
    }), {
      status: 200,
      headers: {
        "Content-Type": "application/json"
      },
    });
  } catch (err) {
    console.error(err);
    return new Response(JSON.stringify({
      error: "Failed to fetch tickets!"
    }), {
      status: 500,
      headers: {
        "Content-Type": "application/json"
      },
    });
  }
}