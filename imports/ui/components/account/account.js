import { Template } from "meteor/templating";
import Swal from "sweetalert2";
import "./account.html";

Template.Account_component.helpers({
  readFirstName() {
    if (Meteor.user()) {
      const firstName = Meteor.user().profile.firstName;
      return firstName;
    }
  },
  readLastName() {
    if (Meteor.user()) {
      const lastName = Meteor.user().profile.lastName;
      return lastName;
    }
  },
  getUserEmail() {
    if (Meteor.user()) {
      return Meteor.user().emails[0].address;
    }
  },
});

Template.Account_component.events({
  "submit #user"(event) {
    event.preventDefault();
    const firstName = event.target.firstName.value;
    const lastName = event.target.lastName.value;
    Meteor.call("users.update", firstName, lastName, (error, result) => {
      if (error) {
        console.error(error);
      } else {
        user_update_success_toast();
      }
    });
  },
});

const user_update_success_toast = () => {
  Swal.fire({
    title: "Account details updated",
    icon: "success",
    toast: true,
    position: "bottom",
    timer: 4000,
    showConfirmButton: false,
    background: "#15803d",
    iconColor: "#bbf7d0",
    color: "#bbf7d0",
    customClass: "toast-success",
  });
};
