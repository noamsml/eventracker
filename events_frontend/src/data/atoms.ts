import { atom } from "jotai";
import { groupBy, omit, uniq, uniqBy } from "lodash";
import { FilterOption } from "../components/SelectSomething";
import { DATE_RANGE_OPTIONS, EVENT_TYPE_COLORS, WHENEVER } from "./constants";
import { DateRange, getDateRange, getMonthRange } from "./dateRanges";
import { atomFamily, atomWithReset } from "jotai/utils";
import { Event } from "./api";
import { DateTime } from "luxon";

type EventFilter = {
  type?: string;
  location?: string;
  from?: string;
  to?: string;
};

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
  value: "Whatever",
});
export const selectedLocationAtom = atomWithReset<FilterOption>({
  value: "Wherever",
});

// The date range option the user has selected. This just holds the options like
// "today" or "this weekend" options rather than the actual date ranges. Easier
// for the dropdown that way.
export const selectedDateRangeOptionAtom =
  atomWithReset<FilterOption>(WHENEVER);

// Final date range to filter with. It's the range for the selected option, the
// user's custom range or undefined if nothing was selected
export const selectedDateRangeAtom = atom<DateRange | undefined>((get) => {
  const selectedDateRangeOption = get(selectedDateRangeOptionAtom);
  return (
    getDateRange(selectedDateRangeOption.value) ||
    getMonthRange(selectedDateRangeOption.value)
  );
});

// Now take the user's selections and make an atom which we can use elsewhere
export const eventFilterAtom = atom<EventFilter>((get) => {
  const type = get(selectedEventTypeAtom).value;
  const location = get(selectedLocationAtom).value;
  const dateRange = get(selectedDateRangeAtom);
  const { from, to } = dateRange || { from: undefined, to: undefined };
  return { type, location, from, to };
});

const filterEvents = (
  events: Event[],
  filter: { type?: string; location?: string; from?: string; to?: string },
): Event[] => {
  const { type, location, from, to } = filter;
  return events.filter((event) => {
    const anyType = type === undefined || type === "Whatever";
    const anyLocation = location === undefined || location === "Wherever";
    return (
      (anyType || event.type === type) &&
      (anyLocation || event.location === location) &&
      (from === undefined || event.date >= from) &&
      (to === undefined || event.date <= to)
    );
  });
};

// Next to each option in the UI, we show an event count. These might get
// expensive to calculate, so this atomFamily trick memoizes the results into
// a lookup.
// see https://jotai.org/docs/utilities/family
const filteredEventCountAtomFamily = atomFamily(
  (filter: {
    type?: string;
    location?: string;
    from?: string;
    to?: string;
  }) => {
    return atom((get) => {
      const events = get(eventsAtom);
      return filterEvents(events, filter).length;
    });
  },
);

export const filteredEventsAtom = atom((get) => {
  const events = get(eventsAtom);
  const type = get(selectedEventTypeAtom).value;
  const location = get(selectedLocationAtom).value;
  const dateRange = get(selectedDateRangeAtom);
  const { from, to } = dateRange || { from: undefined, to: undefined };
  return filterEvents(events, { type, location, from, to });
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

// A list of the months the events happen. We'll use this to filter far out events
export const eventMonthsAtom = atom((get) => {
  const events = get(eventsAtom);
  const months = events
    .map((event) => DateTime.fromISO(event.date).toFormat("yyyy-MM"))
    .filter((value, index, self) => self.indexOf(value) === index)
    .sort();
  return months;
});

// Turn the event types options for the SelectSomething component.
// Includes the count by re-filtering the events by each option.
export const eventTypeOptionsAtom = atom((get) => {
  const allOption = { value: "Whatever" };
  const filter = get(eventFilterAtom);
  const options = get(eventTypesAtom).map((value) => ({
    value: value,
    color: EVENT_TYPE_COLORS[value] || "gray",
    count: get(filteredEventCountAtomFamily({ ...filter, type: value })),
  }));
  return [allOption, ...options];
});

// Do the same for event locations
export const locationOptionsAtom = atom((get) => {
  const allOption = { value: "Wherever" };
  const filter = get(eventFilterAtom);
  const options = get(locationsAtom).map((value) => {
    const count = get(
      filteredEventCountAtomFamily({ ...filter, location: value }),
    );
    return { value, count };
  });
  return [allOption, ...options];
});

// Create some options for months. We look at the data for these
// and find the unique months, get their event counts and
// return them as options. The
const monthOptionsAtom = atom((get) => {
  const events = get(eventsAtom);
  const filter = get(eventFilterAtom);
  // Extract unique months from events
  const months = uniq(
    events.map((event: any) =>
      DateTime.fromISO(event.date).toFormat("yyyy-MM"),
    ),
  );
  // Create filter options with formatted labels and counts
  const options: FilterOption[] = months.map((month) => {
    const date = DateTime.fromFormat(month, "yyyy-MM");
    const label = date.toFormat("MMMM");
    const dateRange: DateRange = {
      from: date.toFormat("yyyy-MM-01"),
      to: date.endOf("month").toFormat("yyyy-MM-dd"),
    };
    const count = get(
      filteredEventCountAtomFamily({ ...filter, ...dateRange }),
    );
    return { value: month, label, count };
  });

  return options;
});

export const dateRangeOptionsAtom = atom((get) => {
  const allOption = WHENEVER;
  const filter = get(eventFilterAtom);
  const monthOptions = get(monthOptionsAtom);
  const options = DATE_RANGE_OPTIONS.map((option) => {
    const dateRange = getDateRange(option.value);
    const count = dateRange
      ? get(filteredEventCountAtomFamily({ ...filter, ...dateRange }))
      : 0;
    return { ...option, count };
  });
  return [allOption, ...options, ...monthOptions];
});
