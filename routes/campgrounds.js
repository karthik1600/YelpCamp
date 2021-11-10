const express = require("express");
const router = express.Router();
const catchAsync = require("../utils/catchAsync");
const { isLoggedIn, validateCampground, isAuthor } = require("../middlewares");
const Campground = require('../controllers/campgrounds')
const multer = require("multer");
const {storage}=require('../cloudinary')
const upload = multer({ storage});
router
  .route("/")
  .get(catchAsync(Campground.index))
  .post(
    isLoggedIn,
    upload.array("image"),
    validateCampground,
    catchAsync(Campground.createCamp)
  );
router.get("/new", isLoggedIn, Campground.renderNew);
router
  .route("/:id")
  .get(catchAsync(Campground.showCamp))
  .delete(isLoggedIn, isAuthor, catchAsync(Campground.deleteCamp))
  .put(
    isLoggedIn,
    isAuthor,
    upload.array("image"),
    validateCampground,
    catchAsync(Campground.updateCamp)
  );
router.get("/:id/edit", isLoggedIn, isAuthor, catchAsync(Campground.editCamp));
module.exports = router;
