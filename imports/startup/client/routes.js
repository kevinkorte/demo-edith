import { FlowRouter } from "meteor/ostrio:flow-router-extra";

// Import needed templates
import "../../ui/layouts/body/body.js";
import "../../ui/pages/home/home.js";
import "../../ui/pages/not-found/not-found.js";

const authRoute = FlowRouter.group({
  triggersEnter: [
    () => {
      if (!Meteor.userId()) {
        FlowRouter.go("App.login");
      }
    },
  ],
});

// Set up all routes in the app
authRoute.route("/", {
  name: "App.home",
  action() {
    // this.render("App_body", "App_home");
    FlowRouter.go("App.reminders");
  },
});

FlowRouter.route("/login", {
  name: "App.login",
  triggersEnter: [
    () => {
      document.body.classList.add("bg-slate-50");
    },
  ],
  triggersExit: [
    () => {
      document.body.classList.remove("bg-slate-50");
    },
  ],
  waitOn() {
    return [import("../../ui/pages/login/login-page")];
  },
  action() {
    this.render("Login_page");
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
      import("../../ui/components/reminders/upcoming-reminder"),
    ];
  },
  action() {
    this.render("App_body", "Page_reminders", {
      reminder: "Component_reminder_upcoming",
    });
  },
});

authRoute.route("/reminders/sent", {
  name: "App.reminders.sent",
  waitOn() {
    return [
      import("../../ui/layouts/body/body"),
      import("../../ui/pages/reminders/reminders"),
      import("../../ui/components/reminders/sent-reminder"),
    ];
  },
  action() {
    this.render("App_body", "Page_reminders", {
      reminder: "Component_reminder_sent",
    });
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
//Silence deprecated console log error
//Use wildcard '*' route instead
// FlowRouter.notFound = {
//   action() {
//     this.render("App_body", "App_notFound");
//   },
// };
