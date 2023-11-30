const express = require("express");
const axios = require("axios");
const path = require("path");
const passport = require("passport");
const fs = require("fs");
const { v4: uuidv4 } = require("uuid");

const { CustomError } = require("../../utility");
const logger = require("../../logger");
const db = require("../../models");
const PurchaseRequest = require("../../models/purchaseRequests")(
  db.sequelize,
  db.Sequelize
);
const emailNotifications = require("../../emailing/emailNotifications");

require("dotenv").config({
  path: path.join(__dirname, "../../.env"),
});

const services = {
  "Safaricom Airtime": {
    serviceID: 101,
    serviceCode: "SAFCOM",
  },
  "Airtel Airtime": {
    serviceID: 102,
    serviceCode: "AIRTEL",
  },
  "Telkom Airtime": {
    serviceID: 103,
    serviceCode: "TELKOM",
  },
  "KPLC Postpaid": {
    serviceID: 104,
    serviceCode: "KPLCPOSTPAID",
  },
  "KPLC Prepaid": {
    serviceID: 105,
    serviceCode: " KPLCPREPAID",
  },
};

const recursiveRemoveSpace = (_accNumber) => {
  if (_accNumber.split(" ").length > 1) {
    _accNumber = _accNumber.split(" ").join("");
    recursiveRemoveSpace(_accNumber);
  }
  return _accNumber;
};

const formatAccNumber = (_accNumber) => {
  _accNumber = _accNumber.replace("+", "");
  _accNumber = recursiveRemoveSpace(_accNumber);

  if (_accNumber[0] === "0") {
    let _temp = _accNumber.split("");
    _temp.splice(0, 1, "254");
    return _temp.join("");
  }
  return _accNumber;
};

const getProvider = (_accNo) => {
  _accNo = formatAccNumber(_accNo);

  const serviceProviders = {
    safaricom: [
      "25470",
      "25471",
      "25472",
      "25474",
      "254757",
      "254758",
      "254759",
      "254768",
      "254769",
      "25479",
      "25411",
    ],
    airtel: [
      "25473",
      "254750",
      "254751",
      "254752",
      "254753",
      "254754",
      "254755",
      "254756",
      "254762",
      "25478",
      "25410",
      "25420",
    ],
    telkom: ["25477"],
    "kplc-prepaid": [],
    "kplc-postpaid": [],
    homelands: ["254744"],
    faiba: ["254747"],
    equitel: [""],
  };

  const _prefix1 = _accNo.substring(0, 6);
  const _prefix2 = _accNo.substring(0, 5);

  logger.log("info", "Setting service provider for " + _accNo);
  logger.info("prefix1 " + _prefix1 + ", prefix2: " + _prefix2);

  if (
    serviceProviders.safaricom.includes(_prefix1) ||
    serviceProviders.safaricom.includes(_prefix2)
  ) {
    return "Safaricom Airtime";
  } else if (
    serviceProviders.airtel.includes(_prefix1) ||
    serviceProviders.airtel.includes(_prefix2)
  ) {
    return "Airtel Airtime";
  } else if (
    serviceProviders.telkom.includes(_prefix1) ||
    serviceProviders.telkom.includes(_prefix2)
  ) {
    return "Telkom Airtime";
  } else {
    return;
  }
};

const testTransaction = (_payload) => {
  const reqObject = JSON.stringify(_payload);

  console.log("request: ", reqObject);
  try {
    return axios({
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": reqObject.length,
      },
      url: "https://5435-105-160-115-74.in.ngrok.io/test",
      data: reqObject,
    }).then((_response) => {
      const _data = _response.data;
      if (_data.status === "200") return _data;
      console.log(_data.message);
    });
  } catch (error) {
    return {
      error: new CustomError(
        "Problem connecting to Payment System.",
        "paymentError"
      ),
      _error: error,
    };
  }
};
// helper functions
const purchaseTransaction = (_payload) => {
  logger.info("initiating favoured api call.");
  const reqObject = JSON.stringify({
    Credentials: {
      merchantCode: process.env.MERCHANT_CODE,
      username: process.env.MERCHANT_USERNAME,
      password: process.env.MERCHANT_PASS,
    },
    Request: {
      transactionRef: uuidv4(),
      serviceID: _payload.serviceID,
      serviceCode: _payload.serviceCode,
      msisdn: _payload.accountNumber,
      accountNumber: _payload.accountNumber,
      amountPaid: _payload.amountPaid,
    },
  });

  logger.info(`Making Purchase for: ${reqObject}`);

  try {
    return axios({
      method: "post",
      headers: {
        "Content-Type": "application/json",
        "Content-Length": reqObject.length,
      },
      url: process.env.PAYMENT_API,
      data: reqObject,
    }).then(async (_response) => {
      // store response and request body

      return await PurchaseRequest.create({
        purchaseBody: JSON.parse(reqObject),
        response: _response.data,
      }).then((_res) => {
        console.log("succesfully saved purchase");
        logger.info("succesfully saved purchase");

        const _data = _response.data;
        if (_data.status === "200") {
          logger.info("Succesfully purchased from favoured");
          return _data;
        } else if (Number(_data.status) < 500) {
          logger.info("Failed with error from favoured");
          return { ..._data, failedResponse: true };
        }
        console.log(_data);
        return { error: _data };
      });
    });
  } catch (error) {
    logger.error("failed to make: " + error.message);
    console.log(error);
    return {
      error: new CustomError(
        "Problem connecting to Payment System.",
        "paymentError"
      ),
      _error: error,
    };
  }
};

const getToken = () => {
  let unirest = require("unirest");

  let req = unirest(
    "GET",
    "https://sandbox.safaricom.co.ke/oauth/v1/generate?grant_type=client_credentials"
  )
    .headers({
      Authorization:
        "Bearer cFJZcjZ6anEwaThMMXp6d1FETUxwWkIzeVBDa2hNc2M6UmYyMkJmWm9nMHFRR2xWOQ==",
    })
    .send()
    .end((res) => {
      if (res.error) throw new Error(res.error);
      console.log(res.raw_body);
    });
};

/**
 * 
 * @param {*} Transaction 
 * @param {*} Confirmation 
 * @returns 
 */
const transactionRoutes = (Transaction, Confirmation) => {
  const transactionsRouter = express.Router();

  /**
   * single account purchase expects JSON
   * {
      "accountNumber": "2547******",
      "amountPaid": 5
    }
   */
  transactionsRouter
    .route("/purchase")
    .post(
      passport.authenticate("jwt", { session: false }),
      async (req, res) => {
        try {
          if (!req.body.accountNumber || !req.body.amountPaid) {
            logger.info("Purchase request failed, Missing info: " + req.body);
            res.status(400).json({
              errorMessage:
                "Missing info from purchase request. Amount and account number are required.",
            });
          }

          const _transaction = {
            accountNumber: req.body.accountNumber,
            amount: req.body.amountPaid,
            statusComplete: false,
          };

          const _accountProvider = getProvider(req.body.accountNumber);

          if (_accountProvider) {
            logger.info("Provider Set: " + _accountProvider);
            logger.info(
              "Service Provider details: " + services[_accountProvider]
            );

            const _purchaseBody = {
              serviceID: services[_accountProvider].serviceID,
              serviceCode: services[_accountProvider].serviceCode,
              msisdn: formatAccNumber(req.body.accountNumber),
              accountNumber: formatAccNumber(req.body.accountNumber),
              amountPaid: `${parseInt(req.body.amountPaid)}`,
            };

            logger.info(
              "Initiating purchase for: " + JSON.stringify(_purchaseBody)
            );

            const _response = await purchaseTransaction(_purchaseBody);

            if (_response.error) {
              logger.info("Failed " + _response._error);
              throw _response.error;
            }

            // check if response was return but failed
            _transaction.statusComplete = !_response.failedResponse;

            Transaction.create({
              ..._transaction,
              details: req.body,
              response: _response,
              ref: _response.ref_no,
            }).then((_data) => {
              logger.info(
                "Succesful transaction " + JSON.stringify(_data.toJSON())
              );
              res.status(200).json(_response);
            });
          } else {
            logger.info("Confirmation failed: provider details false.");
            res.status(500).json({
              errorMessage: "Confirmation failed: provider details false.",
              details: req.body,
            });
          }
        } catch (_err) {
          logger.error(_err);
          console.log(_err);
          res.status(500).json({
            errorMessage: "Sorry an error occured. Please try again.",
          });
        }
      }
    );

  transactionsRouter
    .route("/bulk-purchase")
    .post(
      passport.authenticate("jwt", { session: false }),
      async (req, res) => {
        try {
          if (req.body) {
            console.log(req.body);
            const result = {
              success: { total: 0, succeeded: [] },
              fail: { total: 0, failed: [] },
            };

            for (let _transactionId of req.body.transactions) {
              await Transaction.findOne({
                where: { id: _transactionId },
              }).then(async (_updateTransaction) => {
                if (_updateTransaction && !_updateTransaction.statusComplete) {
                  const _accountProvider = getProvider(
                    _updateTransaction.accountNumber
                  );

                  if (_accountProvider) {
                    logger.info("Provider Set: " + _accountProvider);
                    logger.info(
                      "Service Provider details: " +
                        JSON.stringify(services[_accountProvider])
                    );
                    const _purchaseBody = {
                      serviceID: services[_accountProvider].serviceID,
                      serviceCode: services[_accountProvider].serviceCode,
                      msisdn: formatAccNumber(_updateTransaction.accountNumber),
                      accountNumber: formatAccNumber(
                        _updateTransaction.accountNumber
                      ),
                      amountPaid: `${parseInt(_updateTransaction.amount)}`,
                    };
                    logger.info(
                      "Initiating purchase for: " +
                        JSON.stringify(_purchaseBody)
                    );

                    const _response = await purchaseTransaction(_purchaseBody);

                    if (!_response.error) {
                      _updateTransaction
                        .update({
                          response: _response,
                          ref: _response.ref_no,
                          statusComplete: !_response.failedResponse,
                        })
                        .then((_res) => {
                          logger.info(
                            "successfully saved to DB: " + JSON.stringify(_res)
                          );
                          result.success.total = result.success.total + 1;
                          result.success.succeeded = [
                            ...result.success.succeeded,
                            _transactionId,
                          ];
                        });
                    } else {
                      result.fail.total = result.fail.total + 1;
                      result.fail.failed = [
                        ...result.fail.failed,
                        _transactionId,
                      ];
                      logger.info("Failed " + _response._error);
                    }
                  } else {
                    logger.info("Confirmation failed: provider details false.");
                    res.status(500).json({
                      errorMessage:
                        "Confirmation failed: provider details false.",
                      details: req.body,
                    });
                  }
                } else {
                  if (!_updateTransaction?.statusComplete) {
                    logger.info(
                      "Already purchased: " + JSON.stringify(_transactionId)
                    );
                  } else {
                    logger.info(
                      "Could not find initial transaction for: " +
                        JSON.stringify(req.body)
                    );
                  }
                }
              });
            }
            res.status(200).json(result);
          }
        } catch (_err) {
          logger.error(JSON.stringify(_err));
          console.log(_err);
          res.status(500).json({
            errorMessage: "Sorry an error occured. Please try again.",
          });
        }
      }
    );

  transactionsRouter.route("/validation").post(async (req, res) => {
    try {
      try {
        logger.info("validating ,mpesa payment: " + JSON.stringify(req.body));
        console.log("validating ,mpesa payment: " + req.body);
        const _serviceProvider = getProvider(req.body.BillRefNumber);

        logger.info("Provider Set: " + _serviceProvider);
        if (_serviceProvider) {
          if (parseInt(req.body.TransAmount) >= 5) {
            const _transaction = {
              details: req.body,
              ref: req.body.TransID,
              statusComplete: false,
              accountNumber: req.body.BillRefNumber,
              amount: req.body.TransAmount,
            };

            Transaction.create({
              ..._transaction,
            }).then((_data) => {
              logger.info("Transaction succesfully saved ID: " + _data.id);
              res.status(200).json({
                ResultCode: 0,
                ResultDesc: "Accepted",
              });
            });
          } else {
            logger.info("Transaction failed: Value too low.");
            res.status(400).json({
              resultCode: "C2B00013",
              resultDesc: "Rejected",
            });
          }
        } else {
          logger.info("Transaction failed! Invalid provider.");
          res.status(400).json({
            ...req.body,
            resultCode: "C2B00012",
            resultDesc: "Rejected",
          });
        }
      } catch (_err) {
        logger.error("Validation failed: " + _err.message);
        res.status(500).json({
          resultCode: 1,
          resultDesc: "Rejected",
        });
      }
    } catch (_err) {
      logger.error(_err);
      res.status(500).json({
        resultCode: "C2B00016",
        resultDesc: "Rejected",
      });
    }
  });

  transactionsRouter.route("/confirmation").post(async (req, res) => {
    const _host = req.protocol + "://" + req.get("host") + "/";
    logger.info("confirmation request, mpesa payment: " + req.body);
    try {
      if (req.body) {
        const _accountProvider = getProvider(req.body.BillRefNumber);

        if (_accountProvider) {
          logger.info("Provider Set: " + _accountProvider);
          logger.info(
            "Service Provider details: " +
              JSON.stringify(services[_accountProvider])
          );

          const _purchaseBody = {
            serviceID: services[_accountProvider].serviceID,
            serviceCode: services[_accountProvider].serviceCode,
            msisdn: formatAccNumber(req.body.BillRefNumber),
            accountNumber: formatAccNumber(req.body.BillRefNumber),
            amountPaid: `${parseInt(req.body.TransAmount)}`,
          };

          Confirmation.create({
            confirmationDetails: req.body,
            purchaseBody: _purchaseBody,
          }).then((_data) => {
            logger.info("Transaction succesfully saved ID: " + _data.id);
          });

          const _response = await purchaseTransaction(_purchaseBody);

          if (_response.error) {
            logger.info("Error completing purchase " + _response.error);
            // TODO: record send email for transaction to be manually done
            emailNotifications("failedTransaction", {
              redirectUrl: _host + "",
              transactionNumber: req.body.TransID,
              transactionDate: new Date(),
              amount: req.body.TransAmount,
            });
            console.log("do manual transaction");
            return res.json({
              ResponseCode: "1",
              ResultDesc: "",
            });
          }

          logger.info("Succesfully purchased");

          await Transaction.findOne({
            where: { "details.TransID": req.body.TransID },
          }).then((_updateTransaction) => {
            if (_updateTransaction) {
              _updateTransaction
                .update({
                  response: _response,
                  statusComplete: !_response.failedResponse,
                })
                .then((_res) => {
                  logger.info(
                    "succesfully saved to DB: " + JSON.stringify(_res)
                  );
                  return res.json({
                    ResponseCode: 0,
                    ResultDesc: "",
                  });
                });
            } else {
              logger.info(
                "Could not find initial transaction for: " +
                  JSON.stringify(req.body)
              );
            }
          });
        } else {
          logger.info("Confirmation failed: provider details false.");
          res.status(500).json({
            errorMessage: "Confirmation failed: provider details false.",
            details: req.body,
          });
        }
      }
    } catch (_err) {
      logger.error("Failed to fetch history: " + _err);
      res.status(500).json({
        errorMessage: "Sorry an error occured. Please try again.",
      });
    }
  });

  transactionsRouter.route("/history").get((req, res) => {
    Transaction.findAll()
      .then((_res) => {
        let _transactionsList = [];
        if (_res) {
          _transactionsList = _res.map((_item) => {
            const _newItem = _item.toJSON();
            return _newItem;
          });
        }
        return res.status(200).json(_transactionsList);
      })
      .catch((_err) => {
        console.log(_err);
        logger.error("Failed to fetch history: " + _err);
        res.status(500).json({
          errorMessage: "Sorry an error occured. Please try again.",
        });
      });
  });

  transactionsRouter
    .route("/float")
    .get(passport.authenticate("jwt", { session: false }), (req, res) => {
      Transaction.findOne({ order: [["updatedAt", "DESC"]] })
        .then((_res) => {
          const _float = _res.response.float_bal;
          logger.info("Float balance fetched: ", _float);
          res.status(200).json({
            balance: _float,
          });
        })
        .catch((_err) => {
          logger.error("Failed to fetch float: " + _err);
          res.status(500).json({
            errorMessage: "Sorry an error occured. Please try again.",
          });
        });
    });

  return transactionsRouter;
};

module.exports = transactionRoutes;
