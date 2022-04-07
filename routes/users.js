const express = require("express");
const bodyParser = require("body-parser");
const passport = require("passport");
const authenticate = require("../authenticate");
const cors = require("./cors");

const User = require("../models/user");

const router = express.Router();
router.use(bodyParser.json());

/* GET users listing. */
router.options("*", cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
});
//          /users
router.get(
    "/",
    cors.corsWithOptions,
    authenticate.verifyUser,
    authenticate.verifyAdmin,
    (req, res, next) => {
        User.find({})
            .then(
                (user) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(user);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    }
);

//      /users/signup
/* if the user doesn't register properly, an error will be sent back
and the auth will fail.
*/
router.post("/signup", cors.corsWithOptions, (req, res) => {
    User.register(
        new User({ username: req.body.username }),
        req.body.password,
        (err, user) => {
            if (err) {
                res.statusCode = 500;
                res.setHeader("Content-Type", "application/json");
                res.json({ err: err });
            } else {
                if (req.body.firstname) {
                    user.firstname = req.body.firstname;
                }
                if (req.body.lastname) {
                    user.lastname = req.body.lastname;
                }
                if (req.body.email) {
                    user.email = req.body.email;
                }
                user.save((err, user) => {
                    if (err) {
                        res.statusCode = 500;
                        res.setHeader("Content-Type", "application/json");
                        res.json({ err: err });
                        return;
                    }
                    passport.authenticate("local")(req, res, () => {
                        res.statusCode = 200;
                        res.setHeader("Content-Type", "application/json");
                        res.json({
                            success: true,
                            status: "Registration Successful",
                        });
                        return;
                    });
                });
            }
        }
    );
});

router.post("/login", cors.corsWithOptions, (req, res, next) => {
    passport.authenticate("local", (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: false,
                status: "Login Unsuccessful!",
                err: info,
            });
        }
        req.logIn(user, (err) => {
            if (err) {
                res.statusCode = 401;
                res.setHeader("Content-Type", "application/json");
                res.json({
                    success: false,
                    status: "Login Unsuccessful!",
                    err: "Could not log in user!",
                });
            }

            var token = authenticate.getToken({ _id: req.user._id });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                status: "Login Successful!",
                token: token,
            });
        });
    })(req, res, next);
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

// if get is successful the user is loaded into the req object
router.get(
    "/facebook/token",
    passport.authenticate("facebook-token"),
    (req, res) => {
        if (req.user) {
            // keeps the user active for whatever the duration is, facebook token no longer needed
            let token = authenticate.getToken({ _id: req.user._id });
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            res.json({
                success: true,
                token: token,
                status: "You are successfully logged in!",
            });
        }
    }
);

router.get("/checkJWTtoken", cors.corsWithOptions, (req, res) => {
    passport.authenticate("jwt", { session: false }, (err, user, info) => {
        if (err) return next(err);

        if (!user) {
            res.statusCode = 401;
            res.setHeader("Content-Type", "application/json");
            return res.json({
                status: "JWT invalid!",
                success: false,
                err: info,
            });
        } else {
            res.statusCode = 200;
            res.setHeader("Content-Type", "application/json");
            return res.json({
                status: "JWT valid!",
                success: true,
                user: user,
            });
        }
    })(req, res);
});

module.exports = router;
