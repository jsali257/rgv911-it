'use client';

import styles from "./pubEdEvents.module.css";
import Link from "next/link";
import Image from "next/image";
import { MdDelete } from "react-icons/md";
import { deleteEvent } from "@/app/lib/actions";
import { useTransition, useCallback } from "react";
import { useRouter } from "next/navigation";

const EventCard = ({ event }) => {
  const [isPending, startTransition] = useTransition();
  const router = useRouter();

  const handleDelete = useCallback(() => {
    if (window.confirm(`Are you sure you want to delete "${event.title}"?`)) {
      startTransition(async () => {
        await deleteEvent(event._id);
        router.refresh();
      });
    }
  }, [event._id, event.title, router]);

  return (
    <div className={styles.eventCardWrapper}>
      <Link 
        href={`/dashboard/pubEdEvents/${event._id}`}
        className={styles.eventCard}
      >
        <div className={styles.imageContainer}>
          {event.images?.[0]?.url ? (
            <Image
              src={event.images[0].url}
              alt={event.images[0].originalFilename || event.title}
              fill
              sizes="(max-width: 768px) 100vw, (max-width: 1024px) 50vw, 33vw"
              className={styles.eventImage}
            />
          ) : (
            <div className={styles.noImage}>
              <span>No image available</span>
            </div>
          )}
        </div>
        <div className={styles.eventInfo}>
          <h3 className={styles.eventTitle}>{event.title}</h3>
          <p className={styles.eventDate}>
            {new Date(event.date).toLocaleDateString('en-US', {
              weekday: 'long',
              year: 'numeric',
              month: 'long',
              day: 'numeric',
            })}
          </p>
          <div 
            className={styles.eventDescription}
            dangerouslySetInnerHTML={{ __html: event.description }}
          />
        </div>
      </Link>
      <button 
        onClick={handleDelete}
        className={`${styles.deleteButton} ${isPending ? styles.deleting : ''}`}
        disabled={isPending}
      >
        <MdDelete className={styles.deleteIcon} />
      </button>
    </div>
  );
};

const EventsClient = ({ events }) => {
  if (!events || events.length === 0) {
    return (
      <div className={styles.container}>
        <div className={styles.top}>
          <div className={styles.info}>
            <h1>Public Education Events</h1>
          </div>
          <Link href="/dashboard/pubEdEvents/add" className={styles.addButton}>
            New Event
          </Link>
        </div>
        <div className={styles.noEvents}>
          <p>No events found. Create a new event to get started!</p>
        </div>
      </div>
    );
  }

  return (
    <div className={styles.container}>
      <div className={styles.top}>
        <div className={styles.info}>
          <h1>Public Education Events</h1>
        </div>
        <Link href="/dashboard/pubEdEvents/add" className={styles.addButton}>
          New Event
        </Link>
      </div>
      
      <div className={styles.content}>
        <div className={styles.eventsGrid}>
          {events.map((event) => (
            <EventCard key={event._id} event={event} />
          ))}
        </div>
      </div>
    </div>
  );
};

export default EventsClient;
