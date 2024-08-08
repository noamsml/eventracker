import { DateTime } from "luxon";
import { DateRangeOptionValues } from "./constants";

export interface DateRange {
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
}

// This takes a date range option like "thisWeek" and returns the
// iso 8601 formatted range (yyyy-mm-dd) which we can user to for filtering
export function getDateRange(
  rangeType: DateRangeOptionValues,
): DateRange | undefined {
  const today = DateTime.now().startOf("day");
  let from: DateTime;
  let to: DateTime;

  switch (rangeType) {
    case "today":
      from = today;
      to = today;
      break;
    case "tomorrow":
      from = today.plus({ days: 1 });
      to = from;
      break;

    // TODO: Is it more useful to people to consider a week as today + 7 days,
    // and next week as 7 to 14 days?
    case "thisWeek":
      from = today;
      to = today.plus({ days: 7 });
      // from = today.startOf("week");
      // to = today.endOf("week");
      break;
    case "nextWeek":
      from = today.plus({ days: 7 });
      to = today.plus({ days: 14 });
      // from = today.startOf("week").plus({ weeks: 1 });
      // to = from.endOf("week");
      break;
    case "thisWeekend":
      from = today.startOf("week").plus({ days: 4 }); // Friday
      to = from.plus({ days: 2 }); // Sunday
      break;
    case "nextWeekend":
      from = today.startOf("week").plus({ weeks: 1 }).plus({ days: 4 }); // Next Friday
      to = from.plus({ days: 2 }); // Next Sunday
      break;
    default:
      return;
  }
  const fromIso = from.toISODate();
  const toIso = to.toISODate();
  if (!fromIso || !toIso) return undefined;
  return { from: fromIso, to: toIso };
}

// Take a string in the format of yyyy-MM and return a DateRange or undefined
// if something went wrong
export function getMonthRange(yearAndMonth: string): DateRange | undefined {
  const date = DateTime.fromFormat(yearAndMonth, "yyyy-MM");
  if (!date.isValid) return undefined;
  return {
    from: date.toFormat("yyyy-MM-01"),
    to: date.endOf("month").toFormat("yyyy-MM-dd"),
  };
}
