// Methods related to reminders

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reminders } from "./reminders";
import { Contacts } from "../../api/contacts/contacts";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import isSameOrAfter from "dayjs/plugin/isSameOrAfter";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(isSameOrAfter);

const accountSid = Meteor.settings.private.twilioAccountSID;
const authToken = Meteor.settings.private.twilioAuthToken;
const client = require("twilio")(accountSid, authToken);

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
  "reminders.sendIfReady"() {
    const reminders = Reminders.find({}, { $filter: { sent: false } });
    if (reminders.count() > 0) {
      reminders.forEach((reminder) => {
        if (dayjs().isSameOrAfter(dayjs(reminder.timeToSend))) {
          reminder.selectedContacts.forEach((contact) => {
            // console.log({ contact });
            // console.log({ reminder });
            //First find out if our contact is fake
            const user = Contacts.findOne(contact);
            if (!user.fake) {
              // client.messages
              //   .create({
              //     body: reminder.message,
              //     from: "+19842177570", //Twilio demo from number
              //     to: `+1${user.unmaskedPhone}`,
              //     statusCallback: "https://enxhen0at91aj.x.pipedream.net",
              //   })
              //   .then((message) => Meteor.call("sms.insert", message));
            }
          });
        }
      });
    }
  },
});
