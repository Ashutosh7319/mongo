const express = require("express");
const app = express();
const bcrypt = require("bcrypt");
const initializePassport = require("./passport-config");
const flash = require("express-flash");
const session = require("express-session");
const passport = require('passport');
const mongoose = require('mongoose');
var url = "mongodb+srv://sahapriyanshu88:ezyCplrNUtcKPuiH@cluster0.4qyhzir.mongodb.net/CRN";
var SECRET = 'my_secret';
// Initialize Passport and configure authentication strategies
initializePassport(
    passport,
    async (email) => {
        // Retrieve user from MongoDB based on email
        return await User.findOne({ email });
    },
    async (id) => {
        // Retrieve user from MongoDB based on ID
        return await User.findById(id);
    }
);

// MongoDB connection
mongoose.connect(url, {
    useNewUrlParser: true,
    useUnifiedTopology: true
}).then(() => {
    console.log('MongoDB Connected');
}).catch(err => {
    console.error('MongoDB Connection Error:', err);
    process.exit(1); // Exit process with failure
});

// Define user schema
const userSchema = new mongoose.Schema({
    name: String,
    email: String,
    password: String
});

// Define User model
const User = mongoose.model('User', userSchema);

app.use(express.urlencoded({ extended: false }));
app.use(flash());
app.use(session({
    secret: SECRET,
    reserve: true,
    saveUninitialized: true,
    cookie:{secure: false}
})
)

app.use(passport.initialize());
app.use(passport.session());

// Configure login route
app.post("/login", passport.authenticate("local", {
    successRedirect: "/index",
    failureRedirect: "/login",
    failureFlash: true
}));

// Configure register route
app.post("/register", async (req, res) => {
    try {
        const hashedPassword = await bcrypt.hash(req.body.password, 10);
        // Save user to MongoDB
        await User.create({
            name: req.body.name,
            email: req.body.email,
            password: hashedPassword
        });
        res.redirect("/login");
    } catch (e) {
        console.log(e);
        res.redirect("/register");
    }
});

// Routes
app.get('/index', (req, res) => {
    res.render("index.ejs"), {name: req.User.name};
});

app.get('/login', (req, res) => {
    res.render("login.ejs");
});

app.get('/register', (req, res) => {
    res.render("register.ejs");
});
// End Routes

app.listen(3000);
