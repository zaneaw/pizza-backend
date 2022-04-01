const mongoose = require("mongoose");
const Schema = mongoose.Schema;

var feedbackSchema = new Schema(
    {
        agree: {
            type: Boolean,
            default: "false",
        },
        contactType: {
            type: String,
            default: "Tel.",
        },
        email: {
            type: String,
            required: true,
        },
        firstname: {
            type: String,
            default: "",
        },
        lastname: {
            type: String,
            default: "",
        },
        message: {
            type: String,
            default: ""
        },
        telnum: {
            type: Number,
            default: ""
        }
    },
    {
        timestamps: true,
    }
);

let Feedbacks = mongoose.model("Feedback", feedbackSchema);

module.exports = Feedbacks;
