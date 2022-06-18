import { Meteor } from "meteor/meteor";
import { Sms } from "./sms";

Meteor.methods({
  "sms.insert"(message) {
    Sms.insert({ message, createdAt: new Date() });
  },
});
