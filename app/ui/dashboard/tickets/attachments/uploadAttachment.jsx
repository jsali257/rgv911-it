"use client";

import { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import { FaCloudUploadAlt } from "react-icons/fa";
import styles from "./uploadAttachment.module.css";
import Toast from "@/app/ui/dashboard/toast/toast";
import { useRouter } from "next/navigation";

const UploadAttachment = ({ ticketId }) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [newAttachments, setNewAttachments] = useState([]);

  const handleSave = async () => {
    if (newAttachments.length === 0) return;

    try {
      const res = await fetch(`/api/tickets/${ticketId}/attachments`, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ attachments: newAttachments }),
      });

      if (!res.ok) {
        throw new Error('Failed to add attachments');
      }

      setMessage("Files uploaded successfully!");
      setShowMessage(true);
      setNewAttachments([]); // Clear new attachments
      router.refresh();
    } catch (error) {
      setMessage("Failed to upload files");
      setShowMessage(true);
      console.error("Failed to upload files:", error);
    }
  };

  return (
    <div className={styles.uploadSection}>
      {showMessage && (
        <Toast 
          message={message} 
          type={message.includes("Failed") ? "error" : "success"} 
          onClose={() => setShowMessage(false)}
        />
      )}

      <div className={styles.uploadContainer}>
        <CldUploadWidget
          signatureEndpoint={`${process.env.NEXT_PUBLIC_BASE_URL}/api/sign-cloudinary-params`}
          onSuccess={(result) => {
            if (result?.info) {
              const newAttachment = {
                url: result.info.secure_url,
                filename: result.info.original_filename,
                filetype: result.info.format
              };
              setNewAttachments(prev => [...prev, newAttachment]);
              setMessage("File uploaded successfully!");
              setShowMessage(true);
            }
          }}
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: "wcklxoem",
            maxFiles: 5
          }}
        >
          {({ open }) => (
            <button
              type="button"
              onClick={() => open()}
              className={styles.uploadButton}
            >
              <FaCloudUploadAlt className={styles.uploadIcon} />
              Upload Files
            </button>
          )}
        </CldUploadWidget>

        {newAttachments.length > 0 && (
          <>
            <div className={styles.newAttachments}>
              <h4>New Files to Add:</h4>
              <ul>
                {newAttachments.map((file, index) => (
                  <li key={index}>
                    {file.filename}
                    <button
                      type="button"
                      className={styles.removeButton}
                      onClick={() => {
                        setNewAttachments(prev => prev.filter((_, i) => i !== index));
                      }}
                    >
                      Remove
                    </button>
                  </li>
                ))}
              </ul>
            </div>
            <button
              type="button"
              onClick={handleSave}
              className={styles.saveButton}
            >
              Save Attachments
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default UploadAttachment;
