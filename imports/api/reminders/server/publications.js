// All reminders-related publications

import { Meteor } from "meteor/meteor";
import { Reminders } from "../reminders";

Meteor.publish("reminders.all", function () {
  return Reminders.find();
});

Meteor.publish("reminders.single", function (id) {
  return Reminders.find(id);
});
