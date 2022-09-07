//this function syncs events from each of your class calendars into your main availability calendar
function SyncClassCalendar() {
  console.log("Syncing classes...");
  
  try {
    deleteEvents(MAIN_CALENDAR_ID, startTime, endTime, CLASSES_CHAR);
    createEvents(CLASS_CALENDAR_IDS, MAIN_CALENDAR_ID, startTime, endTime, CLASSES_CHAR);
  }
  catch(err) {
    console.log("Cool down, trying again....");
    Utilities.sleep(2000);

    deleteEvents(MAIN_CALENDAR_ID, startTime, endTime, CLASSES_CHAR);
    createEvents(CLASS_CALENDAR_IDS, MAIN_CALENDAR_ID, startTime, endTime, CLASSES_CHAR);
  }
}

//this function syncs events from the rest of your calendars into your main availability calendar
function SyncAvailabilityCalendar() {
  console.log("Syncing availability...")
  
  try {
    deleteEvents(MAIN_CALENDAR_ID, startTime, endTime, STAR_CHAR);
    createEvents(AVAILABILITY_TO_MERGE, MAIN_CALENDAR_ID, startTime, endTime, STAR_CHAR);
  }
  catch(err) {
    console.log("Cool down, trying again....");
    Utilities.sleep(2000);

    deleteEvents(MAIN_CALENDAR_ID, startTime, endTime, STAR_CHAR);
    createEvents(AVAILABILITY_TO_MERGE, MAIN_CALENDAR_ID, startTime, endTime, STAR_CHAR);
  }

  SyncEventsCalendars();
}

//this function syncs unique events from your main availability calendar (aka events that weren't copied in the other two functions) into another calendar, allowing you to hide the availability calendar while still seeing invitations and events sent to it
function SyncEventsCalendars() {
  console.log("Syncing events...")

  try {
    deleteEvents(EVENTS_CALENDAR_ID, startTime, endTime);
    createEvents(MAIN_CALENDAR_ID, EVENTS_CALENDAR_ID, startTime, endTime, STAR_CHAR);
  }
  catch(err) {
    console.log("Cool down, trying again....");
    Utilities.sleep(2000);

    deleteEvents(EVENTS_CALENDAR_ID, startTime, endTime);
    createEvents(MAIN_CALENDAR_ID, EVENTS_CALENDAR_ID, startTime, endTime, STAR_CHAR);
  }
}
