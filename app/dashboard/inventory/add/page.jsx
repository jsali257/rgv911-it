"use client";

import { useState } from "react";
import { addItem } from "@/app/lib/actions"; // Adjust the import path if necessary
import styles from "@/app/ui/dashboard/tickets/singleTicket/singleTicket.module.css";

const AddProductPage = () => {
  const [message, setMessage] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    const formData = new FormData(e.target);

    setLoading(true);
    setMessage(""); // Clear previous messages

    try {
      const result = await addItem(formData);

      if (result.success) {
        setMessage(result.message);
        e.target.reset(); // Reset form after successful submission
      } else {
        setMessage(result.error || "Failed to add the item.");
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
        <h2>Create Product</h2>

        <div style={{ marginBottom: "1em" }}>
          <input
            type="text"
            id="itemName"
            name="itemName"
            placeholder="Enter Item Name"
            required
          />
        </div>

        <div style={{ marginBottom: "1em" }}>
          <input
            type="text"
            id="modelNumber"
            name="modelNumber"
            placeholder="Enter Model Number"
            required
          />
        </div>

        <div style={{ marginBottom: "1em" }}>
          <input
            type="number"
            id="stock"
            name="stock"
            placeholder="Enter Stock Quantity"
            required
          />
        </div>

        <button type="submit" disabled={loading}>
          {loading ? "Creating..." : "Create Product"}
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

export default AddProductPage;
