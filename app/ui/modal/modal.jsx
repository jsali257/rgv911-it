"use client";

import React, { useState, useEffect } from "react";
import styles from "./modal.module.css";
import { updateProject } from "@/app/lib/actions";
import MultiSelect from "@/app/ui/dashboard/projects/multiSelect/multiSelect";
import moment from "moment-timezone";

const formatDateWithTime = (dateStr, timeStr) => {
  if (!dateStr) return null;
  const [hours, minutes] = timeStr.split(':').map(Number);
  
  // Create a moment object in Central time
  const date = moment.tz(dateStr, "America/Chicago");
  date.set({ hours, minutes, seconds: 0, milliseconds: 0 });
  
  return date.toDate();
};

const Modal = ({ isOpen, onClose, project, users, onUpdate }) => {
  const [formData, setFormData] = useState({
    name: "",
    description: "",
    status: "Open",
    startDate: "",
    endDate: "",
    startTime: "09:00",
    endTime: "17:00",
    teamMembers: [],
  });

  const [selectedTeamMembers, setSelectedTeamMembers] = useState([]);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    if (project) {
      const formatDate = (date) => {
        if (!date) return "";
        const d = new Date(date);
        // Adjust for timezone offset
        d.setMinutes(d.getMinutes() - d.getTimezoneOffset());
        return d.toISOString().split('T')[0];
      };

      // Format team members for MultiSelect
      const formattedTeamMembers = project.teamMembers?.map(member => ({
        value: member._id,
        label: member.username,
        email: member.email,
        department: member.department
      })) || [];

      setSelectedTeamMembers(formattedTeamMembers);

      setFormData({
        name: project.name || "",
        description: project.description || "",
        status: project.status || "Open",
        startDate: formatDate(project.startDate),
        endDate: formatDate(project.endDate),
        startTime: project.startTime || "09:00",
        endTime: project.endTime || "17:00",
        teamMembers: project.teamMembers || [],
      });
    }
  }, [project]);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData((prevData) => ({ ...prevData, [name]: value }));
  };

  const handleTeamMembersChange = (selectedOptions) => {
    setSelectedTeamMembers(selectedOptions || []);
  };

  const handleUpdate = async (e) => {
    e.preventDefault();
    if (isSubmitting) return;

    try {
      setIsSubmitting(true);

      const updatedProject = {
        id: project._id,
        name: formData.name,
        description: formData.description,
        status: formData.status,
        startDate: formatDateWithTime(formData.startDate, formData.startTime),
        endDate: formatDateWithTime(formData.endDate, formData.endTime),
        startTime: formData.startTime,
        endTime: formData.endTime,
        teamMembers: selectedTeamMembers.map(member => member.value),
      };

      await updateProject(updatedProject);

      // Call onUpdate with the updated project data
      if (onUpdate) {
        const formattedProject = {
          ...updatedProject,
          teamMembers: selectedTeamMembers.map(member => ({
            _id: member.value,
            username: member.label,
            email: member.email,
            department: member.department
          }))
        };
        onUpdate(formattedProject);
      }

      onClose();
    } catch (error) {
      console.error("Error updating project:", error);
    } finally {
      setIsSubmitting(false);
    }
  };

  if (!isOpen) return null;

  return (
    <div className={styles.modalOverlay}>
      <div className={styles.modal}>
        <button 
          className={styles.closeButton} 
          onClick={onClose}
          disabled={isSubmitting}
        >
          ×
        </button>
        <h2 className={styles.modalTitle}>Update Project</h2>
        <form onSubmit={handleUpdate}>
          <label className={styles.label}>Name</label>
          <input
            className={styles.inputField}
            type="text"
            name="name"
            value={formData.name}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          />

          <label className={styles.label}>Description</label>
          <textarea
            className={styles.inputField}
            name="description"
            value={formData.description}
            onChange={handleChange}
            rows="4"
            disabled={isSubmitting}
          ></textarea>

          {/* Start Date and Time Group */}
          <div className={styles.dateTimeGroup}>
            <div className={styles.dateTimeField}>
              <label className={styles.label}>Start Date</label>
              <input
                className={styles.inputField}
                type="date"
                name="startDate"
                value={formData.startDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.dateTimeField}>
              <label className={styles.label}>Start Time</label>
              <input
                className={styles.inputField}
                type="time"
                name="startTime"
                value={formData.startTime}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          {/* End Date and Time Group */}
          <div className={styles.dateTimeGroup}>
            <div className={styles.dateTimeField}>
              <label className={styles.label}>End Date</label>
              <input
                className={styles.inputField}
                type="date"
                name="endDate"
                value={formData.endDate}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
            <div className={styles.dateTimeField}>
              <label className={styles.label}>End Time</label>
              <input
                className={styles.inputField}
                type="time"
                name="endTime"
                value={formData.endTime}
                onChange={handleChange}
                required
                disabled={isSubmitting}
              />
            </div>
          </div>

          <label className={styles.label}>Status</label>
          <select
            className={styles.inputField}
            name="status"
            value={formData.status}
            onChange={handleChange}
            required
            disabled={isSubmitting}
          >
            <option value="Not Started">Not Started</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
            <option value="Cancelled">Cancelled</option>
          </select>

          {/* Team Members MultiSelect */}
          <div className={styles.teamMembersSection}>
            <MultiSelect 
              users={users || []} 
              value={selectedTeamMembers}
              onChange={handleTeamMembersChange}
            />
          </div>

          <button 
            type="submit" 
            className={styles.updateButton}
            disabled={isSubmitting}
          >
            {isSubmitting ? 'Updating...' : 'Update Project'}
          </button>
        </form>
      </div>
    </div>
  );
};

export default Modal;