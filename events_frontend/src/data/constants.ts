import { theme } from "@chakra-ui/react";
import { FilterOption } from "../components/SelectSomething";

export const EVENT_TYPE_COLORS: Record<string, keyof typeof theme.colors> = {
  "Open Mic": "purple",
  Film: "teal",
  Festival: "yellow",
  Workshop: "blue",
  "Something Else": "gray",
  "Poetry/Lit": "pink",
  "Multi Media": "orange",
  Drag: "red",
  Music: "green",
  Theater: "cyan",
  Party: "purple",
  Meetup: "blue",
  "Visual Art": "pink",
};

export const WHENEVER: FilterOption = { value: "whenever", label: "Whenever" };

export const DATE_RANGE_OPTIONS: FilterOption[] = [
  WHENEVER,
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "thisWeek", label: "This week" },
  { value: "nextWeek", label: "Next week" },
  { value: "thisWeekend", label: "This weekend" },
  { value: "nextWeekend", label: "Next weekend" },
];
export type DateRangeOptionValues =
  (typeof DATE_RANGE_OPTIONS)[number]["value"];
