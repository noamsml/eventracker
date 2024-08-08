import { DateTime } from "luxon";
import { EventTime } from "./api";

// Format the date into a locale aware string like "Sat, Apr 20, 2030"
export const formatDate = (
  date: string,
  format = DateTime.DATE_MED_WITH_WEEKDAY,
) => DateTime.fromFormat(date, "yyyy-MM-dd").toLocaleString(format);

// Convert the json EventTime into display text, respecting the user's
// locale for 12/24-hour format
export const formatEventTime = (time: EventTime | null): string | undefined => {
  if (!time) return;
  const dateTime = DateTime.fromObject(time);
  if (!dateTime.isValid) return;
  return dateTime.toLocaleString(DateTime.TIME_SIMPLE);
};

// Provide a easy-to-read relative date or time like "2 days from now", "1 hour ago"
export const formatRelativeTime = (
  date: string,
  time?: EventTime | null,
): string => {
  const eventDate = DateTime.fromISO(date);
  const eventDateTime = eventDate.set({
    hour: time?.hour ?? 0,
    minute: time?.minute ?? 0,
    second: time?.second ?? 0,
  });

  const now = DateTime.now();
  const diffInDays = eventDate
    .startOf("day")
    .diff(now.startOf("day"), "days").days;

  // If the event is today and we have a start time, return how many
  //  hours or minutes it until the event
  if (diffInDays === 0 && time) {
    const diffInHours = eventDateTime.diff(now, "hours").hours;
    if (diffInHours <= -1) {
      return `${Math.abs(Math.floor(diffInHours))} hours ago`;
    }
    if (Math.floor(diffInHours) === 1) {
      return `in ${Math.floor(diffInHours)} hour`;
    }
    if (diffInHours >= 1) {
      return `in ${Math.floor(diffInHours)} hours`;
    }
    const diffInMinutes = eventDateTime.diff(now, "minutes").minutes;
    if (diffInMinutes >= 0) {
      return `in ${Math.floor(diffInMinutes)} minutes`;
    }
    return `${Math.abs(Math.floor(diffInMinutes))} minutes ago`;
  }

  if (diffInDays === 0) return "Today!";
  if (diffInDays === 1) return "Tomorrow!";
  if (diffInDays === -1) return "Yesterday";
  return diffInDays > 0
    ? `in ${Math.floor(diffInDays)} days`
    : `${Math.abs(Math.floor(diffInDays))} days ago`;
};
