import {
  Button,
  Heading,
  HStack,
  Icon,
  Link,
  Spacer,
  Stack,
  Tag,
  Text,
} from "@chakra-ui/react";
import { FC } from "react";
import {
  BiCalendar,
  BiCalendarPlus,
  BiLinkExternal,
  BiMap,
  BiMoney,
  BiTime,
} from "react-icons/bi";
import {
  downloadIcsFn,
  googleCalendarUrl,
  outlookCalendarUrl,
} from "../data/calendarLinks";
import { EVENT_TYPE_COLORS } from "../data/constants";
import { Event } from "../data/api";
import { IconWithText } from "./IconWithText";

export interface EventCardProps {
  event: Event;
}

export const EventCard: FC<EventCardProps> = ({ event }) => {
  const googleUrl = googleCalendarUrl(event);
  const outlookUrl = outlookCalendarUrl(event);
  const onDownloadIcs = downloadIcsFn(event);
  return (
    <Stack borderBottomWidth={1} p={4} fontSize="sm">
      <Stack direction="row">
        <Tag colorScheme={EVENT_TYPE_COLORS[event.type] ?? "gray"}>
          {event.type}
        </Tag>
        <Tag>{event.location}</Tag>
        <Spacer />

        {event.relativeStartTime && (
          <Text color="gray.500">{event.relativeStartTime}</Text>
        )}
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

      <HStack>
        {event.link && (
          <Link
            href={event.link}
            isExternal
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              leftIcon={<Icon as={BiLinkExternal} color="red.300" />}
              size="xs"
              variant="dcOutline"
            >
              Website
            </Button>
          </Link>
        )}

        {googleUrl && (
          <Link
            href={googleUrl}
            isExternal
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              leftIcon={<Icon as={BiCalendarPlus} color="red.300" />}
              size="xs"
              variant="dcOutline"
            >
              Google
            </Button>
          </Link>
        )}

        {outlookUrl && (
          <Link
            href={outlookUrl}
            isExternal
            target="_blank"
            rel="noopener noreferrer"
          >
            <Button
              leftIcon={<Icon as={BiCalendarPlus} color="red.300" />}
              size="xs"
              variant="dcOutline"
            >
              Outlook
            </Button>
          </Link>
        )}

        {onDownloadIcs && (
          <Button
            leftIcon={<Icon as={BiCalendarPlus} color="red.300" />}
            size="xs"
            variant="dcOutline"
            onClick={onDownloadIcs}
          >
            ICS
          </Button>
        )}
      </HStack>
    </Stack>
  );
};
