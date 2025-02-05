"use client"; // Ensure this is a Client Component
import styles from "@/app/ui/dashboard/inventory/inventory.module.css";

import React from "react";

const UnAssignmentButton = () => {
  const handleDelete = async (e) => {
    e.preventDefault();
    const confirmDeletion = confirm("Are you sure you want to unassign Item?");
    if (confirmDeletion) {
      const form = e.target.closest("form");
      if (form) {
        form.requestSubmit();
      }
    }
  };

  return (
    <button
      type="button"
      onClick={handleDelete}
      className={`${styles.button} ${styles.delete}`}
    >
      Unassign
    </button>
  );
};

export default UnAssignmentButton;
