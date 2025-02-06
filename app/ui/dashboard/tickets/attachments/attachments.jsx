"use client";

import styles from "./attachments.module.css";
import { FaFilePdf, FaFileImage, FaFileAlt, FaTrash, FaTimes } from "react-icons/fa";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { deleteAttachment } from "@/app/lib/actions";

const ConfirmDialog = ({ isOpen, onClose, onConfirm, filename }) => {
  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modalContent}>
        <button className={styles.closeButton} onClick={onClose}>
          <FaTimes />
        </button>
        <div className={styles.modalHeader}>
          <h3>Delete Attachment</h3>
        </div>
        <div className={styles.modalBody}>
          <p>Are you sure you want to delete &quot;{filename}&quot;?</p>
          <p className={styles.modalWarning}>This action cannot be undone.</p>
        </div>
        <div className={styles.modalFooter}>
          <button className={styles.cancelButton} onClick={onClose}>
            Cancel
          </button>
          <button className={styles.confirmButton} onClick={onConfirm}>
            Delete
          </button>
        </div>
      </div>
    </div>
  );
};

const FileIcon = ({ filetype }) => {
  const type = filetype?.toLowerCase();
  
  if (type?.includes("pdf")) {
    return <FaFilePdf className={styles.fileIcon} />;
  } else if (type?.includes("image") || ["jpg", "jpeg", "png", "gif"].includes(type)) {
    return <FaFileImage className={styles.fileIcon} />;
  } else {
    return <FaFileAlt className={styles.fileIcon} />;
  }
};

const AttachmentsList = ({ attachments, ticketId }) => {
  const router = useRouter();
  const [isDeleting, setIsDeleting] = useState(false);
  const [confirmDialog, setConfirmDialog] = useState({ isOpen: false, file: null });

  if (!attachments || attachments.length === 0) {
    return (
      <div className={styles.attachmentsContainer}>
        <h3>Attachments</h3>
        <div className={styles.noAttachments}>
          No attachments have been added to this ticket yet.
        </div>
      </div>
    );
  }

  const handleDelete = async () => {
    if (isDeleting || !confirmDialog.file) return;

    try {
      setIsDeleting(true);
      const result = await deleteAttachment(ticketId, confirmDialog.file.url);
      
      if (result?.error) {
        throw new Error(result.error);
      }

      setConfirmDialog({ isOpen: false, file: null });
      router.refresh();
    } catch (error) {
      console.error('Error deleting attachment:', error);
      alert('Failed to delete attachment. Please try again.');
    } finally {
      setIsDeleting(false);
    }
  };

  return (
    <div className={styles.attachmentsContainer}>
      <h3>Attached Files ({attachments.length})</h3>
      <div className={styles.attachmentsList}>
        {attachments.map((file, index) => (
          <div key={index} className={styles.attachmentItem}>
            <a href={file.url} target="_blank" rel="noopener noreferrer">
              <div className={styles.attachmentContent}>
                <FileIcon filetype={file.filetype} />
                <div className={styles.fileDetails}>
                  <div className={styles.fileName}>{file.filename}</div>
                  <div className={styles.fileType}>{file.filetype}</div>
                </div>
              </div>
            </a>
            <button
              className={styles.deleteButton}
              onClick={(e) => {
                e.preventDefault();
                setConfirmDialog({ isOpen: true, file });
              }}
              title="Delete file"
              disabled={isDeleting}
            >
              <FaTrash />
            </button>
          </div>
        ))}
      </div>
      <ConfirmDialog
        isOpen={confirmDialog.isOpen}
        onClose={() => setConfirmDialog({ isOpen: false, file: null })}
        onConfirm={handleDelete}
        filename={confirmDialog.file?.filename}
      />
    </div>
  );
};

export default AttachmentsList;
