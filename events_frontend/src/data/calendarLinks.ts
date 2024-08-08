import {
  CalendarOptions,
  GoogleCalendar,
  ICalendar,
  OutlookCalendar,
} from "datebook";
import { DateTime } from "luxon";
import { Event } from "./api";

// Most of this file was written by ChatGPT:
// https://chatgpt.com/share/abe133c3-d306-4081-a793-c3af923605b5
//
// If you make changes, be super careful with timezones and daylight savings,
// otherwise people downloading events across daylight time shifts could get
// the wrong time.

// Helper function to convert EventTime to a DateTime object and return start and end dates
const convertEventTimeToDateTime = (
  event: Event,
): { start: Date; end: Date | undefined } | undefined => {
  if (!event.start) return undefined;

  const startDate = DateTime.fromISO(event.date, {
    zone: "America/Los_Angeles",
  })
    .set({
      hour: event.start.hour,
      minute: event.start.minute,
      second: event.start.second,
    })
    .toJSDate();

  const endDate = event.end
    ? DateTime.fromISO(event.date, { zone: "America/Los_Angeles" })
        .set({
          hour: event.end.hour,
          minute: event.end.minute,
          second: event.end.second,
        })
        .toJSDate()
    : undefined;

  return { start: startDate, end: endDate };
};

// Helper function to get event details for calendar
const getEventDetails = (event: Event): CalendarOptions | undefined => {
  const dateTimes = convertEventTimeToDateTime(event);
  if (!dateTimes) return undefined;
  let description = event.description;
  if (event.link) {
    description = `${description}\n\n${event.link}`;
  }

  return {
    title: event.name,
    location: event.address,
    description: description,
    start: dateTimes.start,
    end: dateTimes.end,
  };
};

// Function to generate Google Calendar URL
export const googleCalendarUrl = (event: Event): string | undefined => {
  const eventDetails = getEventDetails(event);
  if (!eventDetails) return undefined;

  const googleCalendar = new GoogleCalendar(eventDetails);
  return googleCalendar.render();
};

// Function to generate Outlook Calendar URL
export const outlookCalendarUrl = (event: Event): string | undefined => {
  const eventDetails = getEventDetails(event);
  if (!eventDetails) return undefined;

  const outlookCalendar = new OutlookCalendar(eventDetails);
  return outlookCalendar.render();
};

// Higher-order function to generate downloadIcs function or return undefined
export const downloadIcsFn = (event: Event): (() => void) | undefined => {
  const eventDetails = getEventDetails(event);
  if (!eventDetails) return undefined;

  return () => {
    const icsCalendar = new ICalendar(eventDetails);
    const icsData = icsCalendar.render();
    const blob = new Blob([icsData], { type: "text/calendar" });
    const link = document.createElement("a");
    link.href = URL.createObjectURL(blob);
    link.download = `${event.name}.ics`;
    link.click();
  };
};
