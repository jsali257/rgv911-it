import { connectToDB } from "@/app/lib/utils";
import { Ticket } from "@/app/lib/models";
import { v2 as cloudinary } from 'cloudinary';

// Configure Cloudinary
cloudinary.config({
  cloud_name: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
  api_key: process.env.CLOUDINARY_API_KEY,
  api_secret: process.env.CLOUDINARY_API_SECRET,
});

function getPublicIdFromUrl(url) {
  try {
    // Extract the filename without extension
    const matches = url.match(/\/v\d+\/([^/]+)\.[^.]+$/);
    if (matches && matches[1]) {
      return matches[1];
    }
    return null;
  } catch (error) {
    console.error('Error extracting public ID:', error);
    return null;
  }
}

export async function DELETE(req, { params }) {
  try {
    const { id } = params;
    const body = await req.json();
    const { attachmentUrl } = body;

    console.log('Received delete request:', { ticketId: id, attachmentUrl });

    if (!id || !attachmentUrl) {
      console.error('Missing required fields:', { id, attachmentUrl });
      return Response.json(
        { error: "Ticket ID and attachment URL are required!" },
        { status: 400 }
      );
    }

    await connectToDB();
    console.log('Connected to database');

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      console.error('Ticket not found:', id);
      return Response.json(
        { error: "Ticket not found!" },
        { status: 404 }
      );
    }

    // Find the attachment
    const attachment = ticket.attachments.find(att => att.url === attachmentUrl);
    if (!attachment) {
      console.error('Attachment not found:', attachmentUrl);
      return Response.json(
        { error: "Attachment not found!" },
        { status: 404 }
      );
    }

    // Try to delete from Cloudinary
    const publicId = getPublicIdFromUrl(attachmentUrl);
    if (publicId) {
      try {
        console.log('Attempting to delete from Cloudinary:', publicId);
        const result = await cloudinary.uploader.destroy(publicId);
        console.log('Cloudinary deletion result:', result);
      } catch (cloudinaryError) {
        console.error('Cloudinary deletion error:', cloudinaryError);
        // Continue with database update even if Cloudinary fails
      }
    }

    // Update the ticket
    const previousLength = ticket.attachments.length;
    ticket.attachments = ticket.attachments.filter(att => att.url !== attachmentUrl);

    if (ticket.attachments.length === previousLength) {
      console.warn('No attachments were removed from array');
    } else {
      console.log('Attachment removed from array');
    }

    await ticket.save();
    console.log('Ticket saved successfully');

    return Response.json(
      { message: "Attachment deleted successfully" },
      { status: 200 }
    );
  } catch (err) {
    console.error('Error in DELETE handler:', err);
    return Response.json(
      { 
        error: "Failed to delete attachment!",
        details: err.message 
      },
      { status: 500 }
    );
  }
}

export async function POST(req, { params }) {
  try {
    const { id } = params;
    const { attachments } = await req.json();

    if (!id || !attachments) {
      return new Response(
        JSON.stringify({ error: "Ticket ID and attachments are required!" }),
        {
          status: 400,
          headers: { "Content-Type": "application/json" },
        }
      );
    }

    await connectToDB();

    const ticket = await Ticket.findById(id);
    if (!ticket) {
      return new Response(JSON.stringify({ error: "Ticket not found!" }), {
        status: 404,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Add new attachments to the array
    ticket.attachments = [...ticket.attachments, ...attachments];

    await ticket.save();

    return new Response(
      JSON.stringify({ message: "Attachments added successfully" }),
      {
        status: 200,
        headers: { "Content-Type": "application/json" },
      }
    );
  } catch (err) {
    console.error("Error adding attachments:", err);
    return new Response(JSON.stringify({ error: "Failed to add attachments!" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
