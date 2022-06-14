// All contacts-related publications

import { Meteor } from "meteor/meteor";
import { Contacts } from "../contacts.js";

Meteor.publish("contacts.all", function () {
  return Contacts.find();
});
