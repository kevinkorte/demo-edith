import { Template } from "meteor/templating";
import { Accounts } from "meteor/accounts-base";
import "./login-form.html";

Template.Login_form_component.events({
  "submit #login"(event) {
    event.preventDefault();
    const email = event.target.email.value;
    Accounts.requestLoginTokenForUser(
      {
        selector: email,
        options: {
          userCreationDisabled: true,
        },
      },
      (error) => {
        if (error) {
          console.error(error);
        } else {
          console.log("Success");
        }
      }
    );
  },
});
