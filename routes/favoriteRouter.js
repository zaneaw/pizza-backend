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
  .options(cors.corsWithOptions, (req, res) => { res.sendStatus(200); })
  .get(cors.cors, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
      .populate("user")
      .populate("dishes")
      .exec((err, favorites) => {
        if (err) return next(err);
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        res.json(favorites);
      });
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      // no list of favorites -> create one
      if (!favorite) {
        Favorites.create({ user: req.user._id })
          .then((favorite) => {
            for (i = 0; i < req.body.length; i++)
              if (favorite.dishes.indexOf(req.body[i]._id === -1))
                favorite.dishes.push(req.body[i]);
            favorite
              .save()
              .then((favorite) => {
                Favorites.findById(favorite._id)
                .populate("user")
                .populate("dishes")
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                })

              })
              .catch((err) => {
                return next(err);
              });
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        for (i = 0; i < req.body.length; i++)
          if (favorite.dishes.indexOf(req.body._id) === -1)
            favorite.dishes.push(req.body[i]);
        favorite
          .save()
          .then((favorite) => {
            Favorites.findById(favorite._id)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          })
          .catch((err) => {
            return next(err);
          });
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.setHeader("Content-Type", "text/plain");
    res.end("PUT operation not supported on /favorites");
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOneAndRemove({ user: req.user._id }, (err, resp) => {
      if (err) return next(err);
      res.statusCode = 200;
      res.setHeader("Content-Type", "application/json");
      res.json(resp);
    });
  });

favoriteRouter
  .route("/:dishId")
  .options(cors.corsWithOptions, (req, res) => {
    res.sendStatus(200);
  })
  .get(cors.cors, (req, res, next) => {
    Favorites.findOne({ user: req.user._id })
    .then((favorites) => {
      if (!favorites) {
        res.statusCode = 200;
        res.setHeader("Content-Type", "application/json");
        return res.json({"exists": false, "favorites": favorites})
      } else {
        // dish doesn't exist in list of favorites
        if (favorites.dishes.indexOf(req.params.dishId) < 0) {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          return res.json({ exists: false, favorites: favorites });
        } else {
          res.statusCode = 200;
          res.setHeader("Content-Type", "application/json");
          return res.json({ exists: true, favorites: favorites });
        }
      }
    }, (err) => next(err))
    .catch((err) => next(err))
  })
  .post(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      if (!favorite) {
        Favorites.create({ user: req.user._id })
          .then((favorite) => {
            favorite.dishes.push({ _id: req.params.dishId });
            favorite
              .save()
              .then((favorite) => {
                Favorites.findById(favorite._id)
                  .populate("user")
                  .populate("dishes")
                  .then((favorite) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(favorite);
                  });
              })
              .catch((err) => {
                return next(err);
              });
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        if (favorite.dishes.indexOf(req.params.dishId) === -1) {
          favorite.dishes.push({ _id: req.params.dishId });
          favorite
            .save()
            .then((favorite) => {
              Favorites.findById(favorite._id)
                .populate("user")
                .populate("dishes")
                .then((favorite) => {
                  res.statusCode = 200;
                  res.setHeader("Content-Type", "application/json");
                  res.json(favorite);
                });
            })
            .catch((err) => {
              return next(err);
            });
        } else {
          res.statusCode = 403;
          res.setHeader("Content-Type", "text/plain");
          res.end("Dish " + req.params.dishId + " already in your favorites!");
        }
      }
    });
  })
  .put(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    res.statusCode = 403;
    res.end("PUT operation not supported on /favorites/" + req.params.dishId);
  })
  .delete(cors.corsWithOptions, authenticate.verifyUser, (req, res, next) => {
    Favorites.findOne({ user: req.user._id }, (err, favorite) => {
      if (err) return next(err);
      let index = favorite.dishes.indexOf(req.params.dishId);
      if (index >= 0) {
        favorite.dishes.splice(index, 1);
        favorite
          .save()
          .then((favorite) => {
            Favorites.findById(favorite._id)
              .populate("user")
              .populate("dishes")
              .then((favorite) => {
                res.statusCode = 200;
                res.setHeader("Content-Type", "application/json");
                res.json(favorite);
              });
          })
          .catch((err) => {
            return next(err);
          });
      } else {
        res.statusCode = 404;
        res.setHeader("Content-Type", "text/plain");
        res.end("Dish " + req.params.dishId + " not in your favorites!");
      }
    });
  });

module.exports = favoriteRouter;
