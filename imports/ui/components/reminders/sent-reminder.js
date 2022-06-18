import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Sms } from "../../../api/sms/sms";
import { Contacts } from "../../../api/contacts/contacts";
import "./sent-reminder.html";

Template.Component_reminder_sent.onCreated(function () {
  this.autorun(() => {
    this.subscribe("sms.all");
  });
});

Template.Component_reminder_sent.helpers({
  reminders() {
    return Sms.find({ "message.status": "queued" });
  },
  lookupRecipient(to) {
    const phone = to.slice(2);
    const contact = Contacts.findOne({ unmaskedPhone: phone });
    if (contact) {
      return contact.name;
    }
    return;
  },
  findStatus(sid) {
    const updates = Sms.find(
      { "message.SmsSid": sid },
      { sort: { createdAt: -1 } }
    );
    //probably need to map these to an array, than grab first result since sorted
  },
});
