"use client";

import styles from "./users.module.css";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";

const UsersTable = ({ users = [] }) => {
  const router = useRouter();

  if (!Array.isArray(users) || users.length === 0) {
    return (
      <div className={styles.tableWrapper}>
        <p className={styles.noResults}>No users found</p>
      </div>
    );
  }

  const handleRowClick = (userId) => {
    router.push(`/dashboard/users/${userId}`);
  };

  return (
    <div className={styles.tableWrapper}>
      <table className={styles.table}>
        <thead>
          <tr>
            <th>Name</th>
            <th>Email</th>
            <th>Created At</th>
            <th>Role</th>
            <th>Status</th>
            <th>Department</th>
            <th>Action</th>
          </tr>
        </thead>
        <tbody>
          {users.map((user) => (
            <tr
              key={user.id}
              className={styles.row}
              onClick={() => handleRowClick(user._id)}
            >
              <td data-label="Name">
                <div className={styles.userInfo}>
                  <Image
                    src={user.img || "/noavatar.png"}
                    alt=""
                    width={32}
                    height={32}
                    className={styles.userImage}
                  />
                  {user.username}
                </div>
              </td>
              <td data-label="Email">{user.email}</td>
              <td data-label="Created At">{user.createdAt?.toString().slice(4, 16)}</td>
              <td data-label="Role">
                <span className={`${styles.role} ${styles[user.isAdmin ? 'admin' : 'user']}`}>
                  {user.isAdmin ? 'Admin' : 'Agent'}
                </span>
              </td>
              <td data-label="Status">
                <span className={`${styles.status} ${styles[user.isActive ? 'active' : 'passive']}`}>
                  {user.isActive ? 'Active' : 'Inactive'}
                </span>
              </td>
              <td data-label="Department">{user.department || "Not Assigned"}</td>
              <td data-label="Action">
                <div className={styles.buttons}>
                  <Link href={`/dashboard/users/${user.id}`}>
                    <button className={`${styles.button} ${styles.view}`}>View</button>
                  </Link>
                </div>
              </td>
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
};

export default UsersTable;
