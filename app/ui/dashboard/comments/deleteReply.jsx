"use client";

import { deleteReply } from "@/app/lib/actions";
import styles from "./comments.module.css";
import { FaTrash } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import Toast from "@/app/ui/dashboard/toast/toast";

const DeleteReply = ({ replyId, currentUserId, replyUserId }) => {
  const router = useRouter();
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleDelete = async () => {
    if (!confirm("Are you sure you want to delete this reply?")) {
      return;
    }

    try {
      await deleteReply(replyId);
      setToastMessage("Reply deleted successfully!");
      setToastType("delete"); 
      setShowToast(true);
      router.refresh();
    } catch (error) {
      console.error("Failed to delete reply:", error);
      setToastMessage("Failed to delete reply. Please try again.");
      setToastType("error");
      setShowToast(true);
    }
  };

  // Show delete button if user is the author
  const showDeleteButton = currentUserId && replyUserId && currentUserId.toString() === replyUserId.toString();

  if (!showDeleteButton) {
    return null;
  }

  return (
    <>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      <button 
        onClick={handleDelete}
        className={styles.deleteButton}
        title="Delete reply"
      >
        <FaTrash size={14} />
      </button>
    </>
  );
};

export default DeleteReply;
