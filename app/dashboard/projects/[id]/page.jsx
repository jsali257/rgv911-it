import { updateProject } from "@/app/lib/actions"; // Replace with your actual update function
import { fetchProject } from "@/app/lib/data"; // Replace with your project fetching function
import styles from "@/app/ui/dashboard/tickets/singleTicket/singleTicket.module.css";

const SingleProjectPage = async ({ params }) => {
  const { id } = params; // Get project ID from route params
  const project = await fetchProject(id); // Fetch project details
 
  return (
    <div className={styles.container}>
      <div className={styles.formContainer}>
        <label>
          Project created by: {project.owner ? project.owner.username : "Unknown"}
        </label>
        <form action={updateProject} className={styles.form}>
          <input type="hidden" name="id" value={project.id} />
          <label>Name</label>
          <input
            type="text"
            name="name"
            placeholder={project.name}
            defaultValue={project.name}
          />
          <label>Description</label>
          <textarea
            name="description"
            rows="5"
            placeholder={project.description}
            defaultValue={project.description}
          ></textarea>
          <label>Owner</label>
          <input
            type="text"
            name="owner"
            placeholder={project.owner?.username || "Owner"}
            defaultValue={project.owner?.username}
          />
          <label>Status</label>
          <select name="status" defaultValue={project.status}>
            <option value="Open">Open</option>
            <option value="In Progress">In Progress</option>
            <option value="Completed">Completed</option>
            <option value="On Hold">On Hold</option>
          </select>
          <button>Update</button>
        </form>
     

    
      </div>
    </div>
  );
};

export default SingleProjectPage;
