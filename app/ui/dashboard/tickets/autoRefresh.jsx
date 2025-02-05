"use client";

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

const AutoRefresh = () => {
  const router = useRouter();

  useEffect(() => {
    // Set up interval to refresh every 30 seconds
    const interval = setInterval(() => {
      router.refresh(); // This will trigger a re-fetch of server components
    }, 30000); // 30000 milliseconds = 30 seconds

    // Clean up interval on component unmount
    return () => clearInterval(interval);
  }, [router]);

  // This component doesn't render anything
  return null;
};

export default AutoRefresh;
