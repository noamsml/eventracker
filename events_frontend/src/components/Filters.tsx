import { HStack, Stack, Text, VStack } from "@chakra-ui/react";
import { useAtom, useAtomValue } from "jotai";
import {
  dateRangeOptionsAtom,
  eventTypeOptionsAtom,
  locationOptionsAtom,
  selectedDateRangeOptionAtom,
  selectedEventTypeAtom,
  selectedLocationAtom,
} from "../data/atoms";
import { SelectSomething } from "./SelectSomething";
import { BiCalendar, BiMap, BiMapPin, BiParty } from "react-icons/bi";

export const MobileFilters = () => {
  return (
    <HStack
      p={4}
      spacing={3}
      background="red.200"
      direction="row"
      overflowY="auto"
    >
      <SelectDateRange />
      <SelectLocation />
      <SelectEventType />
    </HStack>
  );
};

export const DesktopFilters = () => {
  return (
    <VStack
      p={4}
      spacing={3}
      direction="row"
      alignItems="top"
      width="15rem"
      position="sticky"
      top="0"
      zIndex={10}
    >
      <SelectDateRange />
      <SelectLocation />
      <SelectEventType />
    </VStack>
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
      icon={<BiMap />}
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
      icon={<BiParty />}
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
      icon={<BiCalendar />}
    />
  );
};