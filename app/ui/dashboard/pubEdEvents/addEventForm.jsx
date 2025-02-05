"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { createEvent } from "@/app/lib/actions";
import styles from "./updateEventForm.module.css"; // Reusing the same styles
import { CldUploadWidget } from "next-cloudinary";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { MdSave } from "react-icons/md";
import Toast from "@/app/ui/dashboard/toast/toast";
import Image from "next/image";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamic import for ReactQuill
const ReactQuill = dynamic(() => import("react-quill"), {
  ssr: false,
  loading: () => <p>Loading Editor...</p>,
});

const modules = {
  toolbar: [
    [{ header: "1" }, { header: "2" }, { font: [] }],
    [{ list: "ordered" }, { list: "bullet" }],
    [{ align: [] }],
    ["bold", "italic", "underline", "strike"],
    ["link"],
    ["blockquote"],
    [{ script: "sub" }, { script: "super" }],
    ["clean"],
  ],
};

const AddEventForm = () => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [images, setImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [description, setDescription] = useState("");
  const [isUploading, setIsUploading] = useState(false);
  const [uploadCount, setUploadCount] = useState(0);

  const handleDeleteImage = (index) => {
    setImages(prev => prev.filter((_, i) => i !== index));
  };

  const handleUploadSuccess = (result) => {
    if (result.event === "success") {
      const info = result.info;
      setImages(prev => [...prev, {
        url: info.secure_url,
        publicId: info.public_id,
        originalFilename: info.original_filename
      }]);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    if (submitting) return;
    
    setSubmitting(true);
    
    const formData = new FormData(e.target);
    formData.append("images", JSON.stringify(images));
    formData.set("description", description);

    try {
      const result = await createEvent(formData);
      if (result?.error) {
        setMessage(result.error);
        setShowMessage(true);
      } else if (result?.success) {
        setMessage("Event created successfully!");
        setShowMessage(true);
        setTimeout(() => {
          router.push("/dashboard/pubEdEvents");
          router.refresh();
        }, 1000);
      }
    } catch (error) {
      console.error("Error creating event:", error);
      setMessage(error.message || "Failed to create event. Please try again.");
      setShowMessage(true);
    } finally {
      setSubmitting(false);
    }
  };

  return (
    <div className={styles.container}>
      {showMessage && (
        <Toast
          message={message}
          type={message.includes("success") ? "success" : "error"}
          onClose={() => setShowMessage(false)}
        />
      )}
      <form onSubmit={handleSubmit} className={styles.updateForm}>
        <div className={styles.formGroup}>
          <label htmlFor="title">Title</label>
          <input
            type="text"
            id="title"
            name="title"
            required
            className={styles.input}
            placeholder="Enter event title"
          />
        </div>

        <div className={styles.formGroup}>
          <label htmlFor="date">Date</label>
          <input
            type="date"
            id="date"
            name="date"
            required
            className={styles.input}
          />
        </div>

        <div className={styles.formGroup}>
          <label>Description</label>
          <div className={styles.quillWrapper}>
            <ReactQuill
              value={description}
              onChange={setDescription}
              modules={modules}
              placeholder="Enter event description"
              theme="snow"
            />
          </div>
        </div>

        <div className={styles.formGroup}>
          <label>Images</label>
          <div className={styles.imageUploadSection}>
            <CldUploadWidget
              signatureEndpoint="/api/sign-cloudinary-params"
              uploadPreset="wcklxoem"
              onSuccess={handleUploadSuccess}
              options={{
                cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
                uploadPreset: "wcklxoem",
                sources: ["local", "url", "camera"],
                multiple: true,
                maxFiles: 5,
                maxFileSize: 10485760,
                clientAllowedFormats: ["jpg", "jpeg", "png", "gif"],
                showAdvancedOptions: false,
                queueViewPosition: 'top'
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => open()}
                >
                  <FaCloudUploadAlt className={styles.uploadIcon} />
                  Upload Images
                </button>
              )}
            </CldUploadWidget>

            <div className={styles.imagePreview}>
              {images.map((image, index) => (
                <div key={index} className={styles.imageItem}>
                  <Image
                    src={image.url}
                    alt={image.originalFilename || `Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <button
                    type="button"
                    className={styles.deleteImageButton}
                    onClick={() => handleDeleteImage(index)}
                  >
                    <FaTrash />
                  </button>
                </div>
              ))}
            </div>
          </div>
        </div>

        <button
          type="submit"
          className={styles.submitButton}
          disabled={submitting}
        >
          <MdSave />
          {submitting ? 'Creating...' : 'Create Event'}
        </button>
      </form>
    </div>
  );
};

export default AddEventForm;
