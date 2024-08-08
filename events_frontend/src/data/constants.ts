import { theme } from "@chakra-ui/react";
import { FilterOption } from "../components/SelectSomething";

export const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1eX21lRIMOl3LLUhanRptk0jWbKoyZJVnbsJ-UWP7JZY/edit#gid=0";
export const SUBMIT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdFneR4syUmZ580W5Ics6IX_y2I4s5ajwZTpX4cCwltl-hcqw/viewform?usp=send_form";
export const DONATE_LINK = "https://givebutter.com/decentered";

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
  { value: "today", label: "Today" },
  { value: "tomorrow", label: "Tomorrow" },
  { value: "thisWeek", label: "This week" },
  { value: "thisWeekend", label: "This weekend" },
  { value: "nextWeek", label: "Next week" },
  { value: "nextWeekend", label: "Next weekend" },
];
export type DateRangeOptionValues =
  (typeof DATE_RANGE_OPTIONS)[number]["value"];
