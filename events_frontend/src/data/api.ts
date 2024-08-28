import { DateTime } from "luxon";
import { formatDate, formatEventTime, formatRelativeTime } from "./dateFormats";
import isUrl from "is-url";

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
  const endDate = DateTime.now().plus({ months: 3 }).toISODate();
  const prodUrl = `/v1/events?end_date=${endDate}`;
  const localUrl = "/example.json";
  const url = process.env.NODE_ENV === "development" ? localUrl : prodUrl;
  const json = await fetch(url).then((res) => res.json());
  return json.events
    .map((event: Event) => {
      const formattedTimes = {
        dateFormatted: formatDate(event.date),
        startTimeFormatted: formatEventTime(event.start),
        endTimeFormatted: formatEventTime(event.end),
        relativeStartTime: formatRelativeTime(event.date, event.start),
      };
      const validatedLink = isUrl(event.link || "") ? event.link : null;
      return {
        ...event,
        ...formattedTimes,
        link: validatedLink,
      };
    })
    .filter(validateEvent);
};

// Basic data validation. Ideally this is done upstream of the UI but
// this is fine for now.
const requiredFields: (keyof Event)[] = [
  "id",
  "name",
  "date",
  "type",
  "location",
];

export function validateEvent(event: Event): boolean {
  const fieldsValid = requiredFields.every((field) => {
    if (
      event[field] === null ||
      event[field] === undefined ||
      event[field] === ""
    ) {
      console.error(
        `Validation error in event "${event.name}" (ID: ${event.id}): ${field} is required and cannot be null, undefined, or an empty string.`,
      );
      return false;
    }
    return true;
  });
  const startValid = validateEventTime(event.start, event.name, event.id);
  return fieldsValid && startValid;
}

function validateEventTime(
  eventTime: EventTime | null,
  eventName: string,
  eventId: string,
): boolean {
  if (eventTime === null) {
    console.error(
      `Validation error in event "${eventName}" (ID: ${eventId}): start time is required and cannot be null.`,
    );
    return false;
  }

  const { hour, minute, second } = eventTime;
  if (
    hour < 0 ||
    hour > 23 ||
    minute < 0 ||
    minute > 59 ||
    second < 0 ||
    second > 59
  ) {
    console.error(
      `Validation error in event "${eventName}" (ID: ${eventId}): start time is invalid.`,
    );
    return false;
  }

  return true;
}
