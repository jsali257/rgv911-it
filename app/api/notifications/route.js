import { connectToDB } from "@/app/lib/utils";
import { Ticket } from "@/app/lib/models";
import { auth } from "@/app/auth";

// Get notifications
export async function GET(req) {
  try {
    await connectToDB();
    const session = await auth();

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    // Get the last check time from headers or use a default (30 minutes ago)
    const lastCheck = req.headers.get("last-check") || new Date(Date.now() - 30 * 60 * 1000).toISOString();

    // Find tickets that were created or updated since the last check
    const notifications = await Ticket.find({
      $or: [
        { createdAt: { $gte: new Date(lastCheck) } },
        { updatedAt: { $gte: new Date(lastCheck) } }
      ],
      // Exclude tickets created by the current user
      user: { $ne: session.user.id },
      // Exclude tickets where the current user is in readBy
      'readBy.user': { $ne: session.user.id }
    })
    .sort({ createdAt: -1 })
    .limit(50)
    .populate('user', 'username')
    .lean();

    // Transform tickets into notification format
    const formattedNotifications = notifications.map(ticket => ({
      _id: ticket._id,
      title: ticket.name,
      message: `Ticket: ${ticket.issue}`,
      createdAt: ticket.createdAt,
      updatedAt: ticket.updatedAt,
      ticketId: ticket._id,
      status: ticket.status,
      department: ticket.department,
      creator: ticket.user?.username || 'Unknown',
      read: false
    }));

    return new Response(JSON.stringify({ notifications: formattedNotifications }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error fetching notifications:", err);
    return new Response(JSON.stringify({ error: "Failed to fetch notifications" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Mark notifications as read
export async function PUT(req) {
  try {
    await connectToDB();
    const session = await auth();
    const body = await req.json();
    
    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    if (body.all) {
      // Mark all notifications as read
      const lastCheck = body.lastCheck || new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      await Ticket.updateMany(
        {
          $or: [
            { createdAt: { $gte: new Date(lastCheck) } },
            { updatedAt: { $gte: new Date(lastCheck) } }
          ],
          user: { $ne: session.user.id },
          'readBy.user': { $ne: session.user.id }
        },
        {
          $push: {
            readBy: {
              user: session.user.id,
              readAt: new Date()
            }
          }
        }
      );
    } else if (body.notificationId) {
      // Mark single notification as read
      await Ticket.findOneAndUpdate(
        {
          _id: body.notificationId,
          user: { $ne: session.user.id },
          'readBy.user': { $ne: session.user.id }
        },
        {
          $push: {
            readBy: {
              user: session.user.id,
              readAt: new Date()
            }
          }
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error updating notifications:", err);
    return new Response(JSON.stringify({ error: "Failed to update notifications" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}

// Delete notifications (marks them as read)
export async function DELETE(req) {
  try {
    await connectToDB();
    const session = await auth();

    if (!session?.user?.id) {
      return new Response(JSON.stringify({ error: "Unauthorized" }), {
        status: 401,
        headers: { "Content-Type": "application/json" },
      });
    }

    const body = await req.json();

    if (body.all) {
      // Get the last check time to only clear notifications up to that point
      const lastCheck = body.lastCheck || new Date(Date.now() - 30 * 60 * 1000).toISOString();
      
      // Mark notifications as read for this user
      await Ticket.updateMany(
        {
          $or: [
            { createdAt: { $gte: new Date(lastCheck) } },
            { updatedAt: { $gte: new Date(lastCheck) } }
          ],
          user: { $ne: session.user.id },
          'readBy.user': { $ne: session.user.id }
        },
        {
          $push: {
            readBy: {
              user: session.user.id,
              readAt: new Date()
            }
          }
        }
      );
    } else if (body.notificationId) {
      // Mark single notification as read
      await Ticket.findOneAndUpdate(
        {
          _id: body.notificationId,
          user: { $ne: session.user.id },
          'readBy.user': { $ne: session.user.id }
        },
        {
          $push: {
            readBy: {
              user: session.user.id,
              readAt: new Date()
            }
          }
        }
      );
    }

    return new Response(JSON.stringify({ success: true }), {
      status: 200,
      headers: { "Content-Type": "application/json" },
    });
  } catch (err) {
    console.error("Error clearing notifications:", err);
    return new Response(JSON.stringify({ error: "Failed to clear notifications" }), {
      status: 500,
      headers: { "Content-Type": "application/json" },
    });
  }
}
