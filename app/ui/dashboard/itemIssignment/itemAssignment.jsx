"use client";

import { useState } from "react";
import { assignItem } from "@/app/lib/actions"; // Adjust the import path if necessary
import styles from "./itemAssignment.module.css";
import { useRouter } from "next/navigation";

const AssignmentForm = (props) => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);
  const [errors, setErrors] = useState({});
  const router = useRouter();

  const validateForm = (formData) => {
    const errors = {};
    if (!formData.get("serialNumber")) {
      errors.serialNumber = "Serial Number is required.";
    }
    if (!formData.get("assignedTo")) {
      errors.assignedTo = "Assignee Name is required.";
    }
    if (formData.get("agency") === "general") {
      errors.agency = "Please select a valid agency.";
    }
    return errors;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    // Validate form
    const validationErrors = validateForm(formData);
    if (Object.keys(validationErrors).length > 0) {
      setErrors(validationErrors);
      return;
    }

    setLoading(true);
    setMessage("");
    setErrors({}); // Clear previous errors

    try {
      const result = await assignItem(formData);

      if (result.success) {
        setMessage(result.message);
        e.target.reset(); // Reset form after successful submission
        router.refresh();
      } else {
        setMessage(result.error || "Failed to assign the item.");
      }
    } catch (err) {
      console.error(err);
      setMessage("An unexpected error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className={styles.container}>
      
      <form onSubmit={handleSubmit} className={styles.form}>
      <h2>Assign Item</h2>
      <br></br>
        <input
          type="text"
          id="modelNumber"
          name="modelNumber"
          defaultValue={props.modelNumber}
          hidden
        />
        <label htmlFor="serialNumber">Serial Number</label>
        <div className={styles.field}>
          
          <input
            type="text"
            id="serialNumber"
            name="serialNumber"
            placeholder="Enter Serial Number of Item"
          />
          {errors.serialNumber && (
            <p className={styles.error}>{errors.serialNumber}</p>
          )}
        </div>
        <label htmlFor="assignedTo">Assigned To</label>
        <div className={styles.field}>
          
          <input
            type="text"
            id="assignedTo"
            name="assignedTo"
            placeholder="Enter Assignee Name"
          />
          {errors.assignedTo && (
            <p className={styles.error}>{errors.assignedTo}</p>
          )}
        </div>
        <label htmlFor="agency">Agency</label>
        <div className={styles.field}>
        
          <select name="agency" id="agency" defaultValue="general">
            <option value="general">Choose a department/agency</option>
            <option value="RGV911">RGV911</option>
            <option value="RGVMPO">RGVMPO</option>
            <option value="Homeland Security">Homeland Security</option>
            <option value="Valley Metro">Valley Metro</option>
            <option value="LRGV Academy">LRGV Academy</option>
            <option value="Area Agency on Aging">Area Agency on Aging</option>
          </select>
          {errors.agency && <p className={styles.error}>{errors.agency}</p>}
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Assigning..." : "Assign Item"}
        </button>

        {message && (
          <p
            style={{
              color: message.includes("successfully") ? "green" : "red",
              marginTop: "1em",
            }}
          >
            {message}
          </p>
        )}
      </form>
    </div>
  );
};

export default AssignmentForm;

