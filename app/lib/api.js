// Function to fetch all events
export async function getEvents() {
  try {
    const response = await fetch('/api/events', {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching to always get fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch events');
    }

    const data = await response.json();
    return data.events;
  } catch (error) {
    console.error('Error fetching events:', error);
    throw error;
  }
}

// Function to fetch a single event by ID
export async function getEvent(id) {
  try {
    const response = await fetch(`/api/events/${id}`, {
      method: 'GET',
      headers: {
        'Content-Type': 'application/json',
      },
      cache: 'no-store', // Disable caching to always get fresh data
    });

    if (!response.ok) {
      const error = await response.json();
      throw new Error(error.message || 'Failed to fetch event');
    }

    const data = await response.json();
    return data.event;
  } catch (error) {
    console.error('Error fetching event:', error);
    throw error;
  }
}

// Example usage of the API functions:
/*
// Fetch all events
try {
  const events = await getEvents();
  console.log('All events:', events);
} catch (error) {
  console.error('Error:', error);
}

// Fetch a single event
try {
  const event = await getEvent('event-id');
  console.log('Single event:', event);
} catch (error) {
  console.error('Error:', error);
}
*/
