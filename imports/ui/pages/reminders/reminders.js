import { Meteor } from "meteor/meteor";
import { Template } from "meteor/templating";
import { ReactiveVar } from "meteor/reactive-var";
import { Session } from "meteor/session";
import { Reminders } from "../../../api/reminders/reminders";
import "./reminders.html";
import "../../components/reminders/upcoming-reminder";
import TomSelect from "tom-select";
import IMask from "imask";
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
import bootstrap from "bootstrap";

import "timepicker";
import "timepicker/jquery.timepicker.min.css";
import "tom-select/dist/css/tom-select.bootstrap5.min.css";
import { Contacts } from "../../../api/contacts/contacts";

Template.Page_reminders.onCreated(function () {
  this.timezone = new ReactiveVar("America/Los_Angeles");
  this.autorun(() => {
    this.subscribe("reminders.all");
  });
});

Template.Page_reminders.onRendered(function () {
  $("#app-time").timepicker({
    scrollDefault: "06:00",
    step: 30,
  });
  $("#reminder-time").timepicker({
    scrollDefault: "06:00",
    step: 30,
  });
  this.autorun(() => {
    const contactSub = this.subscribe("contacts.all");
    if (contactSub.ready()) {
      let select = document.getElementById("contact-select");
      let control = select.tomselect;
      if (control == undefined) {
        const tomSelect = new TomSelect("#contact-select", {
          plugins: ["remove_button"],
          sortField: {
            field: "name",
            direction: "asc",
          },
          valueField: "_id",
          labelField: "name",
          searchField: ["name", "formattedPhone"],
          onItemAdd: function () {
            this.setTextboxValue("");
            this.refreshOptions();
          },
          render: {
            option: function (data, escape) {
              return (
                "<div>" +
                '<span class="text-slate-600 text-capitalize me-2">' +
                escape(data.name) +
                "</span>" +
                '<span class="text-slate-400 small">' +
                escape(data.formattedPhone) +
                "</span>" +
                "</div>"
              );
            },
            item: function (data, escape) {
              return (
                '<div title="' +
                escape(data._id) +
                '" class="bg-slate-200">' +
                '<span class="text-capitalize">' +
                escape(data.name) +
                "</span>" +
                "</div>"
              );
            },
          },
        });
        const contacts = Contacts.find().fetch();
        contacts.forEach((contact) => {
          tomSelect.addOption({
            _id: contact._id,
            name: contact.name,
            formattedPhone: contact.formattedPhone,
          });
        });
      }
    }
  });

  const phone = document.getElementById("phoneInput");
  const maskOptions = {
    mask: "(000) 000-0000",
  };
  IMask(phone, maskOptions);
});

Template.Page_reminders.helpers({
  contacts() {
    return Contacts.find({}, { sort: { name: 1 } }).fetch();
  },
  locationError() {
    if (Session.get("locationError")) {
      return true;
    } else {
      return false;
    }
  },
  ifErrorLocation() {
    if (Session.get("locationError")) {
      return "error-box is-invalid";
    }
  },

  retrievePhone(location) {
    if (location === "wa") {
      return "(509) 555-1234";
    } else {
      return "(208) 555-4321";
    }
  },
  countUpcomingReminders() {
    return Reminders.find({ sent: false }).count();
  },
});

Template.Page_reminders.events({
  "click .btn-check"(event) {
    const radioWrapper = document.getElementById("location-radio-wrapper");
    if (event.target.dataset.state == "wa") {
      // document.getElementById("sendsFrom").innerHTML =
      //   "Sends from (509) 555-1234";

      radioWrapper.classList.remove("is-invalid", "error-box");
      radioWrapper.classList.add("is-valid", "valid-box");
    } else if (event.target.dataset.state == "id") {
      // document.getElementById("sendsFrom").innerHTML =
      //   "Sends from (208) 555-4321";
      radioWrapper.classList.remove("is-invalid", "error-box");
      radioWrapper.classList.add("is-valid", "valid-box");
    } else {
      // document.getElementById("sendsFrom").innerHTML =
      //   "Please select a location";
    }
  },
  "submit #add-new-contact"(event) {
    event.preventDefault();
    const name = event.target.name.value;
    const phone = event.target.phone.value;
    //We could vastly improve this by not relying
    //on two versions of the same mask
    //but for now, this mask won't really change
    //so onward we move.
    //TODO: Clean this up, have only one instance of the mask
    const masked = IMask.createMask({
      mask: "(000) 000-0000",
    });
    masked.resolve(phone);
    let select = document.getElementById("contact-select");
    let control = select.tomselect;
    let form = document.getElementById("add-new-contact");
    Meteor.call(
      "contacts.insert",
      name.toLowerCase(),
      masked.unmaskedValue,
      phone,
      false,
      (error, result) => {
        if (error) {
          //TODO: Handle error
          console.error(error);
        } else {
          //Clear form
          control.addOption({
            _id: result,
            name: name.toLowerCase(),
            formattedPhone: phone,
          });
          form.reset();
        }
      }
    );
  },
  "click #remove-contact"() {
    Swal.fire({
      titleText: "Are you sure?",
      html: `You are about to delete <span class="text-capitalize">${this.name}</span>`,
      icon: "warning",
      iconColor: "#ef4444",
      color: "#ef4444",
      showCancelButton: true,
      confirmButtonText: "Delete contact",
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
        Meteor.call("contacts.remove", this._id, (error) => {
          if (error) {
            //TODO: Handle error
            console.error(error);
          } else {
            let select = document.getElementById("contact-select");
            let control = select.tomselect;
            control.removeOption(this._id);
            info_success_toast(
              "Contact deleted",
              "Contact has been permanently deleted."
            );
          }
        });
      }
    });
  },
  "click #edit-contact"() {},
  "submit #reminder-template-form"(event, template) {
    event.preventDefault();
    const location = event.target.location.value;
    const description = event.target.description.value.toLowerCase();
    const appointment_date = event.target.appointment_date.value;
    const appointment_time = $("#app-time").timepicker("getTime");
    const appointment_timestamp = dayjs(appointment_date)
      .hour(appointment_time.getHours())
      .minute(appointment_time.getMinutes())
      .second(0);
    const formattedTime = appointment_timestamp.format("dddd M/D [at] h:mma");
    document.getElementById(
      "message"
    ).value = `*E.D.I.T.H Automated Reminder* Appointment Reminder at ${location} on ${formattedTime} for ${description}. This message is automated.`;
    const modalElement = document.getElementById("defaultMessageModal");
    const modal = bootstrap.Modal.getInstance(modalElement);
    modal.hide();
    modalElement.addEventListener("hidden.bs.modal", () => {
      document.getElementById("reminder-template-form").reset();
    });
    const reminder_date_input = document.getElementById("reminder-date");
    const reminder_time_input = document.getElementById("reminder-time");
    //by default, reminders are 60 minutes before appointments
    const reminder_timestamp = appointment_timestamp.subtract(60, "minute");
    reminder_date_input.value = reminder_timestamp.format("YYYY-MM-DD");
    $("#reminder-time").timepicker(
      "setTime",
      reminder_timestamp.format("HH:mm")
    );
  },
  "submit #create-reminder"(event) {
    event.preventDefault();
    const form = document.getElementById("create-reminder");
    form.classList.add("was-validated");
    const message = event.target.message.value;
    //make sure we have a location set
    const location = event.target.fromNumber.value;
    if (location == "") {
      Session.set("locationError", "Please select a location");
    }
    //check to make sure we have at least one person to send this to
    const selectedContacts = [...event.target.contacts.options]
      .filter((x) => x.selected)
      .map((x) => x.value);
    const reminderDate = event.target.reminder_date.value;
    const reminderTime = event.target.reminder_time.value;
    const reminder = dayjs(
      reminderDate + reminderTime,
      "YYYY-MM-DDh:mma"
    ).second(0);
    if (location == "wa") {
      localReminderTime = reminder
        .tz("America/Los_Angeles", true)
        .toISOString();
    } else if (location === "id") {
      localReminderTime = reminder.tz("America/Boise", true).toISOString();
    }
    Meteor.call(
      "reminders.create",
      location,
      selectedContacts,
      message,
      localReminderTime,
      (error, result) => {
        if (error) {
          //TODO: handle error
          console.error(error);
        } else {
          form.classList.remove("was-validated");
          let select = document.getElementById("contact-select");
          let control = select.tomselect;
          control.clear();
          form.reset();
        }
      }
    );
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
