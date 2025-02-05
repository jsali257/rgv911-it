"use client";

import React, { useState } from "react";
import { CldUploadWidget } from "next-cloudinary";
import Image from "next/image"; // Import Image from Next.js
import styles from "./uploadFile.module.css"; // Import the CSS module

const UploadFile = () => {
  const [uploadedFile, setUploadedFile] = useState(null);
  const [message, setMessage] = useState("");

  // Construct the signature endpoint using the environment variable
  const signatureEndpoint = `${process.env.NEXT_PUBLIC_BASE_URL}/api/sign-cloudinary-params`;

  return (
    <div className={styles.container}>
      <h3>File Manager</h3>

      <CldUploadWidget
        signatureEndpoint={signatureEndpoint} // Using the base URL from env variable
        onSuccess={(results) => {
          // Handle the successful upload result here
          if (results?.info?.secure_url) {
            setUploadedFile(results.info);
            setMessage("Upload successful!");
            console.log("Public ID:", results.info.public_id);
          } else {
            setMessage("Upload failed. Please try again.");
          }
        }}
        options={{
          cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME, // Set your Cloudinary cloud name
          uploadPreset: "wcklxoem", // Your Cloudinary upload preset
        }}
      >
        {({ open }) => (
          <button className={styles.uploadButton} onClick={() => open()}>
            Upload a file...
          </button>
        )}
      </CldUploadWidget>

      {message && <p className={styles.message}>{message}</p>}

      {uploadedFile && (
        <div className={styles.fileDetails}>
          <p>
            <strong>File Details:</strong>
          </p>
          <p>
            <strong>Name:</strong> {uploadedFile.original_filename}
          </p>
          <p>
            <strong>Type:</strong> {uploadedFile.format}
          </p>
          <p>
            <strong>Size:</strong> {Math.round(uploadedFile.bytes / 1024)} KB
          </p>

          {/* Public ID and extension */}
          <p>
            <strong>Public ID:</strong> {uploadedFile.public_id}
          </p>

          {/* Full image URL with extension */}
          <p>
            <strong>Image URL:</strong> {`${uploadedFile.secure_url}`}
          </p>

          {/* Render the file differently based on its format */}
          {uploadedFile.format === "pdf" ? (
            <div className={styles.pdfContainer}>
              <object
                data={uploadedFile.secure_url}
                type="application/pdf"
                width="100%"
                height="500px"
              >
                <p>
                  Your browser does not support PDF viewing.
                  <a
                    href={uploadedFile.secure_url}
                    target="_blank"
                    rel="noopener noreferrer"
                  >
                    Download the PDF file
                  </a>
                  .
                </p>
              </object>
            </div>
          ) : (
            <div className={styles.imageContainer}>
              <Image
                src={uploadedFile.secure_url} // Secure URL from Cloudinary
                alt={uploadedFile.original_filename}
                width={200} // Adjust width as needed
                height={200} // Adjust height as needed
                layout="intrinsic" // Maintain aspect ratio
              />
            </div>
          )}
        </div>
      )}
    </div>
  );
};

export default UploadFile;
