"use client";

import { useEffect, useState } from "react";
import Toast from "@/app/ui/dashboard/toast/toast";
import { useFormState } from "react-dom";
import styles from "./singleUser.module.css";

const UpdateForm = ({ user, updateUser }) => {
  const [showToast, setShowToast] = useState(false);
  const [state, formAction] = useFormState(updateUser, null);

  useEffect(() => {
    if (state?.message) {
      setShowToast(true);
      const timer = setTimeout(() => {
        setShowToast(false);
      }, 3000);
      return () => clearTimeout(timer);
    }
  }, [state]);

  return (
    <div className={styles.formContainer}>
      {showToast && state?.message && (
        <Toast
          message={state.message}
          type={state.success ? "success" : "error"}
          onClose={() => setShowToast(false)}
        />
      )}
      <form action={formAction} className={styles.form}>
        <input type="hidden" name="id" value={user._id.toString()} />
        <label>Username</label>
        <input
          type="text"
          name="username"
          placeholder={user.username}
          defaultValue={user.username}
        />
        <label>Email</label>
        <input
          type="email"
          name="email"
          placeholder={user.email}
          defaultValue={user.email}
        />
        <label>Password</label>
        <input
          type="password"
          name="password"
          placeholder="Leave blank if not updating"
        />
        <label>Phone</label>
        <input
          type="text"
          name="phone"
          placeholder={user.phone}
          defaultValue={user.phone}
        />
        <label>Address</label>
        <textarea
          name="address"
          placeholder={user.address}
          defaultValue={user.address}
        />
        <label>Department</label>
        <select
          name="department"
          id="department"
          defaultValue={user.department}
        >
          <option value="">Select Department</option>
          <option value="RGV911">RGV911</option>
          <option value="LRGVDC">LRGVDC</option>
        </select>
        <label>Is Admin?</label>
        <select name="isAdmin" id="isAdmin" defaultValue={user.isAdmin}>
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
        <label>Is Active?</label>
        <select name="isActive" id="isActive" defaultValue={user.isActive}>
          <option value={true}>Yes</option>
          <option value={false}>No</option>
        </select>
        <button>Update Profile</button>
      </form>
    </div>
  );
};

export default UpdateForm;
