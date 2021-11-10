const express = require("express");
const passport = require("passport");
const router = express.Router();
const User = require("../models/user");
const catchAsync = require("../utils/catchAsync");
const ExpressError = require("../utils/ExpressError");
const { route } = require("./campgrounds");
router.get("/register", (req, res) => {
  res.render("users/register");
});

router.post(
  "/register",
  catchAsync(async (req, res) => {
    const { username, email, password } = req.body;
    try {
      const user = new User({ email, username });
      const registeredUser = await User.register(user, password);
      req.login(registeredUser, err => {
        if (err) next(err);
              req.flash("success", "Welcome to Yelp Camp!");
              res.redirect("/campgrounds");
      })
    } catch (e) {
      req.flash("error", e.message);
      res.redirect("/register");
    }
  })
);
router.route("/login")
  .get((req, res) => {
  res.render("users/login");
})
  .post(

  passport.authenticate("local", {
    failureFlash: true,
    failureRedirect: "/login",
  }),
  (req, res) => {
    const redirectUrl = req.session.returnTo ||'/campgrounds';
    req.flash("success", "Welcome back");
    console.log(redirectUrl)
    delete req.session.returnTo;
    res.redirect(redirectUrl);
  }
);
router.get("/logout", (req, res) => {
  req.logout();
  req.flash('success', 'Good Bye');
  res.redirect("/campgrounds");
});
module.exports = router;
