const express = require("express");
require('dotenv').config();
const app = express();
const ejs = require("ejs");
const bodyParser = require("body-parser");
const mongoose = require('mongoose');
const bcrypt = require('bcrypt');
const saltRounds = 10;
const session = require('express-session');
const cookieParser = require('cookie-parser');
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
app.use(cookieParser());
app.use(session({
    secret: process.env.SESSION_SECRET || 'a_default_secret_key', // It's better to use an environment variable for the secret
    resave: false,
    saveUninitialized: true,
    cookie: { secure: false } // Set to true if you are using https
}));

// Middleware to check if user is authenticated
const isAuthenticated = (req, res, next) => {
    if (req.session.user) {
        next();
    } else {
        res.redirect('/login');
    }
};

app.get("/", (req, res) => {
    if (req.session.user) {
        res.redirect("/chat");
    } else {
        res.redirect("/login");
    }
});

app.get("/login", (req, res) => {
    if (req.session.user) {
        return res.redirect('/chat');
    }
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
    if (req.session.user) {
        return res.redirect('/chat');
    }
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
                        req.session.user = { email: foundUser.email }; // Set session
                        if (req.body.remember) {
                            // Set a persistent cookie
                            req.session.cookie.maxAge = 30 * 24 * 60 * 60 * 1000; // 30 days
                        }
                        res.redirect("/chat");
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

app.get("/chat", isAuthenticated, (req, res) => {
    res.render("nowChat", { email: req.session.user.email });
});

app.get("/logout", (req, res) => {
    req.session.destroy(err => {
        if (err) {
            return res.redirect('/chat');
        }
        res.clearCookie('connect.sid'); // The default session cookie name
        res.redirect('/login');
    });
});

const port = 3000;
const server = null;
const PORT = process.env.PORT || 3000;
if (!process.env.VERCEL) {
    // Only listen when not on Vercel
    server = app.listen(PORT, "0.0.0.0", () => {
        console.log(`Server is Running at ${PORT}`);
    });
}

const io = require("socket.io")(server);

let socketsConected = new Set();

io.on("connection", onConnected);

function onConnected(socket) {
    console.log("Socket connected", socket.id);
    socketsConected.add(socket.id);
    io.emit("clients-total", socketsConected.size);

    socket.on("disconnect", () => {
        console.log("Socket disconnected", socket.id);
        socketsConected.delete(socket.id);
        io.emit("clients-total", socketsConected.size);
    });

    socket.on("message", (data) => {
        // console.log(data)
        socket.broadcast.emit("chat-message", data);
    });

    socket.on("feedback", (data) => {
        socket.broadcast.emit("feedback", data);
    });
}