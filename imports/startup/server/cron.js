import { Meteor } from "meteor/meteor";
SyncedCron.add({
  name: "Check if any reminders should be sent",
  schedule: function (parser) {
    // parser is a later.parse object
    return parser.text("every 1 minute");
  },
  job: function () {
    Meteor.call("reminders.sendIfReady");
  },
});
SyncedCron.start();
