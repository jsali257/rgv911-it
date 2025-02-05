'use client'

import { useState, useEffect } from 'react';
import styles from './imageViewer.module.css';

const ImageViewer = ({ containerClass }) => {
  const [selectedImage, setSelectedImage] = useState(null);
  const [images, setImages] = useState([]);

  useEffect(() => {
    // Function to fetch images from the API
    const fetchImages = async () => {
      try {
        const response = await fetch('/api/images');
        if (!response.ok) {
          throw new Error('Failed to fetch images');
        }
        const data = await response.json();
        setImages(data);
      } catch (error) {
        console.error('Error fetching images:', error);
      }
    };

    fetchImages();
  }, []);

  const handleImageClick = (imageSrc) => {
    setSelectedImage(imageSrc);
  };

  // If no image is selected, render the image grid
  if (!selectedImage) {
    return (
      <div className={containerClass}>
        {images.map((image, index) => (
          <img
            key={index}
            src={image.url}
            alt={image.name}
            onClick={() => handleImageClick(image.url)}
            className={styles.thumbnail}
          />
        ))}
      </div>
    );
  }

  // If an image is selected, render the modal view
  return (
    <div className={styles.modalOverlay} onClick={() => setSelectedImage(null)}>
      <div className={styles.modalContent} onClick={e => e.stopPropagation()}>
        <button className={styles.closeButton} onClick={() => setSelectedImage(null)}>×</button>
        <img src={selectedImage} alt="Enlarged view" className={styles.modalImage} />
      </div>
    </div>
  );
};

export default ImageViewer;
