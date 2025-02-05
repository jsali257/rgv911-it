"use client";

import { deleteTicket, escalateTicket } from "@/app/lib/actions";
import DeleteButton from "../deleteTicketButton/deleteTicketButton";
import EscalateButton from "../escalateButton/escalateButton";
import styles from "./transactions.module.css";
import ProgressBar from "../progressBar/progressBar";
import { FaUser, FaEnvelope, FaPhone, FaBuilding, FaExclamationCircle, FaClock } from 'react-icons/fa';

const TransactionCard = ({ ticket, user, view = "table" }) => {
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

  const isLRGVDCUser = user?.department === "LRGVDC";

  const handleClick = () => {
    window.location.href = `/dashboard/tickets/${ticket.id}`;
  };

  if (view === "table") {
    return (
      <tr className={styles.row} onClick={handleClick}>
        <td>
          <div className={styles.infoRow}>
            <FaUser className={styles.icon} />
            {ticket.name}
          </div>
        </td>
        <td>
          <div className={styles.infoRow}>
            <FaExclamationCircle className={styles.icon} />
            {ticket.issue}
          </div>
        </td>
        <td>
          <div className={styles.infoRow}>
            <FaEnvelope className={styles.icon} />
            {ticket.email}
          </div>
        </td>
        <td>
          <div className={styles.infoRow}>
            <FaPhone className={styles.icon} />
            {ticket.phone}
          </div>
        </td>
        <td>
          <div className={styles.infoRow}>
            <FaBuilding className={styles.icon} />
            {ticket.department}
          </div>
        </td>
        <td>
          <span className={getStatusClassName(ticket.status)}>
            {ticket.status}
          </span>
        </td>
        <td>
          <div className={styles.infoRow}>
            <FaClock className={styles.icon} />
            {ticket.createdAt?.toString().slice(4, 16)}
          </div>
        </td>
        <td>
          <div className={styles.buttons} onClick={(e) => e.stopPropagation()}>
            <form action={deleteTicket}>
              <input type="hidden" name="id" value={ticket.id} />
              <DeleteButton />
            </form>
            {isLRGVDCUser && (
              <form action={escalateTicket} method="POST">
                <input type="hidden" name="id" value={ticket._id} />
                <EscalateButton
                  disabled={ticket.assignedDepartment !== user.department}
                  className={
                    ticket.assignedDepartment !== user.department
                      ? styles.disabled
                      : ""
                  }
                />
              </form>
            )}
          </div>
        </td>
      </tr>
    );
  }

  return (
    <div className={styles.ticketCard} onClick={handleClick}>
      <div className={styles.cardHeader}>
        <div className={styles.nameContainer}>
          <FaUser className={styles.icon} />
          <h4>{ticket.name}</h4>
        </div>
        <span className={getStatusClassName(ticket.status)}>
          {ticket.status}
        </span>
      </div>
      <div className={styles.cardIssue}>
        <FaExclamationCircle className={styles.icon} />
        <p>{ticket.issue}</p>
      </div>
      <div className={styles.cardDetails}>
        <div className={styles.infoRow}>
          <FaEnvelope className={styles.icon} />
          <span>{ticket.email}</span>
        </div>
        <div className={styles.infoRow}>
          <FaPhone className={styles.icon} />
          <span>{ticket.phone}</span>
        </div>
        <div className={styles.infoRow}>
          <FaBuilding className={styles.icon} />
          <span>{ticket.department}</span>
        </div>
      </div>
      <div className={styles.cardProgress}>
        <ProgressBar status={ticket.status} />
      </div>
      <div className={styles.cardFooter}>
        <div className={styles.infoRow}>
          <FaClock className={styles.icon} />
          <span>{ticket.createdAt?.toString().slice(4, 16)}</span>
        </div>
        <div
          className={styles.cardActions}
          onClick={(e) => e.stopPropagation()}
        >
          <form action={deleteTicket}>
            <input type="hidden" name="id" value={ticket.id} />
            <DeleteButton />
          </form>
          {isLRGVDCUser && (
            <form action={escalateTicket} method="POST">
              <input type="hidden" name="id" value={ticket._id} />
              <EscalateButton
                disabled={ticket.assignedDepartment !== user.department}
                className={
                  ticket.assignedDepartment !== user.department
                    ? styles.disabled
                    : ""
                }
              />
            </form>
          )}
        </div>
      </div>
    </div>
  );
};

export default TransactionCard;
