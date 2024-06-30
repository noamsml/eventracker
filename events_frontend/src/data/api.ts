import { formatDate, formatEventTime, formatRelativeTime } from "./dateFormats";

// Event Type
//
// Here's how the API returns info about the events. Some of these
// like startTimeFormatted are derived when we load in the data to simplify
// the EventCard display logic.
export interface Event {
  id: string;
  name: string;
  date: string; // 8601 formatted date string, pacific time assumed
  type: string;
  start: EventTime | null;
  end: EventTime | null;
  location: string;
  address: string;
  description: string;
  cost: string;
  link: string | null;
  dateFormatted: string;
  // Derived fields:
  // start and end times converted to a string for display
  startTimeFormatted?: string;
  endTimeFormatted?: string;
  // "3 days from now" or "1 hour ago"
  relativeStartTime?: string;
}
// This is how we store events for each day
export type EventsByDate = Record<string, Event[]>;
// The API represents event times like this:
export interface EventTime {
  hour: number;
  minute: number;
  second: number;
}

// Fetch events and add some fields for easy display
export const fetchEvents = async () => {
  const url = "/example.json";
  const json = await fetch(url).then((res) => res.json());
  return json.events.map((event: Event) => {
    return {
      ...event,
      dateFormatted: formatDate(event.date),
      startTimeFormatted: formatEventTime(event.start),
      endTimeFormatted: formatEventTime(event.end),
      relativeStartTime: formatRelativeTime(event.date, event.start),
    };
  });
};
