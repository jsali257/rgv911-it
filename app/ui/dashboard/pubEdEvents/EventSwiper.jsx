'use client';

import { Swiper, SwiperSlide } from 'swiper/react';
import { Navigation, Pagination, Autoplay } from 'swiper/modules';
import Image from 'next/image';
import Link from 'next/link';
import styles from './pubEdEvents.module.css';

// Import Swiper styles
import 'swiper/css';
import 'swiper/css/navigation';
import 'swiper/css/pagination';

const EventSwiper = ({ event }) => {
  if (!event?.images?.length) return null;

  return (
    <Link href={`/dashboard/pubEdEvents/${event._id}`} className={styles.swiperContainer}>
      <Swiper
        modules={[Navigation, Pagination, Autoplay]}
        spaceBetween={0}
        slidesPerView={1}
        navigation
        pagination={{ clickable: true }}
        autoplay={{
          delay: 5000,
          disableOnInteraction: false,
        }}
        className={styles.swiper}
      >
        {event.images.map((image, index) => (
          <SwiperSlide key={image.publicId || index}>
            <div className={styles.slideImageContainer}>
              <Image
                src={image.url}
                alt={image.originalFilename || `${event.title} - Image ${index + 1}`}
                fill
                className="object-cover"
                priority={index === 0}
              />
              <div className={styles.slideCaption}>
                <h3 className={styles.slideTitle}>{event.title}</h3>
                <p className={styles.slideDate}>
                  {new Date(event.date).toLocaleDateString('en-US', {
                    weekday: 'long',
                    year: 'numeric',
                    month: 'long',
                    day: 'numeric',
                  })}
                </p>
                <p className={styles.slideDescription}>
                  {event.description.length > 150
                    ? `${event.description.slice(0, 150)}...`
                    : event.description}
                </p>
              </div>
            </div>
          </SwiperSlide>
        ))}
      </Swiper>
    </Link>
  );
};

export default EventSwiper;
