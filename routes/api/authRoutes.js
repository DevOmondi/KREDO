const express = require("express");
const bcrypt = require("bcrypt");
const jwt = require("jsonwebtoken");
const path = require("path");
const fs = require("fs");
const passport = require("passport");

const {
  CustomError,
  getUserByUsername,
  getUserByEmail,
  getUserByDBId,
} = require("../../utility");

const logger = require("../../logger");
const emailNotifications = require("../../emailing/emailNotifications");
const pathToKey = path.join(__dirname, "../../cryptography/id_rsa_priv.pem");
const PRIV_KEY = fs.readFileSync(pathToKey, "utf-8");
const pubKeyPath = path.join(__dirname, "../../cryptography/id_rsa_pub.pem");
const PUB_KEY = fs.readFileSync(pubKeyPath, "utf-8");

const issueJwt = (id) => {
  const expiresIn = "1h";

  const payload = {
    sub: id,
    iat: Date.now(),
  };
  const signedToken = jwt.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: "RS256",
  });
  return { token: `Bearer ${signedToken}`, expires: expiresIn };
};

const issueVerificationJwt = (id, expiresIn = "1h") => {
  const payload = {
    sub: id,
    iat: Math.floor(Date.now() / 1000) - 30,
  };
  const signedToken = jwt.sign(payload, PRIV_KEY, {
    expiresIn,
    algorithm: "RS256",
  });
  return signedToken;
};

const authRoutes = (User) => {
  const authRouter = express.Router();

  authRouter.route("/login").post(async (req, res) => {
    const user = await getUserByUsername(req.body.username);
    if (!user) {
      return res
        .status(400)
        .json({ errorMessage: "Credentials provided are incorect" });
    }
    try {
      if (await bcrypt.compare(req.body.password, user.password)) {
        // issue jwt return user with jwt header
        const jwtToken = issueJwt(user.id);
        delete user.password;

        return res
          .header("Authorization", jwtToken.token)
          .json({ message: `${user.username} successfully logged in.` });
      } else {
        return res.json({ errorMessage: "Credentials provided are incorect" });
      }
    } catch (error) {
      console.log(error);
      return res.json({
        errorMessage: "Sorry, an error occured. Please try again.",
      });
    }
  });

  // admin registration for users
  authRouter.route("/admin-register").post(async (req, res) => {
    try {
      const _host = req.protocol + "://" + req.get("host") + "/";

      const sendRegistrationEmail = (_user) => {
        const _redirectLink =
          _host + `self-register?validation=${issueVerificationJwt(_user.id)}`;

        // send email
        return emailNotifications(
          "newRegisteredUser",
          {
            redirectUrl: _redirectLink,
          },
          req.body.email
        ).then(() => {
          logger.info(
            `Sent registration email to ${req.body.email}, URL: ${_redirectLink}`
          );
          res.status(200).json({
            message: userExists
              ? "Email already in use. Resent email link."
              : "Successfull. Kindly alert user to check email.",
            redirect: _redirectLink,
          });
        });
      };

      if (!req.body.email) {
        return res.status(400).json({ errorMessage: "Email is required." });
      }

      // check if email already in use
      const userExists = await getUserByEmail(req.body.email);

      if (userExists) {
        return sendRegistrationEmail(userExists);
      }

      User.create({ ...req.body, username: req.body.email }).then((_res) => {
        const _user = _res.toJSON();

        logger.info("Saved new user: " + JSON.stringify(_user));
        return sendRegistrationEmail(_user);
      });
    } catch (_err) {
      console.log(_err);
      logger.error("Failed to register user: " + req.body.email);
      res.status(500).json({ errorMessage: _err.message });
    }
  });

  // forgot password
  authRouter.route("/forgot-password").post(async (req, res) => {
    try {
      await User.findOne({ email: req.body.email }).then(async (_user) => {
        const _host = req.protocol + "://" + req.get("host") + "/";
        if (_user) {
          const _redirectLink =
            _host +
            `self-register?validation=${issueVerificationJwt(_user.id)}`;

          return emailNotifications(
            "passwordReset",
            {
              redirectUrl: _redirectLink,
            },
            req.body.email
          ).then(() => {
            logger.info(
              `Sent password reset email to ${req.body.email}, URL: ${_redirectLink}`
            );
            res.status(200).json({
              message: "Successfull. Kindly check your email.",
              redirect: _redirectLink,
            });
          });
        }
        return res
          .status(400)
          .json({ errorMessage: "User with email does not exist!" });
      });
    } catch (_err) {
      console.log(_err);
      res.json({ errorMessage: _err.message });
    }
  });

  // password reset
  authRouter.route("/password-reset").post(async (req, res) => {
    try {
      const _host = req.protocol + "://" + req.get("host") + "/";

      if (!req.headers?.tkn) {
        return res.status(400).json({
          errorMessage: "Sorry, invalid token.",
          type: "invalidToken",
        });
      }

      const decodedPayload = jwt.verify(
        req.headers.tkn,
        PUB_KEY,
        (_err, _decoded) => {
          if (_err) {
            if (_err.name === "TokenExpiredError") {
              throw new CustomError(
                "Sorry, your session has expired. Get another email ?",
                "Invalid Token"
              );
            }
            throw new CustomError(
              "Sorry, link is invalid. Get another email ?",
              "Invalid Token"
            );
          }
          return _decoded;
        }
      );

      const _user = await User.findOne({ _id: decodedPayload.sub }).then(
        async (_res) => {
          if (_res) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            _res.password = hashedPassword;
            return _res;
          }
        }
      );
      _user.save().then((_res) => {
        res.status(200).json({
          redirectUrl: _host,
          message: "Password successfully updated.",
        });
      });
    } catch (_err) {
      return res.json({
        errorMessage: _err.message,
      });
    }
  });
  // password reset
  authRouter.route("/password-update").post(async (req, res) => {
    try {
      const _host = req.protocol + "://" + req.get("host") + "/";

      if (!req.headers?.tkn) {
        return res.status(400).json({
          errorMessage: "Sorry, invalid token.",
          type: "invalidToken",
        });
      }

      const decodedPayload = jwt.verify(
        req.headers.tkn,
        PUB_KEY,
        (_err, _decoded) => {
          if (_err) {
            if (_err.name === "TokenExpiredError") {
              throw new CustomError(
                "Sorry, your session has expired. Get another email ?",
                "Invalid Token"
              );
            }
            throw new CustomError(
              "Sorry, link is invalid. Get another email ?",
              "Invalid Token"
            );
          }
          return _decoded;
        }
      );

      const _user = await User.findOne({ _id: decodedPayload.sub }).then(
        async (_res) => {
          if (await bcrypt.compare(req.body.currentPassword, _res.password)) {
            const salt = await bcrypt.genSalt();
            const hashedPassword = await bcrypt.hash(req.body.password, salt);
            _res.password = hashedPassword;
            return _res;
          }
          return res.json({
            errorMessage: "Credentials provided are incorect",
          });
        }
      );
      _user.save().then((_res) => {
        res.status(200).json({
          redirectUrl: _host,
          message: "Password successfully updated.",
        });
      });
    } catch (_err) {
      return res.json({
        errorMessage: _err.message,
      });
    }
  });

  // registration endpoint for all account types
  authRouter
    .route("/self-register")
    .get(async (req, res) => {
      try {
        if (req.headers?.tkn) {
          const decodedPayload = jwt.verify(
            req.headers.tkn,
            PUB_KEY,
            (_err, _decoded) => {
              if (_err) {
                if (_err.name === "TokenExpiredError") {
                  throw new CustomError(
                    "Sorry, your session has expired. Get another email.",
                    "Invalid Token"
                  );
                }
                throw new CustomError(
                  "Sorry, link is invalid. Get another email.",
                  "Invalid Token"
                );
              }
              return _decoded;
            }
          );
          const _user = await getUserByDBId(decodedPayload.sub);

          if (_user) {
            delete _user.password;
            delete _user.id;
            delete _user.updatedAt;
            delete _user.createdAt;

            logger.info("Self registration for: " + _user.email);
            return res.status(200).json(_user);
          }
        }
        logger.error("Self registration failed: Invalid Token");
        return res.status(400).json({
          errorMessage: "Sorry, invalid token.",
          type: "invalidToken",
        });
      } catch (_err) {
        console.log(_err);
        logger.error("Self registration failed: " + JSON.stringify(_err));
        res.status(_err.status || 500).json({ errorMessage: _err.message });
      }
    })
    .post(async (req, res) => {
      // request body must contain a password and a  username
      try {
        const salt = await bcrypt.genSalt();
        if (req.body.password !== req.body.cPassword) {
          throw new CustomError("Password Mismatch.", "Password Mismatch");
        }

        if (!req.body.password || !req.body.username) {
          throw new CustomError(
            "Password and username required.",
            "Missing Field"
          );
        }

        // check if username already in use
        const userExists = await getUserByUsername(req.body.username);
        if (userExists && userExists.email !== req.body.email) {
          // return res.status(400).json({ message: "Username already in use" });
          throw new CustomError(
            "Username already in use.",
            "Unavailable username"
          );
        }

        const hashedPassword = await bcrypt.hash(req.body.password, salt);

        await User.findOne({ where: { email: req.body.email } }).then(
          (_user) => {
            if (_user) {
              _user
                .update({
                  username: req.body.username,
                  password: hashedPassword,
                })
                .then((user) => {
                  const jwtToken = issueJwt(user.id);
                  delete user.password;

                  logger.info(
                    "User " + user.email + " password updated successfully."
                  );

                  return res
                    .header("Authorization", jwtToken.token)
                    .status(201)
                    .json({
                      message: user.username + " account successfully created.",
                      success: true,
                    });
                });
            }
          }
        );
      } catch (error) {
        console.log(error);
        logger.error(JSON.stringify(error));
        res.json({ errorMessage: error.message, code: error.name });
      }
    });

  authRouter.route("/logout").delete((req, res) => {
    // req.logOut();
    //TODO: setup proper session logout
    res
      .status(200)
      .json({ message: "User succesfully logged out", success: true });
  });

  authRouter
    .route("/currentUser")
    .get(passport.authenticate("jwt", { session: false }), (req, res) => {
      return res.status(200).json(req.user);
    });

  return authRouter;
};

module.exports = authRoutes;
