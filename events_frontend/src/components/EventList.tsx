import { Box, Heading, Stack } from "@chakra-ui/react";
import { useAtomValue, useSetAtom } from "jotai";
import {
  eventDaysAtom,
  eventsAtom,
  eventsByDateAtom,
  fetchEvents,
} from "../data/events";
import { Fragment } from "react/jsx-runtime";
import { EventCard } from "./EventCard";
import { DateTime } from "luxon";
import { useEffect } from "react";
import { formatDate } from "../data/dateFormats";

export const EventList = () => {
  const setEvents = useSetAtom(eventsAtom);
  const eventsByDate = useAtomValue(eventsByDateAtom);
  const eventDays = useAtomValue(eventDaysAtom);

  // This loads the data an puts it in the eventsAtom. The remaining atoms are all
  // automatically derived from that atom. Nice!
  useEffect(() => {
    fetchEvents().then((events) => setEvents(events));
  }, [setEvents]);

  return (
    <Stack direction="column">
      {eventDays.map((date) => (
        <Fragment key={date}>
          <Box position="sticky" top="0" bg="red.300" zIndex="1" py={3} px={4}>
            <Heading size="sm" color="white">
              {formatDate(date, DateTime.DATE_HUGE)}
            </Heading>
          </Box>
          <ul>
            {eventsByDate[date].map((event) => (
              <EventCard key={event.id} event={event} />
            ))}
          </ul>
        </Fragment>
      ))}
    </Stack>
  );
};
