"use client";

import React, { useEffect, useState } from "react";
import styles from "./fetchFiles.module.css"; // Import CSS Module

const CloudinaryFiles = () => {
  const [files, setFiles] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    const fetchFiles = async () => {
      try {
        const response = await fetch(
          `${process.env.NEXT_PUBLIC_BASE_URL}/api/get-cloudinary-files?timestamp=${Date.now()}&force-reload=true`,
          {
            headers: {
              "Cache-Control": "no-cache, no-store, must-revalidate",
            },
          }
        );
        if (!response.ok) throw new Error("Failed to fetch files.");
    
        const data = await response.json();
        setFiles(data.files); // Store the files in state
      } catch (err) {
        console.error(err);
        setError("Unable to fetch Cloudinary files.");
      } finally {
        setLoading(false);
      }
    };
    

    fetchFiles();
  }, []);

  if (loading) return <p className={styles.loadingMessage}>Loading...</p>;
  if (error) return <p className={styles.errorMessage}>{error}</p>;

  return (
    <div className={styles.container}>
      <h2 className={styles.heading}>Recent uploads...</h2>
      {files.length > 0 ? (
        <ul className={styles.fileList}>
          {files.map((file) => (
            <li key={file.public_id} className={styles.fileItem}>
              <img
                src={file.url}
                alt={file.public_id}
                className={styles.fileImage}
              />
              <div className={styles.fileDetails}>
                <p>
                  <strong>{file.public_id}</strong> ({file.format})
                </p>
                <p>
                  <a href={file.url} target="_blank" rel="noopener noreferrer">
                    View File
                  </a>
                </p>
              </div>
            </li>
          ))}
        </ul>
      ) : (
        <p>No files found.</p>
      )}
    </div>
  );
};

export default CloudinaryFiles;