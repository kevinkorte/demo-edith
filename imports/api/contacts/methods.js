// Methods related to links

import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Contacts } from "./contacts";

Meteor.methods({
  "contacts.insert"(name, unmaskedPhone, formattedPhone, fake) {
    check(name, String);
    check(unmaskedPhone, String);
    check(formattedPhone, String);
    check(fake, Boolean);
    return Contacts.insert({
      unmaskedPhone,
      formattedPhone,
      name,
      fake: fake,
      // whoAdded: Meteor.userId(),
      createdAt: new Date(),
    });
  },
  "contacts.remove"(id) {
    check(id, String);
    Contacts.remove(id);
  },
});
