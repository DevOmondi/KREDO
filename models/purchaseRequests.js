const purchaseRequestSchema = (sequelize, Sequelize) => {
  const Purchase = sequelize.define(
    "Purchase",
    {
      response: { type: Sequelize.JSON },
      purchaseBody: { type: Sequelize.JSON },
    },
    { timestamps: true }
  );

  return Purchase;
};

module.exports = purchaseRequestSchema;

