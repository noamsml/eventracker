import { Heading, Link, Spacer, Stack, Tag, Text } from "@chakra-ui/react";
import { FC } from "react";
import {
  BiLinkExternal,
  BiTime,
  BiMap,
  BiMoney,
  BiCalendar,
} from "react-icons/bi";
import { EVENT_TYPE_COLORS } from "../data/constants";
import { Event } from "../data/events";
import { IconWithText } from "./IconWithText";

export interface EventCardProps {
  event: Event;
}

export const EventCard: FC<EventCardProps> = ({ event }) => {
  return (
    <Stack borderBottomWidth={1} p={4} fontSize="sm">
      <Stack direction="row">
        <Tag colorScheme={EVENT_TYPE_COLORS[event.type] ?? "gray"}>
          {event.type}
        </Tag>
        <Tag>{event.location}</Tag>
        <Spacer />
        <Text color="gray.500">
          {event.relativeStartTime && <Text>{event.relativeStartTime}</Text>}
        </Text>
      </Stack>
      <Heading size="md">{event.name}</Heading>

      <Text mb={3}>{event.description}</Text>

      <Stack direction="row" alignItems="center" spacing={4}>
        <IconWithText icon={BiCalendar}>{event.dateFormatted}</IconWithText>
        {event.startTimeFormatted && (
          <>
            <IconWithText icon={BiTime}>
              {event.startTimeFormatted}
              {event.endTimeFormatted && <> &mdash; {event.endTimeFormatted}</>}
            </IconWithText>
          </>
        )}
        <Spacer />
      </Stack>

      <IconWithText icon={BiMap}>
        {event.address}{" "}
        <Link
          href={`https://www.google.com/maps/search/?api=1&query=${event.address}`}
          color="blue.500"
        >
          (Map)
        </Link>
      </IconWithText>
      <IconWithText icon={BiMoney}>{event.cost}</IconWithText>

      {event.link && (
        <Link
          variant=""
          href={event.link}
          color="blue.500"
          isExternal
          target="_blank"
          rel="noopener noreferrer"
        >
          <IconWithText icon={BiLinkExternal}>Website</IconWithText>
        </Link>
      )}
    </Stack>
  );
};
