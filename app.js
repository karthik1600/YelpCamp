if (process.env.NODE_ENV !== "production") {
  require("dotenv").config()
}
console.log(process.env.CLOUD_NAME)
const express = require("express");
const mongoose = require("mongoose");
const path = require("path");
const ejsMate = require("ejs-mate");
const catchAsync = require("./utils/catchAsync");
const ExpressError = require("./utils/ExpressError");
const campgroundsroutes = require("./routes/campgrounds");
const reviewsroutes = require("./routes/reviews");
const methodOverride = require("method-override");
const Joi = require("joi");
const session = require("express-session");
const MongoStore = require("connect-mongo");
const flash = require("connect-flash");
const passport = require('passport')
const LocalStrategy = require('passport-local')
const User=require('./models/user')
const userroutes = require('./routes/user')
const mongoSanitize = require("express-mongo-sanitize");
// const helmet = require('helmet'); //
const dbUrl =   process.env.DB_URL;                   // "mongodb://localhost:27017/yelp_camp"
mongoose.connect(dbUrl, {
  useNewUrlParser: true,
  useCreateIndex: true,
  useUnifiedTopology: true,
  useFindAndModify: false,
});

const db = mongoose.connection;
db.on("error", console.error.bind(console, "connection error")); //everytime error occurs
db.once("open", () => {
  //only once when db connected
  console.log("connected");
});
//touchAfter: 24 * 3600 you are saying to the session be updated only one time in a period of 24 hours
const app = express();
app.use(mongoSanitize());
app.use(express.static("public"));
const store = MongoStore.create({
  mongoUrl: dbUrl,
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  touchAfter: 24 * 60 * 60,
});

store.on("error", function (e) {
  console.log(e);
}); 
const sessionConfig = {
  store,
  secret: process.env.SECRET || "thisshouldbeabettersecret!",
  resave: false,
  saveUninitialized: true,
  cookie: {
    httpOnly: true,
    //secure:true,
    expires: Date.now() + 1000 * 60 * 60 * 24 * 7,
    maxAge: 1000 * 60 * 60 * 24 * 7,
  },
};
app.use(session(sessionConfig));
app.use(flash());
// app.use(helmet());

// const scriptSrcUrls = [
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://api.mapbox.com/",
//   "https://kit.fontawesome.com/",
//   "https://cdnjs.cloudflare.com/",
//   "https://cdn.jsdelivr.net",
// ];
// const styleSrcUrls = [
//   "https://kit-free.fontawesome.com/",
//   "https://stackpath.bootstrapcdn.com/",
//   "https://api.mapbox.com/",
//   "https://api.tiles.mapbox.com/",
//   "https://fonts.googleapis.com/",
//   "https://use.fontawesome.com/",
// ];
// const connectSrcUrls = [
//   "https://api.mapbox.com/",
//   "https://a.tiles.mapbox.com/",
//   "https://b.tiles.mapbox.com/",
//   "https://events.mapbox.com/",
// ];
// const fontSrcUrls = [];
// app.use(
//   helmet.contentSecurityPolicy({
//     directives: {
//       defaultSrc: [],
//       connectSrc: ["'self'", ...connectSrcUrls],
//       scriptSrc: ["'unsafe-inline'", "'self'", ...scriptSrcUrls],
//       styleSrc: ["'self'", "'unsafe-inline'", ...styleSrcUrls],
//       workerSrc: ["'self'", "blob:"],
//       objectSrc: [],
//       imgSrc: [
//         "'self'",
//         "blob:",
//         "data:",
//         "https://res.cloudinary.com/de4tlcrzr/", //SHOULD MATCH YOUR CLOUDINARY ACCOUNT!
//         "https://images.unsplash.com/",
//       ],
//       fontSrc: ["'self'", ...fontSrcUrls],
//     },
//   })
// );

app.use(passport.initialize())
app.use(passport.session())
passport.use(new LocalStrategy(User.authenticate())); //stategy being used
passport.serializeUser(User.serializeUser());//how do you store data in session
passport.deserializeUser(User.deserializeUser()); //how to get out of session

app.use((req, res, next) => {
  res.locals.currentUser = req.user;
  res.locals.success = req.flash("success");
  res.locals.error = req.flash("error");
  next();
});
app.engine("ejs", ejsMate);
app.use(express.urlencoded({ extended: true }));
app.use(methodOverride("_method"));
app.set("view engine", "ejs");
app.set("views", path.join(__dirname, "views"));
app.use("/campgrounds", campgroundsroutes);
app.use("/campgrounds/:id/reviews", reviewsroutes);
app.use("/", userroutes);
app.get("/", (req, res) => {
  res.render("home");
});
app.get("/fakeuser", async (req, res) => {
  const user = new User({ email: "kkk@gmail.com", username: "karthik" });
  const newuser = await User.register(user, 'password');
  res.send(newuser);
})
app.use((err, req, res, next) => {
  const { status = 500 } = err;
  if (!err.message) err.message = "something went wrong";
  // flash('error',err.message)
  res.status(status).render("errors", { err });
});
app.all("*", (req, res, next) => {
  next(new ExpressError("Page Not Found", 404));
});

app.listen(3000, () => {
  console.log("Serving on port 3000");
});