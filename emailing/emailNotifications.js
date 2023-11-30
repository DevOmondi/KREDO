const fs = require("fs");
const path = require("path");
const jwt = require("jsonwebtoken");

const sendEmail = require("./mailersend");
const { CustomError } = require("../utility");

const emailNotifications = async (
  _type,
  _details,
  _receipient = "olivermirimu@gmail.com"
) => {
  try {
    switch (_type) {
      case "failedTransaction":
        return sendEmail({
          receipient: _receipient,
          subject: "Failed Transaction",
          text: "A transaction failed.",
          templatePath: "./templates/failed-transaction.html",
          substitute: {
            _REDIRECT_LINK_: _details.redirectUrl,
            _TRANSACTION_NUMBER_: _details.transactionNumber,
            _TRANSACTION_TIME_: new Date(_details.transactionDate),
            _TRANSACTION_AMOUNT_: _details.amount,
            _ADD_MESSAGE_: "",
          },
        });
      case "automatedResponse":
        return sendEmail({
          receipient: _receipient,
          subject: "We'll get back to you shortly",
          text: "We have received your email, one of our representatives we'll get back to you shortly.",
          templatePath: "./templates/automated-response.html",
          substitute: {
            _ADD_MESSAGE_: "",
          },
        });
      case "newUser":
        return sendEmail({
          receipient: _receipient,
          subject: "New User Has Registered.",
          text: "A New account has been created.",
          templatePath: "./templates/new-user.html",
          substitute: {
            _REGISTERED_USERNAME_: _details.username,
          },
        });
      case "newRegisteredUser":
        // post admin registration
        return sendEmail({
          receipient: _receipient,
          subject: "New User Has Registered.",
          text: "A New review has been made.",
          templatePath: "./templates/new-registered-user.html",
          substitute: {
            _REDIRECT_LINK_: _details.redirectUrl,
          },
        });
      case "contactForm":
        return sendEmail({
          receipient: _receipient,
          subject: "New Entry in contact form.",
          text: `A new entry in contact form from ${_details.senderEmail}.`,
          templatePath: "./templates/contact-form.html",
          substitute: {
            _MESSAGE_EMAIL_: _details.senderEmail,
            _MESSAGE_: _details.message,
            _MESSAGE_TIME_: new Date(`${_details.nowDate}`),
          },
        });
      case "emailVerification":
        return sendEmail({
          receipient: _receipient,
          subject: "Welcome to Binary Pay.",
          text: "Welcome to Binary Pay! Please verify your email",
          templatePath: "./templates/account-activation.html",
          substitute: {
            _REDIRECT_LINK_: _details.redirectUrl,
          },
        });
      case "passwordReset":
        return sendEmail({
          receipient: _receipient,
          subject: "Password Reset.",
          text: "Reset your password",
          templatePath: "./templates/password-reset.html",
          substitute: { _REDIRECT_LINK_: _details.redirectUrl },
        });
      case "error":
        return sendEmail({
          receipient: _receipient,
          subject: "Fatal Error Occured.",
          text: "A fatal error has been logged and requires urgent attention.",
          templatePath: "./templates/new-order.html",
          substitute: {
            _ERROR_NAME_: _details.name,
            _ERROR_MESSAGE_: _details.message,
            _OCCURENCE_TIME_: _details.time,
            _ERROR_TYPE_: _details.type,
            _ERROR_DESCRIPTION_:
              typeof _details.errorBody != "object"
                ? _details.errorBody
                : JSON.stringify(_details.errorBody),
          },
        });
      default:
        return;
    }
  } catch (err) {
    throw new CustomError(err.message, err.name);
  }
};

module.exports = emailNotifications;
