const campground = require("../models/campground");
const Review = require("../models/reviews");
const { cloudinary } = require("../cloudinary");
const mbxGeocoding = require("@mapbox/mapbox-sdk/services/geocoding");
const mapBoxToken = process.env.MAPBOX_TOKEN;
const geocoder = mbxGeocoding({ accessToken: mapBoxToken });
module.exports.renderNew = (req, res) => {
  res.render("campgrounds/new");
};
module.exports.index = async (req, res, next) => {
  const camps = await campground.find({});
  res.render("campgrounds/index", { camps });
};
module.exports.createCamp = async (req, res, next) => {
    const geoData = await geocoder
      .forwardGeocode({
        query: req.body.campground.location,
        limit: 2,
      })
      .send();
  const camp = new campground(req.body.campground);
  camp.geometry = geoData.body.features[0].geometry;
  camp.image = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.author = req.user._id;
  await camp.save();
  console.log(camp);
  req.flash("success", "Successfully created Campground");
  res.redirect(`/campgrounds/${camp._id}`);
};
module.exports.showCamp = async (req, res, next) => {
  const camp = await campground
    .findById(req.params.id)
    .populate({
      path: "reviews",
      populate: {
        path: "author",
      },
    })
    .populate("author");
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/show", { camp });
};
module.exports.editCamp = async (req, res, next) => {
  const camp = await campground.findById(req.params.id);
  if (!camp) {
    req.flash("error", "Cannot find that campground!");
    return res.redirect("/campgrounds");
  }
  res.render("campgrounds/edit", { camp });
};
module.exports.deleteCamp = async (req, res, next) => {
  await campground.findByIdAndDelete(req.params.id);
  req.flash("success", "Successfully deleted Campground");
  res.redirect("/campgrounds");
};
module.exports.updateCamp = async (req, res, next) => {
  const camp = await campground.findByIdAndUpdate(req.params.id, {
    ...req.body.campground,
  });
  console.log(req.body, req.files);
  const img = req.files.map((f) => ({
    url: f.path,
    filename: f.filename,
  }));
  camp.image.push(...img);
  await camp.save();
  if (req.body.deleteImages) {
    for (let filename of req.body.deleteImages) {
      await cloudinary.uploader.destroy(filename);
    }
    await camp.updateOne({
      $pull: { image: { filename: { $in: req.body.deleteImages } } },
    });
  }
  req.flash("success", "Successfully updated details");
  res.redirect(`/campgrounds/${req.params.id}`);
};
