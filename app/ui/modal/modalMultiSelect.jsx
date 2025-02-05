"use client";

import React from "react";
import Select from "react-select";
import styles from "./modal.module.css";

const ModalMultiSelect = ({ users, value, onChange }) => {
  // Transform users into the format required by react-select
  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.username,
  }));

  // Transform current team members into the format required by react-select
  const currentValue = value.map((member) => ({
    value: member._id,
    label: member.username,
  }));

  // Handle the change when users are selected/deselected
  const handleSelectChange = (selectedOptions) => {
    // Convert back to the format expected by the parent component
    const selectedUsers = (selectedOptions || []).map((option) => ({
      _id: option.value,
      username: option.label,
    }));
    onChange(selectedUsers);
  };

  return (
    <div className={styles.formGroup}>
      <label className={styles.label}>Team Members</label>
      <Select
        isMulti
        options={userOptions}
        value={currentValue}
        onChange={handleSelectChange}
        className={styles.multiSelect}
        classNamePrefix="react-select"
        placeholder="Select team members..."
      />
    </div>
  );
};

export default ModalMultiSelect;