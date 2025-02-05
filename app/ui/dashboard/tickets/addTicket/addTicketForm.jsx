"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { MdSend, MdUpload, MdClose } from "react-icons/md";
import { CldUploadWidget } from "next-cloudinary";
import { addTicket } from "@/app/lib/actions";
import styles from "./addTicket.module.css";

const AddTicketForm = ({ user, onSuccess, onCancel }) => {
  const router = useRouter();

  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const [email, setEmail] = useState("");
  const [phoneNumber, setPhoneNumber] = useState("");
  const [extension, setExtension] = useState("");
  const [attachments, setAttachments] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [error, setError] = useState("");

  const isLRGVDC = user?.department === "LRGVDC";

  const handleEmailChange = (e) => {
    const value = e.target.value;
    setEmail(value);
    const emailRegex = /^[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}$/;
    if (!emailRegex.test(value) && value !== "") {
      setEmailError("Please enter a valid email address");
    } else {
      setEmailError("");
    }
  };

  const handlePhoneChange = (e) => {
    const value = e.target.value;
    const formatted = value
      .replace(/\D/g, "")
      .match(/(\d{0,3})(\d{0,3})(\d{0,4})/);
    const formattedNumber = !formatted[2]
      ? formatted[1]
      : `${formatted[1]}-${formatted[2]}${
          formatted[3] ? `-${formatted[3]}` : ""
        }`;
    setPhoneNumber(formattedNumber);

    const phoneRegex = /^\d{3}-\d{3}-\d{4}$/;
    if (!phoneRegex.test(formattedNumber) && formattedNumber.length === 12) {
      setPhoneError("Please enter a valid phone number (XXX-XXX-XXXX)");
    } else {
      setPhoneError("");
    }
  };

  const handleExtensionChange = (e) => {
    const value = e.target.value.replace(/\D/g, "");
    setExtension(value);
  };

  const handleUploadSuccess = (result) => {
    const newAttachment = {
      url: result.info.secure_url,
      filename: result.info.original_filename,
      format: result.info.format,
    };
    setAttachments((prev) => [...prev, newAttachment]);
  };

  const handleRemoveAttachment = (index) => {
    setAttachments((prev) => prev.filter((_, i) => i !== index));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    setError("");

    try {
      setSubmitting(true);
      const formData = new FormData(e.target);

      // Set user data from session
      formData.set("user", user.id);
      formData.set("assignedTo", user.id);
      formData.set("assignedDepartment", user.department);

      // Combine phone and extension
      const fullPhone = extension
        ? `${phoneNumber} ext ${extension}`
        : phoneNumber;
      formData.set("phone", fullPhone);

      formData.append("attachments", JSON.stringify(attachments));

      const result = await addTicket(formData);

      if (result.success) {
        if (onSuccess) {
          onSuccess();
        } else {
          router.push("/dashboard/tickets");
          router.refresh();
        }
      } else {
        setError(result.error || "Failed to submit ticket");
      }
    } catch (error) {
      console.error("Error submitting ticket:", error);
      setError("Failed to submit ticket. Please try again.");
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <form onSubmit={handleSubmit} className={styles.form}>
      {/* Hidden fields for user data */}
      <input type="hidden" name="user" value={user?.id || ""} />
      <input type="hidden" name="assignedTo" value={user?.id || ""} />
      <input
        type="hidden"
        name="assignedDepartment"
        value={user?.department || ""}
      />

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Person Name</label>
          <input type="text" name="name" placeholder="Full Name" required />
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Email</label>
          <div className={styles.inputWrapper}>
            <input
              type="email"
              name="email"
              value={email}
              onChange={handleEmailChange}
              placeholder="example@email.com"
              pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}"
              required
            />
            {emailError && (
              <span className={styles.errorMessage}>{emailError}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Phone Number</label>
          <div className={styles.phoneGroup}>
            <input
              type="tel"
              name="phone"
              value={phoneNumber}
              onChange={handlePhoneChange}
              placeholder="956-682-3481"
              maxLength="12"
              className={styles.phoneInput}
              required
            />
            <div className={styles.extensionWrapper}>
              <span className={styles.extensionLabel}>ext</span>
              <input
                type="text"
                value={extension}
                onChange={handleExtensionChange}
                placeholder="175"
                maxLength="6"
                className={styles.extensionInput}
              />
            </div>
            {phoneError && (
              <span className={styles.errorMessage}>{phoneError}</span>
            )}
          </div>
        </div>
      </div>

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Department</label>
          <select name="department" required>
            <option value="">Select Department</option>
            <option value="Admin">Admin</option>
            <option value="Finance">Finance</option>
            <option value="HR">HR</option>
            <option value="AAA">AAA</option>
            <option value="VM">VM</option>
            <option value="HLS">HLS</option>
            <option value="RPA">RPA</option>
            <option value="CED">CED</option>
            <option value="MPO">MPO</option>
          </select>
        </div>
      </div>

      {!isLRGVDC && (
        <div className={styles.row}>
          <div className={styles.field}>
            <label>Issue Type</label>
            <select name="issue" required>
              <option value="">Select an issue</option>
              <option value="Hardware">Hardware</option>
              <option value="Software">Software</option>
              <option value="Networking">Networking</option>
              <option value="Account Access">Account Access</option>
              <option value="System Crash">System Crash</option>
              <option value="Performance Issues">Performance Issues</option>
              <option value="Data Loss">Data Loss</option>
              <option value="Security Breach">Security Breach</option>
              <option value="Bug/Error">Bug/Error</option>
              <option value="Configuration">Configuration</option>
              <option value="Maintenance">Maintenance</option>
              <option value="Request">Request</option>
              <option value="Upgrade">Upgrade</option>
              <option value="Training">Training</option>
              <option value="Other">Other</option>
            </select>
          </div>
        </div>
      )}

      <div className={styles.row}>
        <div className={styles.field}>
          <label>Status</label>
          <select name="status" required>
            <option value="Open">Open</option>
            {!isLRGVDC && <option value="In Progress">In Progress</option>}
            {!isLRGVDC && <option value="On Hold">On Hold</option>}
            <option value="Closed">Closed</option>
          </select>
        </div>
      </div>

      <div className={styles.field}>
        <label>Issue Description</label>
        <textarea
          name="comment"
          required
          placeholder="Please describe your issue in detail..."
          rows={4}
        />
      </div>

      <div className={styles.attachmentsSection}>
        <label>Attachments</label>
        <CldUploadWidget
          signatureEndpoint="/api/sign-cloudinary-params"
          onSuccess={handleUploadSuccess}
          options={{
            cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
            uploadPreset: "wcklxoem",
            sources: ["local", "url", "camera"],
            multiple: true,
            maxFiles: 5,
            maxFileSize: 10485760,
            clientAllowedFormats: [
              "jpg",
              "jpeg",
              "png",
              "gif",
              "pdf",
              "doc",
              "docx",
            ],
          }}
        >
          {({ open }) => (
            <button
              type="button"
              className={styles.uploadButton}
              onClick={open}
            >
              <MdUpload /> Upload Files
            </button>
          )}
        </CldUploadWidget>

        <div className={styles.attachmentsList}>
          {attachments.length > 0 && <h4>Uploaded Files:</h4>}
          <ul>
            {attachments.map((file, index) => (
              <li key={index}>
                {file.filename}
                <button
                  type="button"
                  onClick={() => handleRemoveAttachment(index)}
                  className={styles.removeButton}
                >
                  <MdClose />
                </button>
              </li>
            ))}
          </ul>
        </div>
      </div>

      {error && <div className={styles.errorMessage}>{error}</div>}

      <div className={styles.buttonGroup}>
        <button
          type="button"
          onClick={onCancel}
          className={styles.cancelButton}
        >
          Cancel
        </button>
        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          <MdSend />
          {submitting ? "Submitting..." : "Submit Ticket"}
        </button>
      </div>
    </form>
  );
};

export default AddTicketForm;
