const sgMail = require("@sendgrid/mail");
const fs = require("fs");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../.env") });

function sendEmail({
  receipient,
  subject,
  text,
  templatePath,
  sender = "tests@binarypay.co.ke",
  // sender = "tests@themillennialmumstory.com",
  substitute = {},
}) {
  console.log("sender: ", sender);
  sgMail.setApiKey(process.env.SENDGRID_API_KEY);
  const filePath = templatePath ? path.join(__dirname, templatePath) : "";
  const content = filePath
    ? fs.readFileSync(filePath, "utf-8")
    : "This Email has no content. It is a test email please ignore or report to support regards";

  const switchWords = (_emailContent) => {
    if (Object.keys(substitute).length) {
      for (const [_key, _value] of Object.entries(substitute)) {
        _emailContent = _emailContent.replace(_key, _value);
      }
      return _emailContent;
    }
    return _emailContent;
  };

  const msg = {
    to: receipient, // Change to your recipient
    from: sender, // Change to your verified sender
    subject: subject,
    text: text,
    html: switchWords(content),
  };
  // console.log(receipient, substitute);
  return sgMail
    .send(msg)
    .then((_res) => {
      console.log("Email sent: ", _res);
      // console.log("errors ss: ", _res?.body);
    })
    .catch((error) => {
      // TODO: log this error
      console.log("an error occured: ", error.response);
      // console.log(error.response.body);
      // console.error(JSON.stringify(error));
    });
}
// sendEmail({
//   receipient: "olivermirimu@gmail.com",
//   text: "some test",
//   templatePath: "",
//   subject: "Test subject",
// });
module.exports = sendEmail;
