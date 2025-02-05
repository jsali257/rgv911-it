"use client";
import { useState } from "react";
import styles from "./comments.module.css";
import { addReply } from "@/app/lib/actions";
import Toast from "@/app/ui/dashboard/toast/toast";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

const ReactQuill = dynamic(() => import("react-quill"), { ssr: false });

const modules = {
  toolbar: [
    [{ 'header': [1, 2, 3, false] }],
    ['bold', 'italic', 'underline', 'strike'],
    [{ 'list': 'ordered'}, { 'list': 'bullet' }],
    ['link', 'blockquote'],
    [{ 'color': [] }, { 'background': [] }],
    ['clean']
  ],
};

const formats = [
  'header',
  'bold', 'italic', 'underline', 'strike',
  'list', 'bullet',
  'link', 'blockquote',
  'color', 'background'
];

const AddReply = ({ ticketID, user }) => {
  const [text, setText] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");

  const handleSubmit = async (e) => {
    e.preventDefault();
    
    if (!text.trim()) {
      setToastMessage("Please enter a reply");
      setToastType("error");
      setShowToast(true);
      return;
    }

    setIsSubmitting(true);

    try {
      const result = await addReply({
        ticketID,
        user,
        text
      });

      if (result?.error) {
        setToastMessage(result.error);
        setToastType("error");
      } else {
        setToastMessage("Reply added successfully");
        setToastType("success");
        setText("");
      }
    } catch (error) {
      console.error("Error adding reply:", error);
      setToastMessage("Failed to add reply");
      setToastType("error");
    } finally {
      setIsSubmitting(false);
      setShowToast(true);
    }
  };

  return (
    <div className={styles.replyForm}>
      {showToast && (
        <Toast
          message={toastMessage}
          type={toastType}
          duration={3000}
          onClose={() => setShowToast(false)}
        />
      )}
      <form onSubmit={handleSubmit}>
        <div className={styles.editorContainer}>
          <ReactQuill
            theme="snow"
            value={text}
            onChange={setText}
            modules={modules}
            formats={formats}
            placeholder="Share your thoughts or provide assistance..."
            className={styles.editor}
          />
        </div>
        <div className={styles.formActions}>
          <button 
            type="submit" 
            className={styles.submitButton}
            disabled={isSubmitting || !text.trim()}
          >
            {isSubmitting ? "Posting..." : "Post Reply"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default AddReply;
