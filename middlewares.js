const { campgroundSchema,reviewSchema } = require("./schemas");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const Review = require("./models/reviews");
const campground = require("./models/campground");
const isLoggedIn = (req, res, next) => {
  if (!req.isAuthenticated()) {
    req.session.returnTo = req.originalUrl;
    req.flash("error", "You need to be logged in");
    return res.redirect("/login"); //return so that both redirect and render dont run
  }
  next(); //else
};
const validateCampground = (req, res, next) => {
  const { error } = campgroundSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
const isAuthor = async (req, res, next) => {
  const { id } = req.params;
  const camp = await campground.findById(id);
  if (!camp.author.equals(req.user._id)) {
    req.flash("error", "You do not have Permission");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
const isReviewAuthor = async (req, res, next) => {
  const { id,reviewId } = req.params;
  const review = await Review.findById(id);
  if (!review.author.equals(req.user._id)) {
    req.flash("error", "You do not have Permission");
    return res.redirect(`/campgrounds/${id}`);
  }
  next();
};
const validateReview = (req, res, next) => {
  const { error } = reviewSchema.validate(req.body);
  if (error) {
    const msg = error.details.map((el) => el.message).join(",");
    throw new ExpressError(msg, 400);
  } else {
    next();
  }
};
module.exports = {
    isLoggedIn,
    validateCampground,
    validateReview,
    isAuthor,
    isReviewAuthor
}