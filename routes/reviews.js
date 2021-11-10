const express = require("express");
const router = express.Router({ mergeParams: true });
const catchAsync = require("../utils/catchAsync");
const campground = require("../models/campground");
// const isLoggedIn = require("../middlewares");
const ExpressError = require("../utils/ExpressError");
const { reviewSchema } = require("../schemas");
const Review = require("../models/reviews");
// const isLoggedIn = require("../middlewares");
const reviews=require('../controllers/reviews')
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
const isReviewAuthor = async (req, res, next) => {
  const { id, reviewId } = req.params;
  const review = await Review.findById(reviewId);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have Permission");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You need to be logged in");
    return res.redirect("/login"); //return so that both redirect and render dont run
  }
  next(); //else
};
router.post(
  "/",
  isLoggedIn,
  validateReview,
  catchAsync(reviews.createReview)
);
router.delete("/:reviewId", isReviewAuthor, catchAsync(reviews.deleteReview));

module.exports = router;
