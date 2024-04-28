import React from 'react';
import logo from './logo.svg';
import './App.css';
import { useEffect, useState } from 'react';
import DatePicker from "react-datepicker";
import { format as dateFormat, parse as dateParse } from 'date-format-parse';


import "react-datepicker/dist/react-datepicker.css";

const SPREADSHEET_URL = "https://docs.google.com/spreadsheets/d/1eX21lRIMOl3LLUhanRptk0jWbKoyZJVnbsJ-UWP7JZY/edit#gid=0"
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
        <h1>Decentered Events Tracker</h1>
        <div className="linkAndExplanation">Events lovingly imported from the <a className="spreadsheetLink" href={SPREADSHEET_URL}>Decentered Eventracker Spreadsheet</a></div>
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

  function formatDateForUrl(date: Date) {
    return dateFormat(date, "YYYY-MM-DD");
  }

  useEffect(
    () => {
      console.log("Effect called " + events.length)
      var url : string = "/v1/events";
      
      if (startDate && endDate) {
        url = url + `?start_date=${formatDateForUrl(startDate)}&end_date=${formatDateForUrl(endDate)}`
      }
      
      fetch(url)
        .then((response) => response.json())
        .then((responseJson) => {
          setEvents(responseJson.events)
        })
        .catch((e) => {
          console.log(e);
          setError(true)
        })
    },
    [startDate, endDate]
  )

  const onDatePickerChange = (dates: [Date | null, Date | null]) => {
    const [start, end] = dates;
    setStartDate(start);
    setEndDate(end);
  };

  return  <div className="eventList">
  <div className="filters">
  <label>Dates</label>
    <DatePicker
      selected={startDate}
      onChange={onDatePickerChange}
      startDate={startDate}
      endDate={endDate}
      selectsRange
    />
  </div>
  <EventListDisplay events={events} error={error} />
  </div>
}

function EventListDisplay({events, error} : {events: Array<EventJson>, error: boolean}) {
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

  if (events.length == 0) {
    return <div className="eventListDisplay">Loading...</div>
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
      return (hour % 24) > 12 ? "PM" : "AM";
    }

    return `${time.hour % 12}:${displayTimePart(time.minute)}${maybeDisplaySeconds(time.second)} ${amPm(time.hour)}`
  }

  function maybeLinkLi(link: string | null) {
    if (!link) {
      return <></>
    }

    return <li><a href={link} className="eventLink">Website&gt;&gt;</a></li>
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
      {maybeTimeLi(eventJson.start, "End time")}
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
