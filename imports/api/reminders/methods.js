// Methods related to reminders

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Reminders } from "./reminders";
import { Contacts } from "../../api/contacts/contacts";
import { Sms } from "../../api/sms/sms";
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
  "reminders.markAsSent"(id, sid) {
    Reminders.update(id, { $set: { sent: true, sid } });
  },
  "reminders.sendIfReady"() {
    const reminders = Reminders.find({}, { $filter: { sent: false } });
    if (reminders.count() > 0) {
      reminders.forEach((reminder) => {
        if (
          dayjs().isSameOrAfter(dayjs(reminder.timeToSend)) &&
          reminder.sent == false
        ) {
          reminder.selectedContacts.forEach((contact) => {
            //First find out if our contact is fake
            const user = Contacts.findOne(contact);

            if (!user.fake) {
              client.messages.create(
                {
                  body: reminder.message,
                  from: "+15095812722", //Twilio demo from number
                  to: `+1${user.unmaskedPhone}`,
                  statusCallback: `${Meteor.settings.private.twilioCallback}/twilio-webhook`,
                },
                Meteor.bindEnvironment((error, message) => {
                  if (error) {
                    console.log(error);
                  } else {
                    const payload = {
                      body: message.body,
                      from: message.from,
                      to: message.to,
                      accountSid: message.accountSid,
                      sid: message.sid,
                      status: message.status,
                      dateCreated: message.dateCreated,
                      dateUpdated: message.dateUpdated,
                    };
                    Meteor.call("sms.insert", payload);
                    Meteor.call(
                      "reminders.markAsSent",
                      reminder._id,
                      message.sid
                    );
                  }
                })
              );
            }
          });
        }
      });
    }
  },
});
