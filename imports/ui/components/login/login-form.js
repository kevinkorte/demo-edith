import { Template } from "meteor/templating";
import { Meteor } from "meteor/meteor";
import { Session } from "meteor/session";
import { FlowRouter } from "meteor/ostrio:flow-router-extra";

import "./login-form.html";

Template.Login_form_component.events({
  "submit #login"(event) {
    event.preventDefault();
    Session.set("hasError", null);
    Session.set("errorMessage", null);
    const code = event.target.password.value;
    Meteor.loginWithPassword(
      Meteor.settings.public.demoEmail,
      code,
      (error) => {
        if (error) {
          console.error(error);
          Session.set("hasError", true);
          Session.set("errorMessage", error.reason);
        } else {
          FlowRouter.go("App.reminders");
        }
      }
    );
  },
});

Template.Login_form_component.helpers({
  hasError() {
    if (Session.get("hasError")) {
      return true;
    }
  },
  readError() {
    if (Session.get("errorMessage") == "Incorrect password") {
      return "Incorrect access code";
    } else {
      return Session.get("errorMessage");
    }
  },
});
