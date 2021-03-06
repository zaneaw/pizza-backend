const createError = require("http-errors");
const express = require("express");
const path = require("path");
const morgan = require("morgan");
const passport = require("passport");
const config = require("./config");

const indexRouter = require("./routes/index");
const usersRouter = require("./routes/users");
const dishRouter = require("./routes/dishRouter");
const leaderRouter = require("./routes/leaderRouter");
const promoRouter = require("./routes/promoRouter");
const uploadRouter = require("./routes/uploadRouter");
const favoriteRouter = require("./routes/favoriteRouter");
const commentRouter = require("./routes/commentRouter");
const feedbackRouter = require("./routes/feedbackRouter");

const mongoose = require("mongoose");

const url = config.mongoUrl;
const connect = mongoose.connect(url);

connect.then(
  (db) => {
    console.log("Connected correctly to the server");
  },
  (err) => {
    console.log(err);
  }
);

let app = express();

// Secure traffic only
app.all("*", (req, res, next) => {
  if (req.secure) {
    return next();
  } else {
    res.redirect(
      307,
      "https://" + req.hostname + ":" + app.get("secPort") + req.url
    );
  }
});

// view engine setup
app.set("views", path.join(__dirname, "views"));
app.set("view engine", "jade");

app.use(morgan("tiny"));
app.use(express.json());
app.use(express.urlencoded({ extended: false }));
// app.use(cookieParser("12345-67890-09876-54321"));

app.use(passport.initialize());

app.use(express.static(path.join(__dirname, "public")));

app.use("/", indexRouter);
app.use("/users", usersRouter);
app.use("/dishes", dishRouter);
app.use("/leaders", leaderRouter);
app.use("/promotions", promoRouter);
app.use("/imageUpload", uploadRouter);
app.use("/favorites", favoriteRouter);
app.use("/comments", commentRouter);
app.use("/feedback", feedbackRouter)

// catch 404 and forward to error handler
app.use(function (req, res, next) {
  next(createError(404));
});

// error handler
app.use(function (err, req, res, next) {
  // set locals, only providing error in development
  res.locals.message = err.message;
  res.locals.error = req.app.get("env") === "development" ? err : {};

  // render the error page
  res.status(err.status || 500);
  res.render("error");
});

module.exports = app;
