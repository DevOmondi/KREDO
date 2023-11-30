const confirmationRequestSchema = (sequelize, Sequelize) => {
  const Confirmation = sequelize.define(
    "Confirmation",
    {
      confirmationDetails: { type: Sequelize.JSON },
      purchaseBody: { type: Sequelize.JSON },
    },
    { timestamps: true }
  );

  return Confirmation;
};

module.exports = confirmationRequestSchema;
