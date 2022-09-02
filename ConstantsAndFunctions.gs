// CONSTANTS ----------------------------------------------------------------------------

  const ENDPOINT_BASE = 'https://www.googleapis.com/calendar/v3/calendars';
  
  // Unique and star character to use in the title of the event to identify it as a clone
  // Classes character to use in the title of the event to identify it as a copy of a class event
  // This is used to delete the old events.
  const SEARCH_CHARACTER = '\u200A';
  const STAR_CHAR = '\u2730 ';
  const CLASSES_CHAR = '\u272F';

  // Number of days in the past and future to sync.
  const SYNC_DAYS_IN_PAST = 20;
  const SYNC_DAYS_IN_FUTURE = 90;

  const startTime = new Date();
  startTime.setHours(0, 0, 0, 0);
  startTime.setDate(startTime.getDate() - SYNC_DAYS_IN_PAST);

  const endTime = new Date();
  endTime.setHours(0, 0, 0, 0);
  endTime.setDate(endTime.getDate() + SYNC_DAYS_IN_FUTURE + 1);

// CALENDARS ----------------------------------------------------------------------------
  
  // the calendar IDs of calendars you want to copy events into
    const MAIN_CALENDAR_ID = '';
    const EVENTS_CALENDAR_ID = '';

  // CALENDARS TO MERGE: the calendar IDs of calendars you want to copy events from

    // calendar IDs of class calendars you want to clone events from
    // each of these calendars should be made into a trigger, triggering the sync classes function
    const CLASS_CALENDAR_IDS = {
    '1': '',
    '2': '',
    '3': '',
    '4': '',
    '5': ''};
    
    // any other calendars you want to clone events from
    // each of these calendars should be made into a trigger, triggering the sync availability function
    const AVAILABILITY_TO_MERGE = {
    'personal': '',
    'doctor appointments': '',
    'work': '',
    'clubs': ''};

// FUNCTIONS [DON'T EDIT UNDER HERE] ----------------------------------------------------------------------------

  //function to create events from the calendars to merge into the calendars to merge into
  //title_char (optional) is to add a special character in front of the summary of events created in calendar
  function createEvents(TO_MERGE, MERGE_INTO, startTime, endTime, TITLE_CHAR='') {
    let requestBody = [];

    //if it's a single calendar ID instead of a list, make it a list
    if(typeof TO_MERGE != "object"){
      TO_MERGE = {TO_MERGE,};
    }

    for (let calendarName in TO_MERGE) {
      const calendarId = TO_MERGE[calendarName];

      if (!CalendarApp.getCalendarById(calendarId)) {
        console.log("Calendar not found: '%s'.", calendarId);
        continue;
      }

      // Find events
      const events = Calendar.Events.list(calendarId, {
        timeMin: startTime.toISOString(),
        timeMax: endTime.toISOString(),
        singleEvents: true,
        orderBy: 'startTime',
        });

      // If nothing find, move to next calendar
      if (!(events.items && events.items.length > 0)) {continue;}

      events.items.forEach((event) => {
        // don't copy clones with the star or classes character in the title 
        if (event.summary.includes(STAR_CHAR) || event.summary.includes(CLASSES_CHAR)) {
          return;
        }

        requestBody.push({
          method: 'POST',
          endpoint: `${ENDPOINT_BASE}/${MERGE_INTO}/events`,
          requestBody: {
            summary: `${SEARCH_CHARACTER}${TITLE_CHAR}${event.summary}`,
            location: event.location,
            description: event.description,
            start: event.start,
            end: event.end,
            transparency: event.transparency
          },
        });
      });
    }

    if (requestBody && requestBody.length) {
      const result = new BatchRequest({
        batchPath: 'batch/calendar/v3',
        requests: requestBody,
      });

      if (result.length !== requestBody.length) {
        console.log(result);
      }

      console.log(`${result.length} events created.`);
    } else {
      console.log('No events to create.');
    }
  }

  // Delete any old events that have been already cloned over.
  // This is basically a sync w/o finding and updating. Just deleted and recreate.
  function deleteEvents(MERGE_INTO, startTime, endTime, SEARCH_CHAR=SEARCH_CHARACTER) {
    const sharedCalendar = CalendarApp.getCalendarById(MERGE_INTO);

    // Find events with the search character in the title.
    // The `.filter` method is used since the getEvents method seems to return all events at the moment. It's a safety check.
    const events = sharedCalendar
      .getEvents(startTime, endTime, { search: SEARCH_CHAR })
      .filter((event) => event.getTitle().includes(SEARCH_CHAR));

    const requestBody = events.map((e) => ({
      method: 'DELETE',
      endpoint: `${ENDPOINT_BASE}/${MERGE_INTO}/events/${e
        .getId()
        .replace('@google.com', '')}`,
    }));

    if (requestBody && requestBody.length) {
      const result = new BatchRequest({
        useFetchAll: true,
        batchPath: 'batch/calendar/v3',
        requests: requestBody,
      });

      if (result.length !== requestBody.length) {
        console.log(result);
      }

      console.log(`${result.length} deleted events.`);
    } else {
      console.log('No events to delete.');
    }
  }
