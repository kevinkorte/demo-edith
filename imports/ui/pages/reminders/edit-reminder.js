import { Template } from "meteor/templating";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";
import "./edit-reminder.html";
import { Reminders } from "../../../api/reminders/reminders";
import { Contacts } from "../../../api/contacts/contacts";
import TomSelect from "tom-select";
import "tom-select/dist/css/tom-select.bootstrap5.min.css";

Template.Reminder_edit.onCreated(function () {
  const reminderId = FlowRouter.getParam("id");
  this.autorun(() => {
    this.subscribe("reminders.single", reminderId);
  });
});

Template.Reminder_edit.onRendered(function () {
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
});

Template.Reminder_edit.helpers({
  reminder() {
    return Reminders.findOne();
  },
  radioChecked(location, value) {
    if (location == value) {
      return "checked";
    }
    return;
  },
});

Template.Reminder_edit.events({
  "submit #update-reminder"(event) {
    event.preventDefault();
  },
});
