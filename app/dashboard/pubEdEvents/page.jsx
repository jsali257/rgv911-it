import { fetchPubEdEvents } from "@/app/lib/data";
import EventsClient from "@/app/ui/dashboard/pubEdEvents/eventsClient";

export const metadata = {
  title: "RGV911 Admin Dashboard - Public Education Events",
};

const PubEdEventsPage = async () => {
  try {
    const { events = [] } = await fetchPubEdEvents();
    return <EventsClient events={events} />;
  } catch (error) {
    console.error('Error loading events:', error);
    return (
      <div>
        <h2>Error loading events. Please try again later.</h2>
      </div>
    );
  }
};

export default PubEdEventsPage;