import { atom } from "jotai";
import { groupBy, uniqBy } from "lodash";
import { FilterOption } from "../components/SelectSomething";
import { EVENT_TYPE_COLORS, WHENEVER } from "./constants";
import { DateRange, getDateRange } from "./dateRanges";
import { atomWithReset } from "jotai/utils";
import { Event } from "./api";

// A note about Jotai Atoms:
//
// Atoms make it super easy to work with derived state. In this app, most
// of the atoms are derived from the eventsAtom below. When it changes,
// the rest of them change automatically if needed. It makes state
// management a breeze. If you're used to Redux, this has the same benefits
// plus computed properties but with almost no boilerplate.
// https://jotai.org/

// Here's where all the events are stored once fetchEvents runs.
export const eventsAtom = atom<Event[]>([]);

// The event and location the user has selected
export const selectedEventTypeAtom = atomWithReset<FilterOption>({
  value: "Anything",
});
export const selectedLocationAtom = atomWithReset<FilterOption>({
  value: "Anywhere",
});

// The date range option the user has selected. This just holds the options like
// "today" or "this weekend" options rather than the actual date ranges. Easier
// for the dropdown that way.
export const selectedDateRangeOptionAtom =
  atomWithReset<FilterOption>(WHENEVER);

// Store the user's custom date range if they've seleted one
export const customDateRangeAtom = atom<DateRange | undefined>(undefined);

// Final date range to filter with. It's the range for the selected option, the
// user's custom range or undefined if nothing was selected
export const selectedDateRangeAtom = atom<DateRange | undefined>((get) => {
  const selectedDateRangeOption = get(selectedDateRangeOptionAtom);
  return selectedDateRangeOption
    ? getDateRange(selectedDateRangeOption.value)
    : get(customDateRangeAtom);
});

// Filter the events by the selections
export const filteredEventsAtom = atom((get) => {
  const type = get(selectedEventTypeAtom).value;
  const location = get(selectedLocationAtom).value;
  const dateRange = get(selectedDateRangeAtom);
  const { from, to } = dateRange || { from: undefined, to: undefined };

  return get(eventsAtom).filter(
    (event) =>
      (type === "Anything" || event.type === type) &&
      (location === "Anywhere" || event.location === location) &&
      (from === undefined || event.date >= from) &&
      (to === undefined || event.date <= to),
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
