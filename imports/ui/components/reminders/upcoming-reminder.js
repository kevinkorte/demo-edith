import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import "./upcoming-reminder.html";
import { Reminders } from "../../../api/reminders/reminders";
import { Contacts } from "../../../api/contacts/contacts";
import Swal from "sweetalert2";
import dayjs from "dayjs";
import utc from "dayjs/plugin/utc";
import timezone from "dayjs/plugin/timezone";
import customParseFormat from "dayjs/plugin/customParseFormat";
import relativeTime from "dayjs/plugin/relativeTime";
dayjs.extend(utc);
dayjs.extend(timezone);
dayjs.extend(customParseFormat);
dayjs.extend(relativeTime);

Template.Component_reminder_upcoming.onCreated(function () {
  this.autorun(() => {
    this.subscribe("reminders.all");
  });
  Meteor.setInterval(() => {
    Session.set("currentTime", new Date());
  }, 1000);
});

Template.Component_reminder_upcoming.helpers({
  reminders() {
    return Reminders.find({}, { sort: { timeToSend: 1 } });
  },
  displayTime(timestamp) {
    const currentTime = dayjs(Session.get("currentTime"));
    //This is a bit hacky, but relative time changes at the bottom of the minute, not the top
    //Probably should find a solution using the customize features of the dayjs plugin
    //But for now, this will make the relative time update at the top of the minute
    return dayjs(currentTime.subtract(30, "second")).to(dayjs(timestamp));
  },
  displayTimePST(timestamp) {
    return dayjs(timestamp).tz("America/Los_Angeles").format("h:mm a");
  },
  displayTimeMST(timestamp) {
    return dayjs(timestamp).tz("America/Boise").format("h:mm a");
  },
  getContactName(contactId) {
    console.log("Contact: ", contactId);
    const contact = Contacts.findOne(contactId);
    if (contact) {
      return contact.name;
    }
    return;
  },
  displayDate(timestamp) {
    return dayjs(timestamp).format("MMMM D");
  },
  retrievePhone(location) {
    if (location === "wa") {
      return "(509) 555-1234";
    } else {
      return "(208) 555-4321";
    }
  },
});

Template.Component_reminder_upcoming.events({
  "click #delete-reminder"(event) {
    Swal.fire({
      titleText: "You are about to delete this reminder",
      text: `${this.message}`,
      icon: "warning",
      iconColor: "#ef4444",
      color: "#ef4444",
      showCancelButton: true,
      confirmButtonText: "Delete reminder",
      confirmButtonColor: "#ef4444",
      focusConfirm: false,
      cancelButtonColor: "#ffffff",
      buttonsStyling: false,
      reverseButtons: true,
      customClass: {
        confirmButton: "btn btn-red-600 ms-2",
        cancelButton: "btn btn-slate-100",
      },
    }).then((result) => {
      if (result.isConfirmed === true) {
        Meteor.call("reminders.remove", this._id, (error) => {
          if (error) {
            //TODO: Handle error
            console.error(error);
          } else {
            info_success_toast(
              "Reminder deleted",
              "Reminder has been permanently deleted."
            );
          }
        });
      }
    });
  },
});

const info_success_toast = (titleText, text) => {
  Swal.fire({
    titleText: titleText,
    text: text,
    icon: "success",
    toast: true,
    position: "bottom",
    timer: 4000,
    showConfirmButton: false,
    background: "#1d4ed8",
    iconColor: "#bfdbfe",
    color: "#dbeafe",
    customClass: "toast-info",
  });
};
