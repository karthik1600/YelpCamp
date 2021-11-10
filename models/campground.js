const mongoose = require("mongoose");
const Schema = mongoose.Schema; //so when you do new mongoose.Schema you can just do Schema
const Review = require("./reviews");
const User = require("./user");
const ImageSchema = new Schema({
  url: String,
  filename: String,
});
// const opts = { toJSON: { virtuals: true } };
ImageSchema.virtual("thumbnail").get(function () {
  return this.url.replace("/upload", "/upload/w_200");
});
const CampgroundSchema = new Schema(
  {
    title: String,
    image: [ImageSchema],
    geometry: {
      type: {
        type: String,
        enum: ["Point"],
        required: true,
      },
      coordinates: {
        type: [Number],
        required: true,
      },
    },
    price: Number,
    description: String,
    location: String,
    author: {
      type: mongoose.Schema.Types.ObjectId,
      ref: "User",
    },
    reviews: [
      {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Review",
      },
    ],
  },
  { toJSON: { virtuals: true } }
);
CampgroundSchema.virtual("properties.popUp").get(function () {
  return`
      <strong><a href="/campgrounds/${this._id}">${this.title}</a><strong>
    <p>${this.description.substring(0, 20)}...</p>`
});

CampgroundSchema.post("findOneAndDelete", async function (doc) {
  if (doc) {
    await Review.deleteMany({
      _id: {
        $in: doc.reviews,
      },
    });
  }
});
module.exports = mongoose.model("campground", CampgroundSchema);
