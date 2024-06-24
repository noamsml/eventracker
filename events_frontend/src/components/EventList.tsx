import { Box, Heading, Stack, StackItem } from "@chakra-ui/react";
import { useAtomValue } from "jotai";
import { eventDaysAtom, eventsAtom, eventsByDateAtom } from "../data/events";
import { DateTime } from "luxon";
import { Fragment } from "react/jsx-runtime";

export const EventList = () => {
  const eventsByDate = useAtomValue(eventsByDateAtom);
  const eventDays = useAtomValue(eventDaysAtom);

  return (
    <Stack direction="column">
      {eventDays.map((date) => (
        <Fragment key={date}>
          <Box position="sticky" top="0" bg="white" zIndex="1">
            <Heading size="lg">{formatDate(date)}</Heading>
          </Box>
          <ul>
            {eventsByDate[date].map((event) => (
              <li key={event.id}>
                <div>{event.name}</div>
              </li>
            ))}
          </ul>
        </Fragment>
      ))}
    </Stack>
  );
};

const formatDate = (date: string) =>
  DateTime.fromFormat(date, "yyyy-MM-dd").toLocaleString(DateTime.DATE_HUGE);
