"use client"; // Ensure this is a Client Component

import React from "react";
import { FaTrash } from "react-icons/fa";
import styles from "./deleteTicketButton.module.css";
import { useConfirm } from "../../context/ConfirmContext";
import { deleteTicket } from "@/app/lib/actions";

const DeleteButton = ({ className, ticketId }) => {
  const { showConfirm } = useConfirm();

  const handleDelete = async () => {
    try {
      const formData = new FormData();
      formData.append('id', ticketId);
      await deleteTicket(formData);
    } catch (error) {
      console.error('Failed to delete ticket:', error);
    }
  };

  const handleClick = () => {
    showConfirm({
      title: "Delete Ticket",
      message: "Are you sure you want to delete this ticket? This action cannot be undone.",
      confirmText: "Delete",
      type: "warning",
      onConfirm: handleDelete
    });
  };

  return (
    <button
      type="button"
      onClick={handleClick}
      className={`${styles.deleteButton} ${className}`}
      title="Delete Ticket"
    >
      <FaTrash />
    </button>
  );
};

export default DeleteButton;
