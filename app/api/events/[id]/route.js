import { NextResponse } from "next/server";
import { fetchPubEdEvent } from "@/app/lib/data";

export const dynamic = 'force-dynamic'; // Disable static rendering

// Handle CORS preflight requests
export async function OPTIONS() {
  return new NextResponse(null, {
    status: 200,
    headers: {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET',
      'Access-Control-Allow-Headers': 'Content-Type',
    },
  });
}

export async function GET(req, { params }) {
  try {
    const { id } = params;
    const event = await fetchPubEdEvent(id);
    
    if (!event) {
      return NextResponse.json(
        { message: "Event not found" }, 
        { 
          status: 404,
          headers: {
            'Access-Control-Allow-Origin': '*',
            'Access-Control-Allow-Methods': 'GET',
            'Access-Control-Allow-Headers': 'Content-Type',
          }
        }
      );
    }

    return NextResponse.json(
      { 
        event,
        message: "Event fetched successfully" 
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
        message: "Error fetching event",
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
