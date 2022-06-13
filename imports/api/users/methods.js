import { Meteor } from "meteor/meteor";
import { check } from "meteor/check";
import { Roles } from "meteor/alanning:roles";

Meteor.methods({
  "users.create"(firstName, lastName, email, role) {
    check(firstName, String);
    check(lastName, String);
    check(email, String);
    check(role, String);
    if (firstName === "" || lastName === "") {
      throw new Meteor.Error(
        "no-complete-name",
        "Users much have a first and last name"
      );
    }
    const userId = Accounts.createUser({
      email: email,
      profile: {
        firstName: firstName,
        lastName: lastName,
      },
      password: "demo",
    });
    Roles.addUsersToRoles(userId, role);
    Meteor.users.update(userId, { $set: { archived: false } });
  },
  "users.remove"(userToRemoveId) {
    check(userToRemoveId, String);
    const userRoles = Roles.getRolesForUser(userToRemoveId);
    const myId = Meteor.userId();
    if (!myId || !Roles.userIsInRole(myId, "admin")) {
      throw new Meteor.Error(
        "access-denied",
        "You don't have access to preform this function."
      );
    } else {
      Meteor.users.update(userToRemoveId, {
        $set: {
          archived: true,
          archivedDate: new Date(),
        },
      });
    }
  },
  "users.reinstate"(userToReinstateId) {
    check(userToReinstateId, String);
    const userRoles = Roles.getRolesForUser(userToReinstateId);
    const myId = Meteor.userId();
    if (!myId || !Roles.userIsInRole(myId, "admin")) {
      throw new Meteor.Error(
        "access-denied",
        "You don't have access to preform this function."
      );
    } else {
      Meteor.users.update(userToReinstateId, {
        $set: {
          archived: false,
          archivedDate: null,
        },
      });
    }
  },
  "users.changeRoles"(userId, targetRole) {
    check(userId, String);
    check(targetRole, String);
    const roles = Roles.getRolesForUser(userId);
    roles.forEach((role) => {
      if (role === "admin") {
        Roles.removeUsersFromRoles(userId, role);
      }
    });
    Roles.setUserRoles(userId, targetRole);
  },
  "users.update"(firstName, lastName) {
    check(firstName, String);
    check(lastName, String);
    Meteor.users.update(Meteor.userId(), {
      $set: {
        "profile.firstName": firstName,
        "profile.lastName": lastName,
      },
    });
  },
});
