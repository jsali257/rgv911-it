"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { updateEvent } from "@/app/lib/actions";
import styles from "./updateEventForm.module.css";
import { CldUploadWidget } from "next-cloudinary";
import { FaCloudUploadAlt, FaTrash } from "react-icons/fa";
import { MdSave } from "react-icons/md";
import Toast from "@/app/ui/dashboard/toast/toast";
import Image from "next/image";
import dynamic from "next/dynamic";
import "react-quill/dist/quill.snow.css";

// Dynamic import for ReactQuill to avoid SSR issues
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

const UpdateEventForm = ({ event }) => {
  const router = useRouter();
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  const [newImages, setNewImages] = useState([]);
  const [submitting, setSubmitting] = useState(false);
  const [currentImages, setCurrentImages] = useState(event.images || []);
  const [description, setDescription] = useState(event.description || "");

  const handleDeleteImage = (index, isNewImage = false) => {
    if (isNewImage) {
      setNewImages(prev => prev.filter((_, i) => i !== index));
    } else {
      setCurrentImages(prev => prev.filter((_, i) => i !== index));
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setSubmitting(true);
    
    const formData = new FormData(e.target);
    formData.append("id", event._id);
    formData.append("images", JSON.stringify([...currentImages, ...newImages]));
    formData.set("description", description); // Override the form's description with ReactQuill content

    try {
      const result = await updateEvent(formData);
      if (result?.error) {
        setMessage(result.error);
        setShowMessage(true);
      } else {
        setMessage("Event updated successfully!");
        setShowMessage(true);
        setTimeout(() => {
          router.push("/dashboard/pubEdEvents");
          router.refresh();
        }, 2000);
      }
    } catch (error) {
      setMessage("Failed to update event. Please try again.");
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
            defaultValue={event.title}
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
            defaultValue={event.date ? new Date(event.date).toISOString().split('T')[0] : ''}
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
              onUpload={(result, widget) => {
                if (result.event === "success") {
                  const info = result.info;
                  setNewImages(prev => [...prev, {
                    url: info.secure_url,
                    publicId: info.public_id,
                    originalFilename: info.original_filename
                  }]);
                  widget.close();
                }
              }}
            >
              {({ open }) => (
                <button
                  type="button"
                  className={styles.uploadButton}
                  onClick={() => open()}
                >
                  <FaCloudUploadAlt className={styles.uploadIcon} />
                  Upload New Images
                </button>
              )}
            </CldUploadWidget>

            <div className={styles.imagePreview}>
              {currentImages.map((image, index) => (
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
              {newImages.map((image, index) => (
                <div key={`new-${index}`} className={styles.imageItem}>
                  <Image
                    src={image.url}
                    alt={image.originalFilename || `New Image ${index + 1}`}
                    fill
                    sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  />
                  <button
                    type="button"
                    className={styles.deleteImageButton}
                    onClick={() => handleDeleteImage(index, true)}
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
          {submitting ? 'Updating...' : 'Update Event'}
        </button>
      </form>
    </div>
  );
};

export default UpdateEventForm;
