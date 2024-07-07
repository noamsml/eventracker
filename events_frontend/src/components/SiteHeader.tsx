import { Heading, HStack, Link, Stack, Text } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import { DATE_RANGE_OPTIONS } from "../data/constants";

import {
  selectedLocationAtom,
  selectedEventTypeAtom,
  locationOptionsAtom,
  eventTypeOptionsAtom,
  selectedDateRangeOptionAtom,
  dateRangeOptionsAtom,
} from "../data/atoms";
import { SelectSomething } from "./SelectSomething";

export const SiteHeader = () => {
  return (
    <Stack spacing={0}>
      <Stack
        direction="row"
        padding={3}
        alignItems="start"
        background="red.100"
      >
        <img
          src="/logo/decentered.png"
          height={60}
          width={60}
          alt="Decentered Logo"
        />
        <Stack spacing={1}>
          <Heading size="sm">Decentered Eventracker</Heading>
          <Text fontSize="sm">
            A curated list of Bay Area events to create an interconnected art
            scene by{" "}
            <Link href="https://decentered.org" color="red.400">
              Decentered Arts
            </Link>
            .
          </Text>
        </Stack>
      </Stack>
      <HStack
        p={4}
        spacing={3}
        background="red.200"
        direction="row"
        overflowY="auto"
      >
        <HStack flexWrap="wrap" spacing={1}>
          <Text fontSize="sm">When?&nbsp;</Text> <SelectDateRange />
        </HStack>
        <HStack flexWrap="wrap" spacing={1}>
          <Text fontSize="sm">Where?&nbsp;</Text> <SelectLocation />
        </HStack>
        <HStack flexWrap="wrap" spacing={1}>
          <Text fontSize="sm">What?&nbsp;</Text> <SelectEventType />
        </HStack>
      </HStack>
    </Stack>
  );
};

const SelectLocation = () => {
  const options = useAtomValue(locationOptionsAtom);
  const [selection, setSelection] = useAtom(selectedLocationAtom);
  return (
    <SelectSomething
      options={options}
      selection={selection}
      onSelect={setSelection}
    />
  );
};

const SelectEventType = () => {
  const options = useAtomValue(eventTypeOptionsAtom);
  const [selection, setSelection] = useAtom(selectedEventTypeAtom);
  return (
    <SelectSomething
      options={options}
      selection={selection}
      onSelect={setSelection}
    />
  );
};

const SelectDateRange = () => {
  const options = useAtomValue(dateRangeOptionsAtom);
  const [selection, setSelection] = useAtom(selectedDateRangeOptionAtom);
  return (
    <SelectSomething
      options={options}
      selection={selection}
      onSelect={setSelection}
    />
  );
};
