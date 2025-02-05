import { NextResponse } from "next/server";
import { fetchPubEdEvents } from "@/app/lib/data";
import { auth } from "@/app/auth";
import { PubEdEvent } from "@/app/lib/models";

export const dynamic = 'force-dynamic'; // Disable static rendering

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET() {
  try {
    const events = await fetchPubEdEvents();
    
    // Add CORS headers to allow external access
    return NextResponse.json(
      { 
        events,
        message: "Events fetched successfully" 
      }, 
      { 
        status: 200,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        message: "Error fetching events",
        error: error.message 
      }, 
      { 
        status: 500,
        headers: {
          'Access-Control-Allow-Origin': '*',
          'Access-Control-Allow-Methods': 'GET',
          'Access-Control-Allow-Headers': 'Content-Type',
        }
      }
    );
  }
}

export async function POST(request) {
  try {
    // Check authentication
    const session = await auth();
    if (!session) {
      return NextResponse.json({ message: "Unauthorized" }, { status: 401 });
    }

    const data = await request.json();
    const event = await PubEdEvent.create({
      ...data,
      createdBy: session.user.id
    });

    return NextResponse.json(
      { 
        event,
        message: "Event created successfully" 
      }, 
      { status: 201 }
    );
  } catch (error) {
    return NextResponse.json(
      { 
        message: "Error creating event",
        error: error.message 
      }, 
      { status: 500 }
    );
  }
}
