// Fill the DB with example data on startup

import { faker } from "@faker-js/faker";
import { Contacts } from "../../api/contacts/contacts";

import { Meteor } from "meteor/meteor";
// import { Links } from "../../api/links/links.js";
import { Accounts } from "meteor/accounts-base";
import { Roles } from "meteor/alanning:roles";

Meteor.startup(() => {
  //Set up the roles
  Roles.createRole("canDelete", { unlessExists: true });
  Roles.createRole("canView", { unlessExists: true });
  Roles.createRole("admin", { unlessExists: true });
  Roles.createRole("user", { unlessExists: true });
  Roles.addRolesToParent("canDelete", "admin");
  Roles.addRolesToParent("canView", "admin");
  //Make sure at least one account always exists
  const user = Accounts.findUserByEmail(Meteor.settings.public.demoEmail);
  if (user === undefined) {
    Meteor.call(
      "users.create",
      "Edith",
      "Demo",
      Meteor.settings.public.demoEmail,
      "admin"
    );
  }
  const contacts = Contacts.find().fetch();
  console.log(contacts.length);
  if (contacts.length < 50) {
    console.log(50 - contacts.length);
    for (let contact = 0; contact <= 50 - contacts.length; contact++) {
      const name = faker.name.findName();
      const formattedPhone = faker.phone.phoneNumber("(###) ###-####");
      Meteor.call("contacts.insert", name, "0000000000", formattedPhone, true);
    }
  }
});

//Publish all Roles
Meteor.publish(null, function () {
  if (this.userId) {
    return Meteor.roleAssignment.find({ "user._id": this.userId });
  } else {
    this.ready();
  }
});
