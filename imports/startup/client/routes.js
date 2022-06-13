import { FlowRouter } from "meteor/ostrio:flow-router-extra";

// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/not-found/not-found.js";

const authRoute = FlowRouter.group({
  triggersEnter: [
    () => {
      if (!Meteor.userId()) {
        console.log("HERE");
        Meteor.loginWithPassword(
          {
            email: Meteor.settings.public.demoEmail,
          },
          "demo",
          (error) => {
            if (error) {
              //TODO: Handle error
              console.error(error);
            } else {
              FlowRouter.go("App.reminders");
            }
          }
        );
      }
    },
  ],
});

// Set up all routes in the app
authRoute.route("/", {
  name: "App.home",
  action() {
    this.render("App_body", "App_home");
  },
});

authRoute.route("/login", {
  name: "App.login",
  waitOn() {
    return [import("../../ui/pages/login/login-page")];
  },
  action() {
    this.render("App_body", "Login_page");
  },
});

authRoute.route("/settings/:view", {
  name: "App.settings",
  waitOn() {
    return [import("../../ui/pages/settings/settings-page")];
  },
  action(params) {
    if (params.view == "account") {
      this.render("App_body", "Settings_page", { view: "Account_component" });
    }
    if (params.view === "team") {
      this.render("App_body", "Settings_page", { view: "Team_component" });
    }
  },
});

authRoute.route("/reminders", {
  name: "App.reminders",
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/reminders/reminders"),
    ];
  },
  action() {
    this.render("App_body", "Page_reminders");
  },
});

authRoute.route("/reminders/edit/:id", {
  name: "Reminders.edit",
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/reminders/edit-reminder"),
    ];
  },
  action() {
    this.render("App_body", "Reminder_edit");
  },
});

FlowRouter.notFound = {
  action() {
    this.render("App_body", "App_notFound");
  },
};
