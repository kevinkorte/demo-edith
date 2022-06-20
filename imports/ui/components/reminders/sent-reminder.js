import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { Sms } from "../../../api/sms/sms";
import { Contacts } from "../../../api/contacts/contacts";
import IMask from "imask";
import dayjs from "dayjs";
import "./sent-reminder.html";
import "./envelope-open.html";
import "./sent-icon.html";
import "./envelope-delivered.html";

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
    const result = updates.map((update) => {
      return update;
    });
    return result[0].message.SmsStatus;
  },
  colorBadge(sid) {
    const updates = Sms.find(
      { "message.SmsSid": sid },
      { sort: { createdAt: -1 } }
    );
    const result = updates.map((update) => {
      return update;
    });
    if (result[0].message.SmsStatus == "delivered") {
      return "green";
    } else {
      return "slate";
    }
  },
  formattedNumber(number) {
    //+19842177570
    const masked = IMask.createMask({
      mask: "+0 (000) 000-0000",
    });
    return masked.resolve(number);
  },
  getLastDate(sid) {
    //check for updates first
    const updates = Sms.find(
      { "message.SmsSid": sid },
      { sort: { createdAt: -1 } }
    );
    const result = updates.map((update) => {
      return update;
    });
    if (result.length > 0) {
      return dayjs(result[0].createdAt).format("M-D-YY h:mm a");
    }
  },
  formatDate(date) {
    return dayjs(date).format("M/D/YY h:mm:ss a");
  },
  twilioReply(sid) {
    return (updates = Sms.find(
      { "message.SmsSid": sid },
      { sort: { createdAt: 1 } }
    ));
  },
  status(status) {},
});
