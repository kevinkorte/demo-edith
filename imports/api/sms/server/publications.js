import { Meteor } from "meteor/meteor";
import { Sms } from "../sms";

Meteor.publish("sms.all", function () {
  return Sms.find();
});
