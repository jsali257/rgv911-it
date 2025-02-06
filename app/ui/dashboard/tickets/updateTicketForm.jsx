"use client";

import { useState } from "react";
import { updateTicket } from "@/app/lib/actions";
import formStyles from "@/app/ui/dashboard/tickets/singleTicket/singleTicket.module.css";
import styles from "./updateTicketForm.module.css";
import Toast from "@/app/ui/dashboard/toast/toast";
import { FaSave } from "react-icons/fa";

// Phone number formatting utility
const formatPhoneNumber = (value) => {
  if (!value) return value;
  
  // Remove all non-numeric characters
  const phoneNumber = value.replace(/[^\d]/g, '');
  
  // Format the number
  if (phoneNumber.length < 4) return phoneNumber;
  if (phoneNumber.length < 7) {
    return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3)}`;
  }
  return `${phoneNumber.slice(0, 3)}-${phoneNumber.slice(3, 6)}-${phoneNumber.slice(6, 10)}`;
};

// Parse phone number and extension from a string
const parsePhoneAndExtension = (phoneString) => {
  if (!phoneString) return { phone: '', extension: '' };
  
  // Check if there's an extension
  const parts = phoneString.toLowerCase().split('ext');
  const phone = parts[0].trim();
  const extension = parts[1] ? parts[1].trim() : '';
  
  return { phone, extension };
};

const UpdateTicketForm = ({ ticket, users, isLRGVDC, session, onUpdate }) => {
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [showToast, setShowToast] = useState(false);
  const [toastMessage, setToastMessage] = useState("");
  const [toastType, setToastType] = useState("success");
  const [emailError, setEmailError] = useState("");
  
  // Initialize form state
  const { phone: initialPhone, extension: initialExt } = parsePhoneAndExtension(ticket.phone || '');
  const [formState, setFormState] = useState({
    name: ticket.name || "",
    email: ticket.email || "",
    phoneNumber: initialPhone,
    extension: initialExt,
    department: ticket.department || "",
    issue: ticket.issue || "general",
    comment: ticket.comment || "",
    status: ticket.status || "Open",
    assignedTo: ticket.assignedTo || session?.user?.id || "",
  });

  // Email validation
  const validateEmail = (email) => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (email && !emailRegex.test(email)) {
      setEmailError("Please enter a valid email address");
      return false;
    }
    setEmailError("");
    return true;
  };

  const handleInputChange = (e) => {
    const { name, value } = e.target;
    setFormState(prev => ({
      ...prev,
      [name]: value
    }));

    // Clear email error when email field changes
    if (name === 'email') {
      setEmailError('');
    }
  };

  const handlePhoneChange = (e) => {
    const formattedNumber = formatPhoneNumber(e.target.value);
    setFormState(prev => ({
      ...prev,
      phoneNumber: formattedNumber
    }));
  };

  const handleExtensionChange = (e) => {
    // Only allow numbers in extension
    const value = e.target.value.replace(/[^\d]/g, '');
    setFormState(prev => ({
      ...prev,
      extension: value
    }));
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    setIsSubmitting(true);

    try {
      // Validate email if it's not empty
      if (formState.email && !validateEmail(formState.email)) {
        setIsSubmitting(false);
        return;
      }

      // Format phone number with extension if present
      const formattedPhone = formState.extension 
        ? `${formState.phoneNumber} ext ${formState.extension}`
        : formState.phoneNumber;

      const formData = new FormData();
      formData.append("id", ticket._id);
      
      // Add all form fields
      Object.entries({
        name: formState.name,
        email: formState.email,
        phone: formattedPhone,
        department: formState.department,
        issue: formState.issue,
        comment: formState.comment,
        status: formState.status,
        assignedTo: formState.assignedTo,
      }).forEach(([key, value]) => {
        if (value !== undefined && value !== null && value !== '') {
          formData.append(key, value);
        }
      });

      const result = await updateTicket(formData);
      
      if (result?.error) {
        setToastMessage(result.error);
        setToastType("error");
      } else {
        setToastMessage("Ticket updated successfully!");
        setToastType("success");
        // Notify parent after a successful update
        setTimeout(() => {
          onUpdate?.();
        }, 2000);
      }
    } catch (error) {
      console.error("Failed to update ticket:", error);
      setToastMessage(error.message || "Failed to update ticket");
      setToastType("error");
    } finally {
      setIsSubmitting(false);
      setShowToast(true);
    }
  };

  return (
    <div className={formStyles.formWrapper}>
      {showToast && (
        <Toast 
          message={toastMessage} 
          type={toastType}
          onClose={() => setShowToast(false)}
          duration={2000}
        />
      )}
      
      <form onSubmit={handleSubmit} className={formStyles.form}>
        <input type="hidden" name="id" value={ticket._id} />

        <div className={styles.fieldGroup}>
          <div className={styles.formGroup}>
            <label className={styles.required}>Name</label>
            <input
              type="text"
              name="name"
              value={formState.name}
              onChange={handleInputChange}
              placeholder="Enter name"
              className={formStyles.input}
              required
            />
          </div>

          <div className={styles.formGroup}>
            <label>Email</label>
            <div className={styles.inputWrapper}>
              <input
                type="email"
                name="email"
                value={formState.email}
                onChange={handleInputChange}
                placeholder="example@email.com"
                pattern="[a-zA-Z0-9._-]+@[a-zA-Z0-9.-]+\.[a-zA-Z]{2,6}"
                className={formStyles.input}
              />
              {emailError && <span className={styles.errorMessage}>{emailError}</span>}
            </div>
          </div>
        </div>
        
        {/* Phone Number and Extension Group */}
        <div className={styles.formGroup}>
          <label htmlFor="phone">Phone Number</label>
          <div className={styles.phoneGroup}>
            <input
              type="tel"
              id="phone"
              name="phoneNumber"
              value={formState.phoneNumber}
              onChange={handlePhoneChange}
              placeholder="956-222-2222"
              maxLength="12"
              className={`${formStyles.input} ${styles.phoneInput}`}
            />
            <div className={styles.extensionWrapper}>
              <label htmlFor="extension" className={styles.extensionLabel}>ext</label>
              <input
                type="text"
                id="extension"
                name="extension"
                value={formState.extension}
                onChange={handleExtensionChange}
                placeholder="175"
                maxLength="6"
                className={`${formStyles.input} ${styles.extensionInput}`}
              />
            </div>
          </div>
        </div>

        <div className={styles.fieldGroup}>
          <div className={styles.formGroup}>
            <label htmlFor="department" className={styles.required}>Department</label>
            <select
              name="department"
              value={formState.department}
              onChange={handleInputChange}
              required
            >
              <option value="" disabled>Select Department</option>
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

          {!isLRGVDC && (
            <div className={styles.formGroup}>
              <label htmlFor="assignedTo" className={styles.required}>Assigned To</label>
              <select
                name="assignedTo"
                value={formState.assignedTo}
                onChange={handleInputChange}
                required
                className={formStyles.select}
              >
                <option value="" disabled>Select User</option>
                {Array.isArray(users) && users.map((user) => (
                  <option key={user._id} value={user._id}>
                    {user.username || user.name}
                  </option>
                ))}
              </select>
            </div>
          )}
        </div>

        {!isLRGVDC && (
          <div className={styles.formGroup}>
            <label>Issue</label>
            <select 
              name="issue" 
              value={formState.issue}
              onChange={handleInputChange}
              className={formStyles.select}
            >
              <option value="general">Select an issue</option>
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
        )}

        <div className={styles.formGroup}>
          <label>Comment</label>
          <textarea
            name="comment"
            value={formState.comment}
            onChange={handleInputChange}
            rows={5}
            className={formStyles.textarea}
            placeholder="Add any additional notes or comments..."
          />
        </div>

        <div className={styles.formGroup}>
          <label>Status</label>
          <select 
            name="status" 
            value={formState.status}
            onChange={handleInputChange}
            className={`${formStyles.select} ${styles.statusOption} ${styles[formState.status.toLowerCase().replace(' ', '')]}`}
          >
            <option value="Open">Open</option>
            {!isLRGVDC && <option value="In Progress">In Progress</option>}
            {!isLRGVDC && <option value="On Hold">On Hold</option>}
            <option value="Closed">Closed</option>
          </select>
        </div>

        <div className={styles.submitContainer}>
          <button 
            type="submit" 
            className={`${styles.submitButton} ${formStyles.button}`}
            disabled={isSubmitting}
          >
            <FaSave />
            {isSubmitting ? "Saving..." : "Save Changes"}
          </button>
        </div>
      </form>
    </div>
  );
};

export default UpdateTicketForm;