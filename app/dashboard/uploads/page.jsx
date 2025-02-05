import CloudinaryFiles from "@/app/ui/dashboard/fetchFiles/fetchFiles";
import styles from "@/app/ui/dashboard/tickets/addTicket/addTicket.module.css";
import UploadFile from "@/app/ui/dashboard/uploadFile/uploadFile";
const UploadsPage = async () => {
  return (
    <div className={styles.container}>
      <h3>File Uploads Manager</h3>
      <UploadFile />
      <CloudinaryFiles />
    </div>
  );
};

export default UploadsPage;
