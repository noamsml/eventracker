import { DateTime } from "luxon";
import { DateRangeOptionValues } from "./constants";

export interface DateRange {
  from?: string; // yyyy-mm-dd
  to?: string; // yyyy-mm-dd
}

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
    case "thisWeek":
      from = today.startOf("week");
      to = today.endOf("week");
      break;
    case "nextWeek":
      from = today.startOf("week").plus({ weeks: 1 });
      to = from.endOf("week");
      break;
    case "thisWeekend":
      from = today.startOf("week").plus({ days: 5 }); // Friday
      to = from.plus({ days: 2 }); // Sunday
      break;
    case "nextWeekend":
      from = today.startOf("week").plus({ weeks: 1 }).plus({ days: 5 }); // Next Friday
      to = from.plus({ days: 2 }); // Next Sunday
      break;
    default:
      return undefined;
  }
  const fromIso = from.toISODate();
  const toIso = to.toISODate();
  if (!fromIso || !toIso) return undefined;
  return { from: fromIso, to: toIso };
}
