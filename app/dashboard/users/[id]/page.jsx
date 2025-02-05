import { updateUser } from "@/app/lib/actions";
import { fetchUser } from "@/app/lib/data";
import styles from "@/app/ui/dashboard/users/singleUser/singleUser.module.css";
import userStyles from "@/app/ui/dashboard/users/users.module.css";
import Image from "next/image";
import { revalidatePath } from "next/cache";
import UpdateForm from "@/app/ui/dashboard/users/singleUser/updateForm";
import ResetPasswordButton from "@/app/ui/dashboard/users/singleUser/resetPasswordButton";

const SingleUserPage = async ({ params }) => {
  const { id } = params;
  const user = await fetchUser(id);

  async function updateUserWithToast(prevState, formData) {
    "use server";
    
    try {
      await updateUser(formData);
      revalidatePath(`/dashboard/users/${id}`);
      return { success: true, message: "User updated successfully!" };
    } catch (error) {
      console.error("Update error:", error);
      return { 
        success: false, 
        message: error.message || "Failed to update user" 
      };
    }
  }

  return (
    <div>
      <div className={styles.header}>
        <h1>User Profile</h1>
        <p className={styles.subtitle}>View and manage user information and permissions</p>
      </div>
      <div className={styles.container}>
        <div className={styles.infoContainer}>
          <h3>Profile Settings</h3>
          <div className={styles.imgContainer}>
            <Image src={user.img || "/noavatar.png"} alt="" fill />
          </div>
          <div className={styles.userInfo}>
            <p><strong>Username:</strong> {user.username}</p>
            <p>
              <strong>Role:</strong>{" "}
              <span className={user.isAdmin ? userStyles.adminBadge : userStyles.agentBadge}>
                {user.isAdmin ? "Admin" : "Agent"}
              </span>
            </p>
            <p>
              <strong>Status:</strong>{" "}
              <span className={user.isActive ? userStyles.activeBadge : userStyles.inactiveBadge}>
                {user.isActive ? "Active" : "Inactive"}
              </span>
            </p>
            <p><strong>Department:</strong> {user.department || "Not Assigned"}</p>
            <ResetPasswordButton userId={user._id.toString()} />
          </div>
        </div>
        <div className={styles.formContainer}>
          <UpdateForm user={user} updateUser={updateUserWithToast} />
        </div>
      </div>
    </div>
  );
};

export default SingleUserPage;
