const bodyParser = require("body-parser");

WebApp.connectHandlers
  .use(bodyParser.urlencoded({}))
  .use("/twilio-webhook", (req, res, next) => {
    console.log({ req });
    console.log({ res });
    console.log("Request body: ", req.body);
  });
