import React, { ChangeEvent, Suspense } from "react";
import logo from "./logo.svg";
import "./App.css";
import { useEffect, useState } from "react";
import { format as dateFormat, parse as dateParse } from "date-format-parse";
import { ChakraProvider } from "@chakra-ui/react";
import { SiteHeader } from "./components/SiteHeader";
import { SiteFooter } from "./components/SiteFooter";
import { EventList } from "./components/EventList";
import decenteredTheme from "./theme";
import { EventListPage } from "./components/EventListPage";

const SPREADSHEET_URL =
  "https://docs.google.com/spreadsheets/d/1eX21lRIMOl3LLUhanRptk0jWbKoyZJVnbsJ-UWP7JZY/edit#gid=0";
const SUBMIT_URL =
  "https://docs.google.com/forms/d/e/1FAIpQLSdFneR4syUmZ580W5Ics6IX_y2I4s5ajwZTpX4cCwltl-hcqw/viewform?usp=send_form";
const DONATE_LINK = "https://givebutter.com/decentered";
const ALL_LOCATION_VALUES = [
  "San Francisco",
  "Oakland",
  "Berkeley",
  "East Bay",
  "North Bay",
  "South Bay",
  "Out of Town",
  "Treasure Island",
  "Various Locations",
];

interface TimeJson {
  hour: number;
  minute: number;
  second: number;
}

export interface EventJson {
  name: string;
  date: string;
  type: string;
  start: TimeJson | null;
  end: TimeJson | null;
  location: string;
  address: string;
  description: string;
  cost: string;
  link: string | null;
}

class EventsAndDate {
  events: Array<EventJson>;
  date: Date;

  constructor(date: Date) {
    this.date = date;
    this.events = [];
  }
}

function SocialLinks() {
  return (
    <div className="socialLinks">
      <a
        href="https://www.facebook.com/people/Decentered-Arts/61557033081908/"
        className="social"
        target="_blank"
      >
        {" "}
        <span className="sr-only" data-astro-cid-sz7xmlte="">
          Facebook
        </span>{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 256 256"
          aria-hidden="true"
          stroke="#fff"
          fill="#fff"
          className="astro-patnjmll"
          data-astro-cid-patnjmll=""
        >
          {" "}
          <g data-astro-cid-patnjmll="">
            <path d="M149.333 255.776V256H213.333C236.897 256 256 236.897 256 213.333V42.6667C256 19.1025 236.897 0 213.333 0H42.6667C19.1025 0 0 19.1025 0 42.6667V213.333C0 236.897 19.1025 256 42.6667 256H106.667V255.777C107.121 255.854 107.576 255.928 108.032 256V166.04H75.5199V128.771H108.032V100.369C108.032 68.1125 127.104 50.3775 156.416 50.3775C170.368 50.3775 184.96 52.8193 184.96 52.8193V84.5623H168.832C152.96 84.5623 147.968 94.4578 147.968 104.61V128.771H183.552L177.792 166.04H147.968V256C148.424 255.928 148.879 255.853 149.333 255.776Z"></path>
          </g>{" "}
        </svg>{" "}
      </a>
      <a
        href="https://www.linkedin.com/company/decentered-arts/"
        className="social"
        target="_blank"
      >
        {" "}
        <span className="sr-only" data-astro-cid-sz7xmlte="">
          LinkedIn
        </span>{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 256 256"
          aria-hidden="true"
          stroke="#fff"
          fill="#fff"
          className="astro-patnjmll"
          data-astro-cid-patnjmll=""
        >
          {" "}
          <g data-astro-cid-patnjmll="">
            <path d="M227.556 0C235.099 0 242.334 2.99682 247.669 8.33118C253.003 13.6656 256 20.9005 256 28.4444V227.556C256 235.099 253.003 242.334 247.669 247.669C242.334 253.003 235.099 256 227.556 256H28.4444C20.9005 256 13.6656 253.003 8.33118 247.669C2.99682 242.334 0 235.099 0 227.556V28.4444C0 20.9005 2.99682 13.6656 8.33118 8.33118C13.6656 2.99682 20.9005 0 28.4444 0H227.556ZM220.444 220.444V145.067C220.444 132.77 215.56 120.977 206.865 112.282C198.17 103.587 186.377 98.7022 174.08 98.7022C161.991 98.7022 147.911 106.098 141.084 117.191V101.404H101.404V220.444H141.084V150.329C141.084 139.378 149.902 130.418 160.853 130.418C166.134 130.418 171.199 132.516 174.933 136.25C178.667 139.984 180.764 145.048 180.764 150.329V220.444H220.444ZM55.1822 79.0756C61.5191 79.0756 67.5965 76.5582 72.0774 72.0774C76.5582 67.5965 79.0756 61.5191 79.0756 55.1822C79.0756 41.9556 68.4089 31.1467 55.1822 31.1467C48.8076 31.1467 42.6941 33.679 38.1865 38.1865C33.679 42.6941 31.1467 48.8076 31.1467 55.1822C31.1467 68.4089 41.9556 79.0756 55.1822 79.0756ZM74.9511 220.444V101.404H35.5556V220.444H74.9511Z"></path>
          </g>{" "}
        </svg>{" "}
      </a>
      <a
        href="https://www.instagram.com/decenteredarts/"
        className="social"
        target="_blank"
      >
        {" "}
        <span className="sr-only" data-astro-cid-sz7xmlte="">
          Instagram
        </span>{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 256 256"
          aria-hidden="true"
          stroke="#fff"
          fill="#fff"
          className="astro-patnjmll"
          data-astro-cid-patnjmll=""
        >
          {" "}
          <g data-astro-cid-patnjmll="">
            <path d="M74.24 0H181.76C222.72 0 256 33.28 256 74.24V181.76C256 201.45 248.178 220.333 234.256 234.256C220.333 248.178 201.45 256 181.76 256H74.24C33.28 256 0 222.72 0 181.76V74.24C0 54.5503 7.82169 35.6671 21.7444 21.7444C35.6671 7.82169 54.5503 0 74.24 0M71.68 25.6C59.4588 25.6 47.7382 30.4548 39.0965 39.0965C30.4548 47.7382 25.6 59.4588 25.6 71.68V184.32C25.6 209.792 46.208 230.4 71.68 230.4H184.32C196.541 230.4 208.262 225.545 216.903 216.903C225.545 208.262 230.4 196.541 230.4 184.32V71.68C230.4 46.208 209.792 25.6 184.32 25.6H71.68ZM195.2 44.8C199.443 44.8 203.513 46.4857 206.514 49.4863C209.514 52.4869 211.2 56.5565 211.2 60.8C211.2 65.0435 209.514 69.1131 206.514 72.1137C203.513 75.1143 199.443 76.8 195.2 76.8C190.957 76.8 186.887 75.1143 183.886 72.1137C180.886 69.1131 179.2 65.0435 179.2 60.8C179.2 56.5565 180.886 52.4869 183.886 49.4863C186.887 46.4857 190.957 44.8 195.2 44.8ZM128 64C144.974 64 161.253 70.7428 173.255 82.7452C185.257 94.7475 192 111.026 192 128C192 144.974 185.257 161.253 173.255 173.255C161.253 185.257 144.974 192 128 192C111.026 192 94.7475 185.257 82.7452 173.255C70.7428 161.253 64 144.974 64 128C64 111.026 70.7428 94.7475 82.7452 82.7452C94.7475 70.7428 111.026 64 128 64M128 89.6C117.816 89.6 108.048 93.6457 100.847 100.847C93.6457 108.048 89.6 117.816 89.6 128C89.6 138.184 93.6457 147.952 100.847 155.153C108.048 162.354 117.816 166.4 128 166.4C138.184 166.4 147.952 162.354 155.153 155.153C162.354 147.952 166.4 138.184 166.4 128C166.4 117.816 162.354 108.048 155.153 100.847C147.952 93.6457 138.184 89.6 128 89.6Z"></path>
          </g>{" "}
        </svg>{" "}
      </a>
      <a
        href="https://www.youtube.com/@decentered"
        className="social"
        target="_blank"
      >
        {" "}
        <span className="sr-only" data-astro-cid-sz7xmlte="">
          YouTube
        </span>{" "}
        <svg
          xmlns="http://www.w3.org/2000/svg"
          width="40"
          height="40"
          viewBox="0 0 256 256"
          aria-hidden="true"
          stroke="#fff"
          fill="#fff"
          className="astro-patnjmll"
          data-astro-cid-patnjmll=""
        >
          {" "}
          <g data-astro-cid-patnjmll="">
            <path d="M102.4 170.667L168.832 132.267L102.4 93.8667V170.667ZM250.368 70.4427C252.032 76.4587 253.184 84.5227 253.952 94.7627C254.848 105.003 255.232 113.835 255.232 121.515L256 132.267C256 160.299 253.952 180.907 250.368 194.091C247.168 205.611 239.744 213.035 228.224 216.235C222.208 217.899 211.2 219.051 194.304 219.819C177.664 220.715 162.432 221.099 148.352 221.099L128 221.867C74.368 221.867 40.96 219.819 27.776 216.235C16.256 213.035 8.832 205.611 5.632 194.091C3.968 188.075 2.816 180.011 2.048 169.771C1.152 159.531 0.767999 150.699 0.767999 143.019L0 132.267C0 104.235 2.048 83.6267 5.632 70.4427C8.832 58.9227 16.256 51.4987 27.776 48.2987C33.792 46.6347 44.8 45.4827 61.696 44.7147C78.336 43.8187 93.568 43.4347 107.648 43.4347L128 42.6667C181.632 42.6667 215.04 44.7147 228.224 48.2987C239.744 51.4987 247.168 58.9227 250.368 70.4427Z"></path>
          </g>{" "}
        </svg>{" "}
      </a>
    </div>
  );
}

function App() {
  return (
    <ChakraProvider theme={decenteredTheme}>
      <EventListPage />
    </ChakraProvider>
  );
}

function AppOld() {
  return (
    <div className="App">
      <header className="App-header">
        <h1>
          <img src="/logo/decentered.png" />
          Decentered Eventracker
        </h1>
        <div className="linkAndExplanation">
          A curated list of Bay Area events to create an interconnected art
          scene{" "}
        </div>
        <div className="linkAndExplanation">
          By{" "}
          <a
            className="spreadsheetLink"
            href="https://decenteredarts.org"
            target="_blank"
          >
            Decentered Arts
          </a>
        </div>
        <div className="subLinks">
          <a className="spreadsheetLink" href={SUBMIT_URL} target="_blank">
            Submit an event
          </a>{" "}
          |{" "}
          <a className="spreadsheetLink" href={DONATE_LINK} target="_blank">
            Donate
          </a>
        </div>
      </header>

      <EventList />

      <footer>
        <div className="footerDisplay">
          <div className="copyright">
            Events imported from{" "}
            <a
              href={SPREADSHEET_URL}
              target="_blank"
              className="spreadsheetLink"
            >
              the Decentered Eventracker spreadsheet
            </a>
            <br />
            Decentered Arts
            <br />
            {new Date().getFullYear()}
          </div>
          <div className="socialPlus">
            <SocialLinks />
            <div>hello@decentered.org</div>
          </div>
        </div>
      </footer>
    </div>
  );
}

function EventListOld() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [events, setEvents] = useState(Array<EventJson>());
  const [error, setError] = useState(false);

  const [isLoading, setIsLoading] = useState(false);

  function formatDateForUrl(date: Date) {
    return dateFormat(date, "YYYY-MM-DD");
  }

  useEffect(() => {
    if (startDate && !endDate) {
      console.log("Skipping effect due to in-progress range");
      return;
    }

    // var url: string = "/v1/events";
    var url: string = "/example.json";

    if (startDate && endDate) {
      url =
        url +
        `?start_date=${formatDateForUrl(startDate)}&end_date=${formatDateForUrl(endDate)}`;
    }

    setIsLoading(true);

    fetch(url)
      .then((response) => response.json())
      .then((responseJson) => {
        setEvents(responseJson.events);
        setIsLoading(false);
        setError(false);
      })
      .catch((e) => {
        console.log(e);
        setError(true);
        setIsLoading(false);
      });
  }, [startDate, endDate]);

  function onDateFilterChange(start: Date | null, end: Date | null) {
    setStartDate(start);
    setEndDate(end);
  }

  return (
    <div className="eventList">
      <div className="filters">
        <DateFilterPanel
          startDate={startDate}
          endDate={endDate}
          onChange={onDateFilterChange}
        />
      </div>
      <EventListDisplay events={events} error={error} isLoading={isLoading} />
    </div>
  );
}

function DateFilterPanel({
  startDate,
  endDate,
  onChange,
}: {
  startDate: Date | null;
  endDate: Date | null;
  onChange: (start: Date | null, end: Date | null) => void;
}) {
  const [selectRange, setSelectRange] = useState<boolean>(false);

  function valueAsDate(value: string | null) {
    if (!value) {
      return null;
    }

    return dateParse(value, "YYYY-MM-DD");
  }

  const onDatePickerSingleChange = (event: ChangeEvent<HTMLInputElement>) => {
    const date = valueAsDate(event.target.value);
    onChange(date, date);
  };

  const onDatePickerStartChange = (event: ChangeEvent<HTMLInputElement>) => {
    const newStart = valueAsDate(event.target.value);

    if (!newStart || (endDate && newStart > endDate)) {
      onChange(newStart, null);
    } else {
      onChange(newStart, endDate);
    }
  };

  const onDatePickerEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    var newEnd = valueAsDate(event.target.value);

    if (!startDate || (newEnd && newEnd < startDate)) {
      newEnd = startDate;
    }

    onChange(startDate, newEnd);
  };

  var datePickerComponent: JSX.Element;
  if (selectRange) {
    datePickerComponent = (
      <>
        <input
          type="date"
          value={startDate ? dateFormat(startDate, "YYYY-MM-DD") : undefined}
          min={dateFormat(new Date(), "YYYY-MM-DD")}
          onChange={onDatePickerStartChange}
        />
        <input
          type="date"
          value={endDate ? dateFormat(endDate, "YYYY-MM-DD") : undefined}
          min={
            startDate
              ? dateFormat(startDate, "YYYY-MM-DD")
              : dateFormat(new Date(), "YYYY-MM-DD")
          }
          onChange={onDatePickerEndChange}
          disabled={!startDate}
        />
      </>
    );
  } else {
    datePickerComponent = (
      <input
        type="date"
        value={startDate ? dateFormat(startDate, "YYYY-MM-DD") : undefined}
        min={dateFormat(new Date(), "YYYY-MM-DD")}
        onChange={onDatePickerSingleChange}
      ></input>
    );
  }

  const selectRangeChange = (value: boolean) => {
    setSelectRange(value);

    if (!value) {
      onChange(startDate, startDate);
    }
  };

  return (
    <>
      <label>{selectRange ? "Date range" : "Date"}</label> {datePickerComponent}{" "}
      <div>
        <input
          type="checkbox"
          checked={selectRange}
          onChange={(e) => selectRangeChange(e.target.checked)}
        />{" "}
        Select multiple dates
      </div>
    </>
  );
}

function EventListDisplay({
  events,
  error,
  isLoading,
}: {
  events: Array<EventJson>;
  error: boolean;
  isLoading: boolean;
}) {
  function formatDate(date: Date) {
    // TODO more flexible formatting
    return dateFormat(date, "dddd, MMM D YYYY");
  }

  function getEventsByDate(events: Array<EventJson>) {
    const sections: { [key: string]: EventsAndDate } = {};
    const sectionsSorted: Array<EventsAndDate> = [];

    events.forEach((element) => {
      if (!sections[element.date]) {
        sections[element.date] = new EventsAndDate(
          dateParse(element.date, "YYYY-MM-DD"),
        );
        sectionsSorted.push(sections[element.date]);
      }
      sections[element.date].events.push(element);
    });

    return sectionsSorted;
  }

  if (error) {
    return <div className="eventListDisplay">Failed to load events!</div>;
  }

  if (isLoading) {
    return <div className="eventListDisplay">Loading...</div>;
  }

  if (events.length == 0) {
    return (
      <div className="eventListDisplay">
        No events to display. If the selected date is in the past we might've
        not imported events for it.
      </div>
    );
  }

  const eventsByDate = getEventsByDate(events);

  const eventRows = eventsByDate.map((eventsAndDate) => {
    const eventSection = eventsAndDate.events.map((event) => {
      return <Event eventJson={event} />;
    });

    return (
      <>
        <h1>{formatDate(eventsAndDate.date)}</h1>
        <div className="dateEventList">{eventSection}</div>
      </>
    );
  });

  return <div className="eventListDisplay">{eventRows}</div>;
}

function Event({ eventJson }: { eventJson: EventJson }) {
  function locationClassName(location: string): string {
    if (ALL_LOCATION_VALUES.indexOf(location) != -1) {
      return "location-" + location.toLowerCase().replaceAll(" ", "-");
    }

    return "location-unknown";
  }

  function displayTime(time: TimeJson): string {
    function displayTimePart(timePart: number): string {
      return timePart.toString().padStart(2, "0");
    }

    function maybeDisplaySeconds(second: number) {
      if (second == 0) {
        return "";
      }

      return ":" + displayTimePart(second);
    }

    function amPm(hour: number) {
      return hour % 24 >= 12 ? "PM" : "AM";
    }

    function formatHours(hours: number) {
      return hours % 12 == 0 ? 12 : hours % 12;
    }

    return `${formatHours(time.hour)}:${displayTimePart(time.minute)}${maybeDisplaySeconds(time.second)} ${amPm(time.hour)}`;
  }

  function maybeLinkLi(link: string | null) {
    if (!link) {
      return <></>;
    }

    return (
      <li>
        <a href={link} className="eventLink" target="_blank">
          Website&gt;&gt;
        </a>
      </li>
    );
  }

  function maybeTimeLi(time: TimeJson | null, label: string) {
    if (!time) {
      return <></>;
    }

    return (
      <li>
        <label>{label}</label>
        <span className="time">{displayTime(time)}</span>
      </li>
    );
  }

  return (
    <div className="eventDisplay">
      <h2>{eventJson.name}</h2>
      <ul className="eventInfo">
        <li>
          <label>Location</label>
          <span className={"location " + locationClassName(eventJson.location)}>
            {eventJson.location}
          </span>
        </li>
        <li>
          <label>Type</label>
          <span className="type">{eventJson.type}</span>
        </li>
        {maybeTimeLi(eventJson.start, "Start time")}
        {maybeTimeLi(eventJson.end, "End time")}
        <li>
          <label>Cost</label>
          <span className="type">{eventJson.cost}</span>
        </li>
      </ul>
      <p className="EventDescription">{eventJson.description}</p>
      <ul className="eventInfo">
        <li>
          <label>Address</label>
          <span className="address">{eventJson.address}</span>
        </li>
        {maybeLinkLi(eventJson.link)}
      </ul>
    </div>
  );
}

export default App;
