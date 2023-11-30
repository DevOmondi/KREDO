const fs = require("fs");
const path = require("path");
const { MailerSend, EmailParams, Sender, Recipient } = require("mailersend");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

function sendEmail({
  receipient,
  subject,
  text,
  templatePath,
  substitute = {},
}) {
  const mailerSend = new MailerSend({
    apiKey: process.env.MAILERSEND_KEY,
  });

  const recipients = [new Recipient(receipient, "")];
  const sentFrom = new Sender(
    process.env.INFO_EMAIL,
    process.env.EMAIL_USERNAME
  );

  const filePath = templatePath ? path.join(__dirname, templatePath) : "";
  const content = filePath
    ? fs.readFileSync(filePath, "utf-8")
    : "This Email has no content. It is a test email please ignore or report to support regards";

  const switchWords = (_emailContent) => {
    const commonSubstitutions = {
      _UNSUBSCRIBE_EMAILS_LINK_: "",
      _PRIVACY_POLICY_LINK_: "https://binarypay.co.ke/privacy-policy",
      _LANDING_PAGE_: "https://binarypay.co.ke",
    };
    if (Object.keys({ ...substitute, ...commonSubstitutions }).length) {
      for (const [_key, _value] of Object.entries(substitute)) {
        _emailContent = _emailContent.replace(_key, _value);
      }
      return _emailContent;
    }
    return _emailContent;
  };

  const emailParams = new EmailParams()
    .setFrom(sentFrom)
    .setTo(recipients)
    .setReplyTo(sentFrom)
    .setSubject(subject)
    .setHtml(switchWords(content))
    .setText(text);

  return mailerSend.email
    .send(emailParams)
    .then(() => {
      console.log("Email sent");
    })
    .catch((error) => {
      // TODO: log this error
      console.log("an error occured: ", error);
      // console.log("ss: ", error.body.errors);
    });
}

// sendEmail({
//   receipient: "olivermirimu@gmail.com",
//   text: "some test",
//   templatePath: "",
//   subject: "Test subject",
// });

module.exports = sendEmail;
