const router = require("express").Router();
const Post = require("../models/post-model");

const authCheck = (req, res, next) => {
    // 確保在未登入，且未驗證的情況下，使用者不會進到 /profile 的 route
    if (req.isAuthenticated()) {
        next();
    } else {
        res.redirect("/auth/login");
    }
};

router.get("/", authCheck, async (req, res) => {
    // console.log("進入/profile。。。");
    let postFound = await Post.find({ author: req.user._id });
    res.render("profile", { user: req.user, posts: postFound }); // deserializeUser()
});

router.get("/post", authCheck, (req, res) => {
    res.render("post", { user: req.user });
});
router.post("/post", authCheck, async (req, res) => {
    let { title, content } = req.body;
    let newPost = new Post({ title, content, author: req.user._id });
    try {
        await newPost.save();
        return res.redirect("/profile");
    } catch (e) {
        req.flash("error_msg", "標題與內容都需要填寫");
        return res.redirect("/profile/post");
    }
});

module.exports = router;
