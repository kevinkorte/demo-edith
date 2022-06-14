import { Meteor } from "meteor/meteor";
SyncedCron.add({
  name: "Crunch some important numbers for the marketing department",
  schedule: function (parser) {
    // parser is a later.parse object
    return parser.text("every 1 minute");
  },
  job: function () {
    Meteor.call("reminders.sendIfReady");
  },
});
SyncedCron.start();
