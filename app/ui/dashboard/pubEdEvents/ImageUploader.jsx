'use client';

import { useState } from 'react';
import { CldUploadWidget } from 'next-cloudinary';
import Image from 'next/image';
import { MdUpload, MdClose } from 'react-icons/md';
import styles from './pubEdEvents.module.css';

const ImageUploader = ({ onImagesChange, initialImages = [] }) => {
  const [uploadedImages, setUploadedImages] = useState(initialImages);
  const [message, setMessage] = useState('');

  const handleSuccess = (results) => {
    console.log('Upload Results:', results);
    
    // Always handle as single result since Cloudinary widget calls this for each file
    if (results?.info) {
      const newImage = {
        url: results.info.secure_url,
        publicId: results.info.public_id,
        originalFilename: results.info.original_filename,
        format: results.info.format
      };
      
      setUploadedImages(prev => {
        const updatedImages = [...prev, newImage];
        onImagesChange(updatedImages);
        return updatedImages;
      });
      
      setMessage(`Image "${newImage.originalFilename}" uploaded successfully!`);
    }
  };

  const removeImage = (indexToRemove) => {
    const updatedImages = uploadedImages.filter((_, index) => index !== indexToRemove);
    setUploadedImages(updatedImages);
    onImagesChange(updatedImages);
  };

  return (
    <div className={styles.imageUploaderContainer}>
      <div className={styles.uploadedImagesGrid}>
        {uploadedImages.map((image, index) => (
          <div key={image.publicId || index} className={styles.uploadedImageContainer}>
            <Image
              src={image.url}
              alt={image.originalFilename || `Event image ${index + 1}`}
              width={200}
              height={200}
              className={styles.uploadedImage}
            />
            <button
              onClick={() => removeImage(index)}
              className={styles.removeImageButton}
              type="button"
              aria-label="Remove image"
            >
              <MdClose />
            </button>
          </div>
        ))}
      </div>

      <CldUploadWidget
        signatureEndpoint="/api/sign-cloudinary-params"
        onSuccess={handleSuccess}
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
            onClick={open}
            className={styles.uploadButton}
          >
            <MdUpload /> Upload Images
          </button>
        )}
      </CldUploadWidget>

      {message && (
        <p className={`${styles.message} ${message.includes('error') ? styles.error : styles.success}`}>
          {message}
        </p>
      )}
    </div>
  );
};

export default ImageUploader;
