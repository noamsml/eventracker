import React, { ChangeEvent } from 'react';
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import { format as dateFormat, parse as dateParse } from 'date-format-parse';


const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1eX21lRIMOl3LLUhanRptk0jWbKoyZJVnbsJ-UWP7JZY/edit#gid=0"
const SUBMIT_URL = "https://docs.google.com/forms/d/e/1FAIpQLSdFneR4syUmZ580W5Ics6IX_y2I4s5ajwZTpX4cCwltl-hcqw/viewform?usp=send_form"
const DONATE_LINK = "https://givebutter.com/decentered"
const ALL_LOCATION_VALUES = ["San Francisco", "Oakland", "Berkeley", "East Bay", "North Bay", "South Bay", "Out of Town", "Treasure Island", "Various Locations"]

interface TimeJson {
  hour: number;
  minute: number;
  second: number;
}

interface EventJson {
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
  events: Array<EventJson>
  date: Date

  constructor(date: Date) {
    this.date = date;
    this.events = []
  }
}

function App() {
  return (
    <div className="App">
      <header className="App-header">      
        <h1><img src="/logo/decentered.png" /> Decentered Events Tracker</h1>
        <div className="linkAndExplanation">Events lovingly imported from the <a className="spreadsheetLink" href={SPREADSHEET_URL}>Decentered Eventracker Spreadsheet</a></div>
        <div className="linkAndExplanation"> <a className="spreadsheetLink" href={SUBMIT_URL} target="_blank">Submit an event</a> | <a className="spreadsheetLink" href={DONATE_LINK} target="_blank">Consider donating</a> | <a className="spreadsheetLink" href="https://decenteredarts.org" target="_blank">Decentered arts</a></div>
      </header>

      <EventList />
    </div>
  );
}

function EventList() {
  const [startDate, setStartDate] = useState<Date | null>(null);
  const [endDate, setEndDate] = useState<Date | null>(null);

  const [events, setEvents] = useState(Array<EventJson>())
  const [error, setError] = useState(false)

  const [isLoading, setIsLoading] = useState(false);

  function formatDateForUrl(date: Date) {
    return dateFormat(date, "YYYY-MM-DD");
  }

  useEffect(
    () => {
      if (startDate && !endDate) {
        console.log("Skipping effect due to in-progress range");
        return;
      }

      var url: string = "/v1/events";

      if (startDate && endDate) {
        url = url + `?start_date=${formatDateForUrl(startDate)}&end_date=${formatDateForUrl(endDate)}`
      }

      setIsLoading(true);

      fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
          setEvents(responseJson.events)
          setIsLoading(false);
          setError(false);
        })
        .catch((e) => {
          console.log(e);
          setError(true)
          setIsLoading(false);
        })
    },
    [startDate, endDate]
  )


  function onDateFilterChange(start: Date | null, end: Date | null) {
    setStartDate(start);
    setEndDate(end);
  }

  return <div className="eventList">
    <div className="filters">
      <DateFilterPanel startDate={startDate} endDate={endDate} onChange={onDateFilterChange} />
    </div>
    <EventListDisplay events={events} error={error} isLoading={isLoading} />
  </div>
}

function DateFilterPanel({ startDate, endDate, onChange }: { startDate: Date | null, endDate: Date | null, onChange: (start: Date | null, end: Date | null) => void }) {
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
  }

  const onDatePickerEndChange = (event: ChangeEvent<HTMLInputElement>) => {
    var newEnd = valueAsDate(event.target.value);

    if (!startDate || (newEnd && newEnd < startDate))  {
      newEnd = startDate;
    }

    onChange(startDate, newEnd)
  }

  var datePickerComponent: JSX.Element;
  if (selectRange) {
    datePickerComponent = <>
      <input type="date"
        value={startDate ? dateFormat(startDate, "YYYY-MM-DD") : undefined}
        min={dateFormat(new Date(), "YYYY-MM-DD")}
        onChange={onDatePickerStartChange}
      />
      <input type="date"
        value={endDate ? dateFormat(endDate, "YYYY-MM-DD") : undefined}
        min={startDate ? dateFormat(startDate, "YYYY-MM-DD") : dateFormat(new Date(), "YYYY-MM-DD")}
        onChange={onDatePickerEndChange}
        disabled={!startDate}
      />
    </>
  } else {
    datePickerComponent = <input type="date"
      value={startDate ? dateFormat(startDate, "YYYY-MM-DD") : undefined}
      min={dateFormat(new Date(), "YYYY-MM-DD")}
      onChange={onDatePickerSingleChange}
    ></input>
  }

  const selectRangeChange = (value: boolean) => {
    setSelectRange(value)

    if (!value) {
      onChange(startDate, startDate);
    }
  }

  return <><label>{selectRange ? "Date range" : "Date"}</label> {datePickerComponent} <div><input type="checkbox" checked={selectRange} onChange={(e) => selectRangeChange(e.target.checked)} /> Select multiple dates</div></>
}

function EventListDisplay({ events, error, isLoading }: { events: Array<EventJson>, error: boolean, isLoading: boolean }) {
  function formatDate(date: Date) {
    // TODO more flexible formatting
    return dateFormat(date, "dddd, MMM D YYYY");
  }

  function getEventsByDate(events: Array<EventJson>) {
    const sections: { [key: string]: EventsAndDate } = {}
    const sectionsSorted: Array<EventsAndDate> = []

    events.forEach(element => {
      if (!sections[element.date]) {
        sections[element.date] = new EventsAndDate(dateParse(element.date, "YYYY-MM-DD"));
        sectionsSorted.push(sections[element.date]);
      }
      sections[element.date].events.push(element);
    });

    return sectionsSorted;
  }


  if (error) {
    return <div className="eventListDisplay">Failed to load events!</div>
  }

  if (isLoading) {
    return <div className="eventListDisplay">Loading...</div>
  }

  if (events.length == 0) {
    return <div className="eventListDisplay">No events to display. If the selected date is in the past we might've not imported events for it.</div>
  }


  const eventsByDate = getEventsByDate(events);

  const eventRows = eventsByDate.map((eventsAndDate) => {

    const eventSection = eventsAndDate.events.map((event) => {
      return <Event eventJson={event} />
    })

    return <><h1>{formatDate(eventsAndDate.date)}</h1>
      <div className="dateEventList">{eventSection}</div></>
  })

  return <div className="eventListDisplay">{eventRows}</div>
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
      return timePart.toString().padStart(2, "0")
    }

    function maybeDisplaySeconds(second: number) {
      if (second == 0) {
        return "";
      }

      return ":" + displayTimePart(second)
    }

    function amPm(hour: number) {
      return (hour % 24) >= 12 ? "PM" : "AM";
    }

    function formatHours(hours: number) {
      return (hours % 12 == 0) ? 12 : hours % 12;
    }

    return `${formatHours(time.hour)}:${displayTimePart(time.minute)}${maybeDisplaySeconds(time.second)} ${amPm(time.hour)}`
  }

  function maybeLinkLi(link: string | null) {
    if (!link) {
      return <></>
    }

    return <li><a href={link} className="eventLink" target="_blank">Website&gt;&gt;</a></li>
  }

  function maybeTimeLi(time: TimeJson | null, label: string) {
    if (!time) {
      return <></>
    }

    return <li><label>{label}</label><span className="time">{displayTime(time)}</span></li>
  }

  return <div className="eventDisplay">
    <h2>{eventJson.name}</h2>
    <ul className="eventInfo">
      <li><label>Location</label><span className={"location " + locationClassName(eventJson.location)}>{eventJson.location}</span></li>
      <li><label>Type</label><span className="type">{eventJson.type}</span></li>
      {maybeTimeLi(eventJson.start, "Start time")}
      {maybeTimeLi(eventJson.end, "End time")}
      <li><label>Cost</label><span className="type">{eventJson.cost}</span></li>
    </ul>
    <p className="EventDescription">{eventJson.description}</p>
    <ul className="eventInfo">
      <li><label>Address</label><span className="address">{eventJson.address}</span></li>
      {maybeLinkLi(eventJson.link)}
    </ul>
  </div>
}

export default App;
