const express = require("express");
const bodyParser = require("body-parser");
const authenticate = require("../authenticate");
const cors = require("./cors");

const Favorites = require("../models/favorite");
const Dishes = require("../models/dishes");

const favoriteRouter = express.Router();

favoriteRouter.use(bodyParser.json());

favoriteRouter
  .route("/")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .then(
        (favorites) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorites);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }).then((favorite) => {
      // no list of favorites -> create one
      if (!favorite) {
        Favorites.create({ user: req.user._id, dishes: req.body })
          .then(
            (favorite) => {
              console.log("Created favorite " + favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
        // already a list of favorites
      } else {
        // check if the dish(es) trying to be POSTed are already in favorites
        if (!favorite.dishes.includes(req.body)) {
          favorite.dishes.push(req.body);
        }
        favorite
          .save()
          .then(
            (favorite) => {
              console.log("Created favorite " + favorite);
              res.statusCode = 200;
              res.setHeader("Content-Type", "application/json");
              res.json(favorite);
            },
            (err) => next(err)
          )
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.remove({ user: req.user._id })
      .then(
        (favorite) => {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          res.json(favorite);
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    res.statusCode = 403;
    res.end("GET operation not supported on /favorites/" + req.params.dishId);
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    // check to make sure the dish exists
    Dishes.findById(req.params.dishId).then((dish) => {
      // dish exists
      if (dish != null) {
        // find favorites for appropriate user
        Favorites.findOne({ user: req.user._id })
          .populate("user")
          .populate("dishes")
          .then((favorite) => {
            // if favorites don't exist for user
            if (!favorite) {
              Favorites.create({
                user: req.user._id,
                dishes: [req.params.dishId],
              })
                .then(
                  (favorite) => {
                    console.log("Created favorite(s) " + favorite);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  },
                  (err) => next(err)
                )
                .catch((err) => next(err));
              // favorites already exist for user
            } else {
              // Dish not in favorites already
              if (!favorite.dishes.includes(req.params.dishId)) {
                favorite.dishes.push(req.params.dishId);
                favorite.save().then(
                  (favorite) => {
                    console.log("Created favorite(s) " + favorite);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  },
                  (err) => next(err)
                );
              }
            }
          })
          .catch((err) => next(err));
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .then(
        (favorite) => {
          if (favorite) {
            if (favorite.dishes.includes(req.params.dishId)) {
              favorite.dishes.id(req.params.dishId).remove();
              favorite.save().then(
                (favorite) => {
                  console.log("Deleted favorite(s) " + favorite);
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                },
                (err) => next(err)
              );
            } else {
              err = new Error("Dish not found: " + req.params.dishId);
              err.status = 404;
              return next(err);
            }
          } else {
            err = new Error("Couldn't find user favorites");
            err.status = 404;
            return next(err);
          }
        },
        (err) => next(err)
      )
      .catch((err) => next(err));
  });

module.exports = favoriteRouter;
