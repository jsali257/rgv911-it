import { Notification } from '../models/notification';

export const createTicketNotification = async (ticket, type = 'TICKET_CREATED') => {
  try {
    let title, message;
    
    switch (type) {
      case 'TICKET_CREATED':
        title = 'New Ticket Created';
        message = `A new ticket has been created: ${ticket.name}`;
        break;
      case 'TICKET_UPDATED':
        title = 'Ticket Updated';
        message = `Ticket ${ticket.name} has been updated`;
        break;
      case 'TICKET_COMMENT':
        title = 'New Comment on Ticket';
        message = `A new comment has been added to ticket: ${ticket.name}`;
        break;
      default:
        title = 'Ticket Notification';
        message = `Update on ticket: ${ticket.name}`;
    }

    // Create notification for each admin user
    const notification = new Notification({
      userId: ticket.assignedTo || ticket.user, // Assign to ticket owner or assigned user
      type,
      title,
      message,
      ticketId: ticket._id,
      read: false
    });

    await notification.save();
    return notification;
  } catch (error) {
    console.error('Error creating notification:', error);
    return null;
  }
};
