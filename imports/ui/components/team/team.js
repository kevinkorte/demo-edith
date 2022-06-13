import { Template } from "meteor/templating";
import { Roles } from "meteor/alanning:roles";
import { Session } from "meteor/session";
import Swal from "sweetalert2";
import bootstrap from "bootstrap";
import "./team.html";

Template.Team_component.onCreated(function () {
  this.autorun(() => {
    this.subscribe("users.all");
    this.subscribe("users.roles");
  });
});

Template.Team_component.helpers({
  activeUsers() {
    return Meteor.users.find({ archived: false });
  },
  hasArchivedUsers() {
    const userCount = Meteor.users.find({ archived: true }).count();
    console.log({ userCount });
    if (userCount > 0) {
      return true;
    }
    return;
  },
  archivedUsers() {
    return Meteor.users.find(
      { archived: true },
      { sort: { archivedDate: -1 } }
    );
  },
  roles(id) {
    if (Roles.userIsInRole(id, "admin")) {
      return "Admin";
    } else if (Roles.userIsInRole(id, "user")) {
      return "Member";
    } else {
      return;
    }
  },
  canRemove(id) {
    const user = Meteor.users.findOne(id);
    if (user.emails[0].address === Meteor.settings.public.demoEmail) {
      return false;
    } else {
      return true;
    }
  },
  countActiveUsers() {
    const userCount = Meteor.users.find({ archived: false }).count();
    return userCount;
  },
  countArchivedUsers() {
    return Meteor.users.find({ archived: true }).count();
  },
  development() {
    return Meteor.isDevelopment;
  },
  userIsAdmin(id) {
    if (Roles.userIsInRole(id, "admin")) {
      return true;
    } else {
      return;
    }
  },
  getOtherRoleOption(id) {
    if (Roles.userIsInRole(id, "admin")) {
      return "member";
    } else {
      return "admin";
    }
  },
  hasFormError() {
    const error = Session.get("hasFormError");
    if (error) {
      return true;
    } else {
      return false;
    }
  },
  readError() {
    return Session.get("formError");
  },
});

Template.Team_component.events({
  "submit #new-user"(event) {
    event.preventDefault();
    const firstName = event.target.firstName.value;
    const lastName = event.target.lastName.value;
    const email = event.target.email.value;
    const role = event.target.role.value;
    Meteor.call(
      "users.create",
      firstName,
      lastName,
      email,
      role,
      (error, result) => {
        if (error) {
          //TODO: Handle error
          console.log(error);
          Session.set("hasFormError", true);
          Session.set("formError", error.reason);
        } else {
          const modalEl = document.getElementById("newMemberModal");
          const modal = bootstrap.Modal.getInstance(modalEl);

          modal.hide();
          modalEl.addEventListener("hidden.bs.modal", () => {
            document.getElementById("new-user").reset();
            success_toast();
          });
          Session.set("hasFormError", null);
          Session.set("formError", null);
        }
      }
    );
  },
  "click #remove"() {
    deactivate_confirm_modal(this._id);
  },
  "click #reinstate"() {
    console.log(this);
    Meteor.call("users.reinstate", this._id, (error, result) => {
      if (error) {
        //TODO: Handle error
        console.error(error);
      } else {
        info_success_toast(
          "Account is now active again",
          "This user can now login."
        );
      }
    });
  },
  "click #success-toast"() {
    success_toast();
  },
  "click .dropdown-item"(event) {
    console.log({ event });
    console.log(this);
    let targetRole = "";
    if (event.target.dataset.role === "member") {
      targetRole = "user";
    } else {
      targetRole = event.target.dataset.role;
    }
    console.log({ targetRole });
    Meteor.call("users.changeRoles", this._id, targetRole, (error) => {
      if (error) {
        console.error(error);
      } else {
        info_success_toast("Account permissions updated");
      }
    });
  },
  "click #role-change-toast"() {
    info_success_toast("Account permissions updated");
  },
  "click #deactivate-confirm"() {
    deactivate_confirm_modal();
  },
  "click #remove-confirm-toast"() {
    const title = "Test Title";
    const text = "Here is a test description.";
    info_success_toast(title, text);
  },
  "click #remove-user"() {},
});

const success_toast = () => {
  Swal.fire({
    title: "User created!",
    text: "An email has been sent to the user",
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
const deactivate_confirm_modal = (userId) => {
  const user = Meteor.users.findOne(userId);
  Swal.fire({
    titleText: "Are you sure?",
    text: `You are about to deactivate ${user.profile.firstName}'s account`,
    icon: "warning",
    iconColor: "#ef4444",
    color: "#ef4444",
    showCancelButton: true,
    confirmButtonText: "Yes, deactivate account",
    confirmButtonColor: "#ef4444",
    focusConfirm: false,
    cancelButtonColor: "#ffffff",
    buttonsStyling: false,
    reverseButtons: true,
    customClass: {
      confirmButton: "btn btn-red-600 ms-2",
      cancelButton: "btn btn-slate-100",
    },
  }).then((result) => {
    if (result.isConfirmed === true) {
      Meteor.call("users.remove", userId, (error, result) => {
        if (error) {
          //TODO: Handle error
          console.error(error);
        } else {
          info_success_toast("User archived");
        }
      });
    }
  });
};

const info_success_toast = (titleText, text) => {
  Swal.fire({
    titleText: titleText,
    text: text,
    icon: "success",
    toast: true,
    position: "bottom",
    timer: 4000,
    showConfirmButton: false,
    background: "#1d4ed8",
    iconColor: "#bfdbfe",
    color: "#dbeafe",
    customClass: "toast-info",
  });
};
