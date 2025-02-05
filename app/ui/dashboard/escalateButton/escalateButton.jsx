"use client"; // Ensure this is a Client Component

import React from "react";
import { FaArrowUp } from "react-icons/fa";
import styles from "./escalateButton.module.css";
import { useConfirm } from "../../context/ConfirmContext";
import { escalateTicket } from "@/app/lib/actions";

const EscalateButton = ({ className, disabled, ticketId }) => {
  const { showConfirm } = useConfirm();

  const handleEscalate = async () => {
    try {
      const formData = new FormData();
      formData.append('id', ticketId);
      await escalateTicket(formData);
    } catch (error) {
      console.error('Failed to escalate ticket:', error);
    }
  };

  const handleClick = () => {
    if (disabled) return;
    
    showConfirm({
      title: "Escalate Ticket",
      message: "Are you sure you want to escalate this ticket? This will notify the appropriate department.",
      confirmText: "Escalate",
      type: "info",
      onConfirm: handleEscalate
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.escalateButton} ${disabled ? styles.disabled : ''} ${className || ''}`}
      disabled={disabled}
      title={disabled ? "You can only escalate tickets assigned to your department" : "Escalate Ticket"}
    >
      <FaArrowUp />
    </button>
  );
};

export default EscalateButton;