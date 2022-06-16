import { Meteor } from "meteor/meteor";
import { Sms } from "./sms";

Meteor.methods({
  "sms.insert"(message) {
    console.log({ message });
  },
});
