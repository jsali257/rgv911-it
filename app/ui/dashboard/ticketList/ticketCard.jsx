"use client";

import React from 'react';
import { useDrag } from 'react-dnd';
import styles from './ticketCard.module.css';
import Link from 'next/link';
import { FaUser, FaEnvelope, FaBuilding, FaExclamationCircle, FaClock, FaUserCircle } from 'react-icons/fa';
import DeleteButton from "../deleteTicketButton/deleteTicketButton";
import EscalateButton from "../escalateButton/escalateButton";
import { deleteTicket, escalateTicket } from "@/app/lib/actions";
import ProgressBar from "../progressBar/progressBar";

const ItemTypes = {
  TICKET: 'ticket'
};

const TicketCard = ({ ticket, isLRGVDCUser, user }) => {
  const [{ isDragging }, drag] = useDrag({
    type: ItemTypes.TICKET,
    item: { id: ticket.id, type: ItemTypes.TICKET },
    collect: (monitor) => ({
      isDragging: monitor.isDragging(),
    }),
  });

  const getStatusClassName = (status) => {
    switch (status) {
      case "Open":
        return styles.statusOpen;
      case "In Progress":
        return styles.statusInProgress;
      case "On Hold":
        return styles.statusOnHold;
      case "Closed":
        return styles.statusClosed;
      default:
        return "";
    }
  };

  return (
    <div
      ref={drag}
      className={`${styles.cardContainer} ${isDragging ? styles.isDragging : ''}`}
      style={{ opacity: isDragging ? 0.5 : 1 }}
    >
      <Link href={`/dashboard/tickets/${ticket.id}`} className={styles.cardLink} onClick={(e) => e.stopPropagation()}>
        <div className={styles.card}>
          <div className={styles.cardHeader}>
            <div className={`${styles.status} ${getStatusClassName(ticket.status)}`}>
              {ticket.status}
            </div>
            <div className={styles.date}>
              <FaClock className={styles.icon} />
              {ticket.createdAt?.toString().slice(4, 16)}
            </div>
          </div>
          
          <div className={styles.cardBody}>
            <div className={styles.infoRow}>
              <FaUser className={styles.icon} />
              <span>{ticket.name}</span>
            </div>
            <div className={styles.infoRow}>
              <FaEnvelope className={styles.icon} />
              <span>{ticket.email}</span>
            </div>
            <div className={styles.infoRow}>
              <FaBuilding className={styles.icon} />
              <span>{ticket.department}</span>
            </div>
            <div className={styles.infoRow}>
              <FaExclamationCircle className={styles.icon} />
              <span>{ticket.issue}</span>
            </div>
            <div className={styles.infoRow}>
              <FaUserCircle className={styles.icon} />
              <span>Assigned to: {
                typeof ticket.assignedTo === 'string' 
                  ? ticket.assignedTo 
                  : ticket.assignedTo 
                    ? ticket.assignedTo.username 
                    : 'Unassigned'
              }</span>
            </div>
            <div className={styles.cardProgress}>
              <ProgressBar status={ticket.status} />
            </div>
          </div>

          <div className={styles.cardActions} onClick={(e) => e.preventDefault()}>
            <DeleteButton ticketId={ticket._id} />
            {isLRGVDCUser && (
              <EscalateButton 
                ticketId={ticket._id}
                disabled={ticket.assignedDepartment !== user.department}
                className={ticket.assignedDepartment !== user.department ? styles.disabled : ''}
              />
            )}
          </div>
        </div>
      </Link>
    </div>
  );
};

export default TicketCard;
