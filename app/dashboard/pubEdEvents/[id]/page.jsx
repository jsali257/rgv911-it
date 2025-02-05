import { fetchPubEdEvent } from "@/app/lib/data";
import styles from "@/app/ui/dashboard/pubEdEvents/pubEdEvents.module.css";
import Link from "next/link";
import { notFound } from "next/navigation";
import { auth } from "@/app/auth";
import UpdateEventForm from "@/app/ui/dashboard/pubEdEvents/updateEventForm";
import Image from "next/image";
import "react-quill/dist/quill.snow.css";

export const metadata = {
  title: "RGV911 Admin Dashboard - Event Details",
};

const EventDetailPage = async ({ params }) => {
  const event = await fetchPubEdEvent(params.id);
  const session = await auth();

  if (!event) {
    notFound();
  }

  // Format date for display
  const formatDate = (date) => {
    return new Date(date).toLocaleDateString('en-US', {
      weekday: 'long',
      year: 'numeric',
      month: 'long',
      day: 'numeric'
    });
  };

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <Link
          href="/dashboard/pubEdEvents"
          className={styles.backButton}
        >
          ← Back to Events
        </Link>
      </div>

      <div className={styles.content}>
        <div className={styles.eventHeader}>
          <h1 className={styles.eventTitle}>{event.title}</h1>
          <p className={styles.eventDate}>
            {formatDate(event.date)}
          </p>
          {event.description && (
            <div 
              className={styles.eventDescription}
              dangerouslySetInnerHTML={{ __html: event.description }}
            />
          )}
        </div>

        {event.images && event.images.length > 0 && (
          <div className={styles.imagesGrid}>
            {event.images.map((image, index) => (
              <div key={index} className={styles.imageContainer}>
                <Image
                  src={image.url}
                  alt={`Event image ${index + 1}`}
                  fill
                  sizes="(max-width: 768px) 100vw, (max-width: 1200px) 50vw, 33vw"
                  className={styles.eventImage}
                />
              </div>
            ))}
          </div>
        )}

        <div className={styles.updateSection}>
          <h2 className={styles.sectionTitle}>Update Event</h2>
          <UpdateEventForm event={event} session={session} />
        </div>

        {event.createdBy && (
          <p className={styles.createdBy}>
            Created by: {event.createdBy.username}
          </p>
        )}
      </div>
    </div>
  );
};

export default EventDetailPage;