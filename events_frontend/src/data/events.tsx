import { atom } from "jotai";
import { groupBy, uniqBy } from "lodash";
import { FilterOption } from "../components/SelectSomething";
import { EVENT_TYPE_COLORS, WHENEVER } from "./constants";
import { formatDate, formatEventTime, formatRelativeTime } from "./dateFormats";

// Here's how the API returns info about the events. Some of these
// like startTimeFormatted are derived when we load in the data to simplify
// the EventCard display logic.
export interface Event {
  id: string;
  name: string;
  date: string;
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

// TODO: Move this to it's own file
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

// A note about Jotai Atoms:
// Atoms make it super easy to work with derived state. In this app, most
// of the atoms are derived from the eventsAtom below. When it changes,
// the rest of them change automatically if needed. It makes derived state
// management a breeze. If you're used to Redux, this has the same benefits
// plus computed properties but with almost no boilerplate.

// Here's where all the events are stored once fetchEvents runs.
export const eventsAtom = atom<Event[]>([]);

// The event and location the user has selected
export const selectedEventTypeAtom = atom<FilterOption>({ value: "Anything" });
export const selectedLocationAtom = atom<FilterOption>({ value: "Anywhere" });
// The date range option the user has selected. This just holds the options like
// "today" or "this weekend" options rather than the actual date ranges. Easier
// for the dropdown that way.
export const selectedDateRangeAtom = atom<FilterOption>(WHENEVER);

// Filter the events by the selections
// TODO: Add date filtering
export const filteredEventsAtom = atom((get) => {
  const type = get(selectedEventTypeAtom).value;
  const location = get(selectedLocationAtom).value;

  // const selectedLocation = get(selectedEventTypeAtom);
  return get(eventsAtom).filter(
    (event) =>
      (type === "Anything" || event.type === type) &&
      (location === "Anywhere" || event.location === location),
  );
});

// Group the events by their date so we can render them by day
export const eventsByDateAtom = atom((get) =>
  groupBy(get(filteredEventsAtom), "date"),
);

// Get just the unique dates, we'll map over these to display the date headers
export const eventDaysAtom = atom((get) =>
  Object.keys(get(eventsByDateAtom)).sort(),
);

// A sorted list of the locations (SF, Oakland, etc) found in the payload.
export const locationsAtom = atom((get) =>
  uniqBy(get(eventsAtom), "location")
    .map((event) => event.location)
    .sort(),
);

// A sorted list of event types found in the payload.
export const eventTypesAtom = atom((get) =>
  uniqBy(get(eventsAtom), "type")
    .map((event) => event.type)
    .sort(),
);

// Turn the event types options for the SelectSomething component.
// It accepts colors and counts
export const eventTypeOptionsAtom = atom((get) => {
  const allOption = { value: "Anything" };
  const options = get(eventTypesAtom).map((eventType) => ({
    value: eventType,
    color: EVENT_TYPE_COLORS[eventType] || "gray",
  }));
  return [allOption, ...options];
});

// Do the same for event locations
export const locationOptionsAtom = atom((get) => {
  const allOption = { value: "Anywhere" };
  const options = get(locationsAtom).map((value) => ({
    value: value,
  }));
  return [allOption, ...options];
});
