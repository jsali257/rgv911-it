"use client";

import React from "react";
import Select from "react-select";
import styles from "./multiSelect.module.css";

const MultiSelect = ({ users, value, onChange }) => {
  // Transform users into the format required by react-select
  const userOptions = users.map((user) => ({
    value: user._id,
    label: user.username,
    email: user.email,
    department: user.department,
  }));

  return (
    <div className={styles.multiSelectContainer}>
      <label className={styles.label}>Team Members</label>
      <Select
        isMulti
        options={userOptions}
        value={value}
        onChange={onChange}
        getOptionLabel={(option) => `${option.label} (${option.department})`}
        getOptionValue={(option) => option.value}
        classNamePrefix="react-select"
        placeholder="Select team members..."
        noOptionsMessage={() => "No users available"}
        styles={{
          control: (base) => ({
            ...base,
            minHeight: '40px',
            marginBottom: '20px',
          }),
          multiValue: (base) => ({
            ...base,
            backgroundColor: 'var(--bgSoft)',
            borderRadius: '4px',
          }),
          multiValueLabel: (base) => ({
            ...base,
            color: 'var(--text)',
            padding: '4px',
          }),
          multiValueRemove: (base) => ({
            ...base,
            color: 'var(--textSoft)',
            ':hover': {
              backgroundColor: 'var(--text)',
              color: 'var(--bg)',
            },
          }),
        }}
      />
    </div>
  );
};

export default MultiSelect;