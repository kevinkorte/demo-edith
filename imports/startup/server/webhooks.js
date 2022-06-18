const bodyParser = require("body-parser");
const {
  MessageInteractionContext,
} = require("twilio/lib/rest/proxy/v1/service/session/participant/messageInteraction");

WebApp.connectHandlers
  .use(bodyParser.urlencoded({ extended: true }))
  .use("/twilio-webhook", (req, res, next) => {
    Meteor.call("sms.insert", req.body);
  });
