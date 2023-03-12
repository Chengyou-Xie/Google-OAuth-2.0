const router = require("express").Router();
const passport = require("passport");
const User = require("../models/user-model");
const bcrypt = require("bcrypt");
const saltRound = 12;

router.get("/login", (req, res) => {
    res.render("login", { user: req.user });
});
router.get("/logout", (req, res) => {
    req.logOut((err) => {
        if (err) {
            return res.send(err);
        }
        return res.redirect("/");
    });
});

router.get("/signup", (req, res) => {
    res.render("signup", { user: req.user });
});
router.post("/signup", async (req, res) => {
    let { name, email, password } = req.body;

    // 判斷密碼長度是否符合規範
    if (password.length < 8) {
        req.flash("error_msg", "密碼長度過短，至少需要8個應、數字");
        return res.redirect("/auth/signup");
    }

    // 判斷 email 是否重複註冊
    const foundEmail = await User.findOne({ email }).exec();
    if (foundEmail) {
        req.flash("error_msg", "信箱已被註冊，請使用其他信箱，或使用此信箱登入系統");
        return res.redirect("/auth/signup");
    }

    let hashedPassword = await bcrypt.hash(password, 12);
    let newUser = new User({ name, email, password: hashedPassword });
    await newUser.save();
    req.flash("success_msg", "註冊成功，可登入囉");
    res.redirect("/auth/login");
});
router.post(
    "/login",
    passport.authenticate("local", {
        failureRedirect: "/auth/login",
        failureFlash: "登入失敗，帳號或密碼不正確",
    }),
    (req, res) => {
        return res.redirect("/profile");
    }
);

///////////////////////////////////////////////////////////////
router.get(
    "/google",
    passport.authenticate("google", { scope: ["profile", "email"], prompt: "select_account" })
);

router.get("/google/redirect", passport.authenticate("google"), (req, res) => {
    console.log("進入redirect區域。。。");
    res.redirect("/profile");
});

module.exports = router;
