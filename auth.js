const express = require("express"),
    router = express.Router(),
    user = require("./models/user"),
    admin = require("./models/admin"),
    bodyparser = require("body-parser"),
    bcrypt = require("bcryptjs"),
    passport = require('passport'),
    session = require('express-session'),
    cookieParser = require('cookie-parser'),
    flash = require('connect-flash');

router.use(bodyparser.urlencoded({ extended: true }));

// using cookie-parser and session 
router.use(cookieParser('thats my secret'));
router.use(session({                   //session middleware
    secret: 'thats my secret',
    maxAge: 3600000,
    resave: false,
    saveUninitialized: false,
}));

// using passport for authentications 
router.use(passport.initialize());
router.use(passport.session());
router.use(flash());

// MIDDLEWARES
// Global variable
router.use(function (req, res, next) {
    res.locals.success_message = req.flash('success_message');
    res.locals.error_message = req.flash('error_message');
    res.locals.error = req.flash('error');
    next();
});


router.get("/register", function (req, res) {
    res.render("register");
})

router.post('/register', (req, res) => {
    var { name, admissionNo, classs, mobileNo, sec, feePaid, username, password, confirmpassword } = req.body;
    var err;
    if (!name || !admissionNo || !classs || !mobileNo || !feePaid || !sec || !username || !password || !confirmpassword) {
        err = "Please Fill All The Fields...";
        res.render('register', { 'err': err });
    }
    if (password != confirmpassword) {
        err = "Passwords Don't Match";
        res.render('register', { 'err': err, 'name': name, 'username': username, 'admissionNo': admissionNo, 'classs': classs });
    }
    if (typeof err == 'undefined') {
        user.findOne({ admissionNo: admissionNo }, function (err, data) {
            if (err) throw err;
            if (data) {
                console.log("User Exists");
                err = "User Already Exists With This Admission No...";
                res.render('register', { 'err': err });
            } else {
                bcrypt.genSalt(10, (err, salt) => {
                    if (err) throw err;
                    bcrypt.hash(password, salt, (err, hash) => {
                        if (err) throw err;
                        password = hash;
                        user({
                            name,
                            admissionNo,
                            classs,
                            mobileNo,
                            sec,
                            feePaid,
                            username,
                            password,
                        }).save((err, data) => {
                            if (err) {
                                err = "Username alreaady exists";
                                res.render('register', { 'err': err });
                            };
                            req.flash('success_message', "Registered Successfully.. Login To Continue..");
                            res.redirect('/login');
                        });
                    });
                });
            }
        });
    }
});

//authenticatin strategy
// ---------------
var localStrategy = require('passport-local').Strategy;
passport.use(new localStrategy({ usernameField: 'admissionNo' }, (admissionNo, password, done) => {
    user.findOne({ admissionNo: admissionNo }, (err, data) => {
        if (err) throw err;
        if (!data) {
            return done(null, false, { message: "User Doesn't Exists.." });
        }
        bcrypt.compare(password, data.password, (err, match) => {
            if (err) {
                return done(null, false);
            }
            if (!match) {
                return done(null, false, { message: "Password doesn't match" });
            }
            if (match) {
                return done(null, data);
            }
        });
    });
}));

passport.serializeUser(function (user, cb) {  // putting user data to sessions
    cb(null, user.id);
});

passport.deserializeUser(function (id, cb) {  //getting user data
    user.findById(id, function (err, user) {
        cb(err, user);
    });
});
// ---------------
// end of autentication statregy

router.get("/login", function (req, res) {
    res.render("login", { message: req.flash('message'), success: req.flash('success') });
})

router.post('/login', (req, res, next) => {
    req.session.givenAns = [];
    req.flash("success", "successfully logged in!!");
    passport.authenticate('local', {
        failureRedirect: '/login',
        successRedirect: '/quiz',
        failureFlash: true,
    })(req, res, next);
});

router.get('/logout', (req, res) => {
    req.logout();
    req.flash("success", "successfully logged out.");
    res.redirect('/');
});

module.exports = router;