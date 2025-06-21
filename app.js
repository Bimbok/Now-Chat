const express = require("express");
require('dotenv').config();
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
//Set up default mongoose connection
var mongoDB = process.env.MONGO_URI;
mongoose.connect(mongoDB, { useNewUrlParser: true });
//Get the default connection
var db = mongoose.connection;
//Bind connection to error event (to get notification of connection errors)
db.on('error', console.error.bind(console, 'MongoDB connection error:'));

const userSchema = new mongoose.Schema({
    email: {
        type: String,
        required: true,
        unique: true
    },
    password: {
        type: String,
        required: true
    }
});

const User = mongoose.model('User', userSchema);

app.set('view engine', 'ejs');
app.use(express.static("src"));
app.use(bodyParser.urlencoded({ extended: true }));

app.get("/login", (req, res) => {
    let flag = false;
    res.render("index", {
        entry: "Login",
        path: "/register",
        entry2: "Register",
        flag: flag,
        entry3: "Log In"
    });
})

app.get("/register", (req, res) => {
    let flag = true;
    res.render("index", {
        entry: "Register",
        path: "/login",
        entry2: "Login",
        flag: flag,
        entry3: "Register",
    });
});

app.post("/register", (req, res) => {
    const { email, password, confirmPassword } = req.body;

    if (password !== confirmPassword) {
        // Passwords don't match handle error
        return res.redirect("/register");
    }

    bcrypt.hash(password, saltRounds, (err, hash) => {
        if (err) {
            console.log(err);
            return res.redirect("/register");
        }

        const newUser = new User({
            email: email,
            password: hash
        });

        newUser.save()
            .then(() => {
                res.redirect("/login");
            })
            .catch(err => {
                console.log(err);
                // Handle error (e.g., user already exists)
                res.redirect("/register");
            });
    });
});

app.post("/login", (req, res) => {
    const { email, password } = req.body;

    User.findOne({ email: email })
        .then(foundUser => {
            if (foundUser) {
                bcrypt.compare(req.body.password, foundUser.password, (err, result) => {
                    if (result === true) {
                        res.send("<h1>Logged in successfully!</h1>");
                    } else {
                        res.redirect("/login");
                    }
                });
            } else {
                // User not found
                res.redirect("/login");
            }
        })
        .catch(err => {
            console.log(err);
            res.redirect("/login");
        });
});

const port = 3000;
app.listen(port, () => {
    console.log(`Server is on ${port}`);
})