const express = require("express");
const bodyParser = require("body-parser");
const cors = require("./cors");

const Feedback = require("../models/feedback");

const feedbackRouter = express.Router();

feedbackRouter.use(bodyParser.json());

feedbackRouter
    .route("/")
    .options(cors.corsWithOptions, (req, res) => {
        res.sendStatus(200);
    })
    .get(cors.cors, (req, res, next) => {
        Feedback.find(req.query)
            .then(
                (feedbacks) => {
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(feedbacks);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .post(cors.corsWithOptions, (req, res, next) => {
        Feedback.create(req.body)
            .then(
                (feedback) => {
                    console.log("Feedback Created: ", feedback);
                    res.statusCode = 200;
                    res.setHeader("Content-Type", "application/json");
                    res.json(feedback);
                },
                (err) => next(err)
            )
            .catch((err) => next(err));
    })
    .put(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end("PUT operation not supported on /feedback");
    })
    .delete(cors.corsWithOptions, (req, res, next) => {
        res.statusCode = 403;
        res.end(`DELETE operation not supported on /feedback`);
    });

module.exports = feedbackRouter;
