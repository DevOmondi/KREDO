const emailNotifications = require("./emailNotifications");
const path = require("path");
require("dotenv").config({ path: path.join(__dirname, "../../.env") });

console.log("running tests");
// await emailNotifications(
//   "newOrder",
//   {
//     redirectUrl: process.env.ADMIN_APP + "/order-manager",
//     order,
//   },
//   process.env.ADMIN_EMAIL
// );
// console.log("working");

try {
  const _host = "http://localhost:5001/";

  emailNotifications(
    "newRegisteredUser",
    {
      redirectUrl: _host + `self-register?validation=jwt}`,
    },
    "olivermirimu@gmail.com"
  ).then((_res) => {
    console.log("success: ", _res);
  });
} catch (_err) {
  console.log("failed: ", _err);
}
