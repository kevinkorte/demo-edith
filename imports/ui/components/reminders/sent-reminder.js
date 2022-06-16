import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Sms } from "../../../api/sms/sms";
import "./sent-reminder.html";

Template.Component_reminder_sent.onCreated(function () {
  this.autorun(() => {
    this.subscribe("sms.all");
  });
});

Template.Component_reminder_sent.helpers({
  reminders() {
    return Sms.find().fetch();
  },
});
