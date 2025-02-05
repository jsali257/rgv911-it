"use client";

import { useEffect, useState } from "react";
import styles from "@/app/ui/dashboard/profile/profile.module.css";
import { CldUploadWidget } from "next-cloudinary";
import { FaUserCircle } from "react-icons/fa";
import { updateUserProfilePicture } from "@/app/lib/actions";
import { useSession } from "next-auth/react";
import Image from "next/image";
import Toast from "@/app/ui/dashboard/toast/toast";
import { useRouter } from "next/navigation";

const ProfilePage = () => {
  const router = useRouter();
  const { data: session, update, status } = useSession();
  const [message, setMessage] = useState("");
  const [showMessage, setShowMessage] = useState(false);
  
  useEffect(() => {
    if (status === "unauthenticated") {
      router.push("/login");
    }
  }, [status, router]);

  if (status === "loading") {
    return <div>Loading...</div>;
  }

  if (!session?.user) {
    return null;
  }
  
  const handleImageUpload = async (result) => {
    if (result?.info) {
      try {
        const formData = new FormData();
        formData.append("id", session.user.id);
        formData.append("img", result.info.secure_url);
        
        await updateUserProfilePicture(formData);
        await update({ ...session, user: { ...session.user, img: result.info.secure_url }});
        
        setMessage("Profile picture updated successfully!");
        setShowMessage(true);
      } catch (error) {
        setMessage("Failed to update profile picture");
        setShowMessage(true);
        console.error("Failed to update profile picture:", error);
      }
    }
  };

  return (
    <div className={styles.container}>
      {showMessage && (
        <Toast 
          message={message} 
          type={message.includes("Failed") ? "error" : "success"} 
          onClose={() => setShowMessage(false)}
        />
      )}
      
      <div className={styles.profile}>
        <div className={styles.imageContainer}>
          {session.user.img ? (
            <Image
              src={session.user.img}
              alt="Profile"
              width={200}
              height={200}
              className={styles.profileImage}
            />
          ) : (
            <FaUserCircle className={styles.defaultIcon} />
          )}
          
          <CldUploadWidget
            signatureEndpoint={`${process.env.NEXT_PUBLIC_BASE_URL}/api/sign-cloudinary-params`}
            onSuccess={handleImageUpload}
            options={{
              cloudName: process.env.NEXT_PUBLIC_CLOUDINARY_CLOUD_NAME,
              uploadPreset: "wcklxoem",
              maxFiles: 1,
              sources: ["local"],
              resourceType: "image"
            }}
          >
            {({ open }) => (
              <button
                type="button"
                onClick={() => open()}
                className={styles.uploadButton}
              >
                Change Profile Picture
              </button>
            )}
          </CldUploadWidget>
        </div>
        
        <div className={styles.info}>
          <h2>{session.user.username}</h2>
          <p>{session.user.email}</p>
          {session.user.department && (
            <p>Department: {session.user.department}</p>
          )}
          {session.user.phone && (
            <p>Phone: {session.user.phone}</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default ProfilePage;
