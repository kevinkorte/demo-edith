import { Meteor } from "meteor/meteor";

Meteor.publish("users.all", function () {
  return Meteor.users.find();
});

Meteor.publish("users.roles", function () {
  return Meteor.roleAssignment.find();
});
