const express = require("express");
const bodyParser = require("body-parser");
const User = require("../models/user");
const passport = require("passport");
const authenticate = require("../authenticate")

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
//          /users
router.get("/", function (req, res, next) {
  res.send("respond with a resource");
});

//      /users/signup
/* if the user doesn't register properly, an error will be sent back
and the auth will fail.
*/
router.post("/signup", (req, res, next) => {
  User.register(
    new User({ username: req.body.username }),
    req.body.password,
    (err, user) => {
      if (err) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json({ err: err });
      } else {
        passport.authenticate("local")(req, res, () => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json({ success: true, status: "Registration Successful" });
        });
      }
    }
  );
});

/* if there is any failure in the auth, the passport.authenticate func 
will automatically send a reply to the client about the failure. */
router.post("/login", passport.authenticate("local"), (req, res, next) => {
  let token = authenticate.getToken({ _id: req.user._id });
  res.statusCode = 200;
  res.setHeader("Content-Type", "application/json");
  res.json({
    success: true,
    token: token,
    status: "You are successfully logged in!",
  });
});

router.get("/logout", (req, res, next) => {
  // if someone is logged in
  if (req.session) {
    req.session.destroy();
    res.clearCookie("session-id");
    res.redirect("/");
    // nobody is logged in
  } else {
    let err = new Error("You are not logged in!");
    err.statusCode = 403;
    return next(err);
  }
});

module.exports = router;
