const dotenv = require("dotenv");
dotenv.config();
const express = require("express");
const app = express();
const mongoose = require("mongoose");
const authRoutes = require("./route/auth-route");
const profileRoutes = require("./route/profile-route");
require("./config/passport");
const session = require("express-session");
const passport = require("passport");
const flash = require("connect-flash");

// 連接 mongoDB
mongoose
    .connect("mongodb://127.0.0.1:27017/GoogleDB")
    .then(() => {
        console.log("成功連接mongoDB╰(*°▽°*)╯");
    })
    .catch((e) => {
        console.Consolelog("連線失敗" + e);
    });

////////////////////////////////////////////////////////
app.set("view engine", "ejs");
app.use(express.json());
app.use(express.urlencoded({ extended: true }));
app.use(
    session({
        secret: process.env.SESSION_SECRET,
        resave: false,
        saveUninitialized: false,
        cookie: { secure: false },
    })
);
app.use(passport.initialize());
app.use(passport.session());
app.use(flash());
app.use((req, res, next) => {
    res.locals.success_msg = req.flash("success_msg");
    res.locals.error_msg = req.flash("error_msg");
    res.locals.error = req.flash("error");
    next();
});

// 設定 routes
app.use("/auth", authRoutes);
app.use("/profile", profileRoutes);

////////////////////////////////////////////////////////
app.get("/", (req, res) => {
    res.render("index", { user: req.user });
});

////////////////////////////////////////////////////////
app.listen(8080, () => {
    console.log("伺服器正在port8080運行...ಠ_ಠ");
});
