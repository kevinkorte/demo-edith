// Methods related to reminders

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reminders } from "./reminders";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
dayjs.extend(utc);
dayjs.extend(timezone);

Meteor.methods({
  "reminders.create"(location, selectedContacts, message, timestamp) {
    console.log({ selectedContacts });
    return Reminders.insert({
      location,
      selectedContacts,
      message,
      timeToSend: timestamp,
      sent: false,
    });
  },
  "reminders.remove"(_id) {
    check(_id, String);
    return Reminders.remove(_id);
  },
  "reminders.sendIfReady"() {},
});
