import { addProject } from "@/app/lib/actions"; // Import the addProject action
import styles from "@/app/ui/dashboard/projects/projects.module.css";
import { fetchUsers } from "@/app/lib/data";
import { auth } from "@/app/auth"; // Assume an auth helper to get user session
import MultiSelect from "@/app/ui/dashboard/projects/multiSelect/multiSelect"; // Import the MultiSelect

const AddProjectPage = async () => {
  const { users } = await fetchUsers();
  const session = await auth(); // Fetch authenticated session

  return (
    <div className={styles.container}>
      <h1 className={styles.heading}>Add New Project</h1>
      <form action={addProject} method="POST" className={styles.form}>
        {/* Hidden input to pass the user's ID */}
        <input
          type="text"
          name="createdBy"
          value={session.user.id}
          required
          hidden
        />

        {/* Project Title */}
        <label htmlFor="name" className={styles.label}>
          Project Title
        </label>
        <input
          type="text"
          placeholder="Enter project title"
          name="name"
          id="title"
          className={styles.input}
          required
        />

        {/* Project Description */}
        <label htmlFor="description" className={styles.label}>
          Project Description
        </label>
        <textarea
          name="description"
          id="description"
          rows="6"
          placeholder="Enter project description"
          className={styles.textarea}
          required
        ></textarea>

        {/* Start Date */}
        <div className={styles.dateTimeContainer}>
          <div className={styles.dateTimeField}>
            <label htmlFor="startDate" className={styles.label}>
              Start Date
            </label>
            <input
              type="date"
              name="startDate"
              id="startDate"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.dateTimeField}>
            <label htmlFor="startTime" className={styles.label}>
              Start Time
            </label>
            <input
              type="time"
              name="startTime"
              id="startTime"
              defaultValue="09:00"
              className={styles.input}
              required
            />
          </div>
        </div>

        {/* End Date */}
        <div className={styles.dateTimeContainer}>
          <div className={styles.dateTimeField}>
            <label htmlFor="endDate" className={styles.label}>
              End Date
            </label>
            <input
              type="date"
              name="endDate"
              id="endDate"
              className={styles.input}
              required
            />
          </div>
          <div className={styles.dateTimeField}>
            <label htmlFor="endTime" className={styles.label}>
              End Time
            </label>
            <input
              type="time"
              name="endTime"
              id="endTime"
              defaultValue="17:00"
              className={styles.input}
              required
            />
          </div>
        </div>

        {/* MultiSelect for users */}
        <MultiSelect users={users} />

        {/* Status */}
        <label htmlFor="status" className={styles.label}>
          Project Status
        </label>
        <select name="status" id="status" className={styles.select}>
          <option value="Not Started">Not Started</option>
          <option value="In Progress">In Progress</option>
          <option value="Completed">Completed</option>
        </select>

        {/* Submit Button */}
        <button type="submit" className={styles.submitButton}>
          Add Project
        </button>
      </form>
    </div>
  );
};

export default AddProjectPage;
