// Methods related to links

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Contacts } from "./contacts";

Meteor.methods({
  "contacts.insert"(name, unmaskedPhone, formattedPhone) {
    check(name, String);
    check(unmaskedPhone, String);
    check(formattedPhone, String);
    return Contacts.insert({
      unmaskedPhone,
      formattedPhone,
      name,
      whoAdded: Meteor.userId(),
      createdAt: new Date(),
    });
  },
  "contacts.remove"(id) {
    check(id, String);
    Contacts.remove(id);
  },
});
