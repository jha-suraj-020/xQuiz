var express = require('express');
var app = express();
var bodyParser = require('body-parser');
const mongoose = require("mongoose");
const admin = require("./models/admin");
const studentsAcc = require("./models/user");
const flash = require('connect-flash');
const session = require('express-session');
var current;
var n;
var correctAns = [];
var questions;
var allowed = false;
var noQuestions;
var quizTime;
var stud;
var scorebox;
var forupload;
var seedValue;

const DB =
    "mongodb+srv://dav:dav123@cluster0-0tjob.mongodb.net/DavKhunti";

mongoose
    .connect(DB, {
        useNewUrlParser: true,
        useCreateIndex: true,
        useFindAndModify: false,
        useUnifiedTopology: true,
    })
    .then(() => {
        console.log("database is connected!!");
    })
    .catch(err => {
        console.log(err);
    });

const dataSchema = new mongoose.Schema({
    qno: Number,
    question: String,
    op1: String,
    op2: String,
    op3: String,
    op4: String,
    correctAnswer: Number
})

const scoreschema = new mongoose.Schema({
    yourScore: Number,
    yourAns: String,
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "user"
    }
});

const dataschema = new mongoose.Schema({
    index: Number,
    noQuestions: Number,
    quizTime: Number,
    sub: String
});

const saveschema = new mongoose.Schema({
    index: Number,
    selection: Number
});

const seedschema = new mongoose.Schema({
    index: Number,
    seed: Number
});

var seed = mongoose.model("seed", seedschema);
// seed.create({
//     index: 1,
//     seed: 2
// })
seed.findOne({ index: 1 }, function (err, credentt) {
    if (err) {
        console.log(err);
    } else {
        if (credentt) {
            console.log(credentt);
            seedValue = credentt.seed;
        }
    }
})

var selecthi = mongoose.model("selection", saveschema);
// selecthi.create({
//     index: 1,
//     selection: 1
// })
selecthi.findOne({ index: 1 }, function (err, credentt) {
    if (err) {
        console.log(err);
    } else {
        if (credentt) {
            var tempo = String(credentt.selection);
            if (tempo == 1) {
                tempo = "";
            }
            stud = mongoose.model("quiz" + tempo, dataSchema);
            scorebox = mongoose.model("scorebox" + tempo, scoreschema);
            forupload = mongoose.model("forUpload" + tempo, dataschema);
        }
    }
})

var PORT = process.env.PORT || 3000;

// app.use(express.static(__dirname));
app.set("view engine", "ejs");
app.use(express.static("public"));
app.use(bodyParser.json());

app.use(session({
    key: "mine",
    secret: 'yeah i think i got it',
    resave: true,
    saveUninitialized: true
}));
app.use(flash());


// Authentication routes
var authroutes = require("./auth");
app.use(authroutes);

//middleWares
app.use(function (req, res, next) {
    res.locals.currUser = req.user;
    res.locals.message = req.flash('message');
    res.locals.success = req.flash('success');
    next();
});

const adminAuthentication = function (req, res, next) {
    if (req.session.mine) {
        return next();
    } else {
        res.redirect("/adminlog");
    }
}

const teacherAuthentication = function (req, res, next) {
    if (req.session.mine) {
        return next();
    } else {
        res.redirect("/adminlog");
    }
}

const checkStarted = function (req, res, next) {
    if (allowed) {
        return next();
    }
    else {
        req.flash("message", "admin has not started the Quiz!");
        res.redirect('/');
    }
}

const allowedAttempt = function (req, res, next) {
    if (req.session.allowedAttempt != seedValue) {
        return next();
    }
    else {
        req.flash("message", "You have crossed the maximum Allowed attempt");
        res.redirect('/');
    }
}

const checkAuthenticated = function (req, res, next) {
    if (req.isAuthenticated()) {
        res.set('Cache-Control', 'no-cache, private, no-store, must-revalidate, post-check=0, pre-check=0');
        return next();
    } else {
        req.flash("message", "please log in first!");
        res.redirect('/login');
    }
}


app.get('/', function (req, res) {
    res.render("landing.ejs");
});

app.post("/selectz", function (req, res) {
    var anotherOne = req.body.chooser;
    var editedselect = {
        selection: anotherOne
    }
    selecthi.findOneAndUpdate({ index: 1 }, editedselect, function (err, credential) {
        if (err) {
            console.log(err);
        } else {
            selecthi.findOne({ index: 1 }, function (err, credentt) {
                if (err) {
                    console.log(err);
                } else {
                    var tempoo = String(credentt.selection);
                    if (tempoo == 1) {
                        tempoo = "";
                    }
                    stud = mongoose.model("quiz" + tempoo, dataSchema);
                    scorebox = mongoose.model("scorebox" + tempoo, scoreschema);
                    forupload = mongoose.model("forUpload" + tempoo, dataschema);
                }
            })
            res.send(anotherOne);
        }
    })
})

app.post("/seed", function (req, res) {
    var seedval = req.body.chooseit;
    var editSeed = {
        seed: seedval
    }
    seed.findOneAndUpdate({ index: 1 }, editSeed, function (err, seedk) {
        if (err) {
            console.log(err);
        } else {
            seedValue = seedval;
            console.log(seedValue);
            res.send(seedval + "is selected..");
        }
    })
})

app.get("/info", function (req, res) {
    var seedzz, selectzz, subzz;
    seed.findOne({ index: 1 }, function (err, credentt) {
        if (err) {
            console.log(err);
        } else {
            seedzz = credentt.seed;
            selecthi.findOne({ index: 1 }, function (err, credentt2) {
                if (err) {
                    console.log(err);
                } else {
                    selectzz = credentt2.selection;
                    forupload.findOne({ index: 1 }, function (err, credentt3) {
                        if (err) {
                            console.log(err);
                        } else {
                            console.log(credentt3);
                            if (credentt3 != null) {
                                subzz = credentt3.sub;
                                res.send("seeed = " + seedzz + " AND port = " + selectzz + " AND Subject = " + subzz);
                            }
                            else {
                                res.send("seeed = " + seedzz + " AND port = " + selectzz + "  Yah: Question does not exist on this port, you can upload");
                            }
                        }
                    })
                }
            })
        }
    })
})

app.get('/home', checkAuthenticated, allowedAttempt, checkStarted, function (req, res) {
    req.session.givenAns = [];
    forupload.findOne({ index: 1 }, function (err, credential) {
        if (err) {
            console.log(err);
        } else {
            var gotdata1 = credential.quizTime;
            var gotdata2 = credential.noQuestions;
            var gotdata3 = credential.sub;
            res.render("home.ejs", {
                quizTime: gotdata1,
                noQuestions: gotdata2,
                subname: gotdata3
            });
        }
    })
});

app.get("/quiz", checkAuthenticated, allowedAttempt, function (req, res) {
    forupload.findOne({ index: 1 }, function (err, credential) {
        if (err) {
            console.log(err);
        } else {
            var gotsub = "";
            if (credential) {
                gotsub = credential.sub;
            }
            res.render("quiz.ejs", {
                subname: gotsub
            });
        }
    })
})

app.get("/adminlog", function (req, res) {
    res.render("adminlog");
})

app.post("/adminlog", function (req, res) {
    var usern = req.body.adminUsername;
    var passw = req.body.adminPassword;
    console.log(usern);
    admin.findOne({ username: usern, password: passw }, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data == '' || data == null) {
                req.flash('message', "Wrong Username or password..Please Try again..");
                res.redirect("/adminlog");
            }
            else {
                console.log(data);
                req.session.mine = 1;
                console.log("done");
                res.redirect("/postyourquestions");
            }
        }
    })
})

app.get("/adminlogout", adminAuthentication, function (req, res) {
    req.session.destroy();
    res.redirect('/');
})

app.get("/admin", adminAuthentication, function (req, res) {
    res.render("admin.ejs", { allow: allowed });
})

app.get("/postyourquestions", teacherAuthentication, function (req, res) {
    res.render("forteachers.ejs", { allow: allowed });
})

app.get("/admin/enable", adminAuthentication, function (req, res) {
    allowed = true;
    console.log(allowed);
    var enablelog = "Quiz is Enabled..";
    res.send({ enablelog: enablelog });
})

app.get("/admin/disable", adminAuthentication, function (req, res) {
    allowed = false;
    console.log(allowed);
    var disablelog = "Quiz is Disabled..";
    res.send({ disablelog: disablelog });
})

app.get("/admin/getQuestions", adminAuthentication, function (req, res) {
    stud.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.render("questions.ejs", {
                questions: data,
                n: data.length
            });
        }
    })
})

app.get("/admin/:id/edit", adminAuthentication, function (req, res) {
    stud.findById(req.params.id, function (err, found) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("editQuestions.ejs", { q: found });
        }
    })
})

app.post("/admin/:id", adminAuthentication, function (req, res) {
    var editedQues = {
        question: req.body.ques,
        op1: req.body.op1,
        op2: req.body.op2,
        op3: req.body.op3,
        op4: req.body.op4,
        correctAnswer: req.body.corrOp
    }
    stud.findByIdAndUpdate(req.params.id, editedQues, function (err, found) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            req.flash("success", "updated successfully!");
            res.redirect("/admin/getQuestions");
        }
    })
})

app.get("/admin/scoreboard", adminAuthentication, function (req, res) {
    scorebox.find({}).populate("user").exec(function (err, score) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            score.forEach(function (s) {
                if (s.user) {
                    console.log(s.user.name);
                } else {
                    console.log(s.yourScore);
                }
            })
            res.render("scoreboard.ejs", { scores: score });
        }
    })
})

app.get("/admin/user/:id", adminAuthentication, function (req, res) {
    studentsAcc.findByIdAndDelete(req.params.id, function (err, found) {
        if (err) {
            console.log(err);
        } else {
            res.redirect("/admin/user");
        }
    })
})

app.get("/admin/user", adminAuthentication, function (req, res) {
    studentsAcc.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            res.render("users.ejs", {
                users: data
            });
        }
    })
})

app.get("/admin/user/edit/:id", adminAuthentication, function (req, res) {
    studentsAcc.findById(req.params.id, function (err, found) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.render("editUser.ejs", { q: found });
        }
    })
})

app.post("/admin/user/edit/:id", adminAuthentication, function (req, res) {
    var editedQues = {
        name: req.body.userName,
        admissionNo: req.body.userAddmission,
        sec: req.body.userSec,
        feePaid: req.body.userFee
    }
    studentsAcc.findByIdAndUpdate(req.params.id, editedQues, function (err, found) {
        if (err) {
            console.log(err);
            res.redirect("back");
        } else {
            res.redirect("/admin/user");
        }
    })
})

app.get('/upload', adminAuthentication, function (req, res) {
    stud.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            if (data.length >= 1) {
                console.log(data.length);
                res.send("Questions already exists here");
            } else {
                stud.remove({}, function (error) {
                    console.log("Deleted all");
                });
                forupload.findOne({ index: 1 }, function (err, credential) {
                    if (err) {
                        console.log(err);
                    } else {
                        var gotdata2 = credential.noQuestions;
                        console.log(gotdata2);
                        res.render("upload.ejs", {
                            noQuestions: gotdata2
                        });
                    }
                })
            }
        }
    })
});

app.get('/forupload', adminAuthentication, function (req, res) {
    res.render("forupload.ejs");
});

app.post('/forupload', adminAuthentication, function (req, res) {
    forupload.remove({}, function (err) {
        if (err) {
            console.log(err);
        } else {
            console.log("Deleted credentials");
            noQuestions = req.body.noQues;
            quizTime = req.body.qTime;
            subjecty = req.body.subjectt;
            forupload.create({
                index: 1,
                noQuestions: noQuestions,
                quizTime: quizTime,
                sub: subjecty
            }, function (err, data) {
                if (err) {
                    console.log(err);
                } else {
                    res.send('Done Successfully...');
                }
            })
        }
    });
});

app.post('/upload', adminAuthentication, function (req, res) {
    stud.create({
        qno: req.body.currQ,
        question: req.body.q,
        op1: req.body.op1,
        op2: req.body.op2,
        op3: req.body.op3,
        op4: req.body.op4,
        correctAnswer: req.body.corrOp
    }, function (err, ques) {
        if (err) {
            console.log(err);
        } else {
            res.send('Uploaded Successfully..');
        }
    })
});

app.get('/score', checkAuthenticated, function (req, res) {
    req.session.str = '';
    req.session.score = 0;
    req.session.unattempt = 0;
    req.session.allowedAttempt = seedValue;
    for (var i = 0; i < correctAns.length; i++) {
        if (correctAns[i] === req.session.givenAns[i])
            req.session.score += 1;
        req.session.str += req.session.givenAns[i] + ',';
        if (!req.session.givenAns[i]) {
            req.session.unattempt += 1;
        }
    }
    console.log(correctAns);
    console.log(req.session.givenAns);
    console.log(req.session.score);
    var totall = correctAns.length;
    var wrongg = correctAns.length - req.session.score - req.session.unattempt;
    var temp1 = req.session.score;
    var temp2 = req.session.unattempt;
    scorebox.create({
        yourScore: temp1,
        yourAns: req.session.str,
        user: req.user._id
    }, function (err, ques) {
        if (err) {
            console.log(err);
        } else {
            console.log(ques);
        }
    });
    res.send({ score: temp1, unattempted: temp2, totall: totall, wrong: wrongg });
});

app.get('/question', checkAuthenticated, function (req, res) {
    stud.find({}, function (err, data) {
        if (err) {
            console.log(err);
        } else {
            correctAns = [];
            data.forEach(function (ans) {
                correctAns.push(ans.correctAnswer);
            })
            questions = data;
            n = data.length;
            console.log(correctAns);
            console.log(questions);
            console.log(n);
            res.send({ products: questions, totalQ: n });
        }
    })
});

app.post('/products', checkAuthenticated, function (req, res) {
    if (Number(req.body.answer)) {
        req.session.givenAns[req.body.currentQuestion] = Number(req.body.answer);
        console.log(req.session.givenAns);
        res.send('Saved');
    }
});

app.listen(PORT, function () {
    console.log('Server listening on ' + PORT);
});

