const router = require("express").Router();
const path = require("path");
const db = require("../models");
const User = require("../models/userModel")(db.sequelize, db.Sequelize);
const Transaction = require("../models/transactionModel")(
  db.sequelize,
  db.Sequelize
);
const Confirmation = require("../models/confirmationRequestModel")(
  db.sequelize,
  db.Sequelize
);

const authRoutes = require("./api/authRoutes")(User);
const transactionRoutes = require("./api/transactionRoutes")(
  Transaction,
  Confirmation
);

// api routing
router.use("/api/auth", authRoutes);
router.use("/api/transaction", transactionRoutes);

router.use("/test", (req, res) => {
  console.log("req body: ", req.body);
  res.status(200).send("Okay");
});

// frontend routes
//to enable react routing
router.use((req, res, next) => {
  res.sendFile(path.join(__dirname, "../binary-pay/build/index.html"));
});

module.exports = router;
