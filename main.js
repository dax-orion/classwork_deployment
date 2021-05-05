"use strict";

const express = require("express"), app = express(),
    router = require("./routes/index"),
    layouts = require("express-ejs-layouts"),
    mongoose = require("mongoose"),
    methodOverride = require("method-override"),
    passport = require("passport"),
    cookieParser = require("cookie-parser"),
    expressSession = require("express-session"),
    expressValidator = require("express-validator"),
    connectFlash = require("connect-flash"),
    User = require("./models/user");

mongoose.connect(
    process.env.MONGODB_URI || "mongodb://localhost:27017/confetti_cuisine",
    {
        useNewUrlParser: true,
        useUnifiedTopology: true,
        useFindAndModify: false
    }
);

app.set("port", process.env.PORT || 3000);

app.set("view engine", "ejs");

app.use(
    express.urlencoded({
        extended: false
    })
);

app.use(layouts);
app.use(express.json());
app.use(express.static("public"));

app.use(methodOverride("_method", {methods: ["POST", "GET"]}));

app.use(cookieParser("my_passcode"));
app.use(expressValidator());
app.use(expressSession({
    secret: "my_passcode",
    cookie: {
        maxAge: 360000
    },
    resave: false,
    saveUninitialized: true
}));
app.use(connectFlash());

app.use(passport.initialize());
app.use(passport.session());
passport.use(User.createStrategy());
passport.serializeUser(User.serializeUser());
passport.deserializeUser(User.deserializeUser());

app.use((req, res, next) => {
    res.locals.flashMessages = req.flash();
    res.locals.loggedIn = req.isAuthenticated();
    res.locals.currentUser = req.user;
    next();
});

app.use("/", router);

app.listen(app.get("port"), () => {
    console.log(`Server is running on port: ${app.get("port")}`);
});