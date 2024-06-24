import { atom } from "jotai";
import { groupBy } from "lodash";

export interface EventTime {
  hour: number;
  minute: number;
  second: number;
}
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
}
export type EventsByDate = Record<string, Event[]>;

export const eventsAtom = atom<Promise<Event[]>>(async () => {
  const url = "/example.json";
  const json = await fetch(url).then((res) => res.json());
  return json.events;
});

export const eventsByDateAtom = atom<Promise<EventsByDate>>(async (get) => {
  const events = await get(eventsAtom);
  return groupBy(events, "date");
});

// A sorted list of unique dates
export const eventDaysAtom = atom(async (get) => {
  const groupedEvents = await get(eventsByDateAtom);
  return Object.keys(groupedEvents).sort();
});
