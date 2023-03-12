const passport = require("passport");
const GoogleStrategy = require("passport-google-oauth20");
const User = require("../models/user-model");
const LocalStrategy = require("passport-local");
const bcrypt = require("bcrypt");

passport.serializeUser((user, done) => {
    console.log("Serialize使用者。。。");
    // console.log(user);
    done(null, user._id); // 將 mongoDB 存的 id，存在 session 內部，並將 id 簽名後用 cookie 寄給使用者
});
passport.deserializeUser(async (_id, done) => {
    console.log("Deserialize使用者。。。使用serializeUser儲存的id，去資料庫找資料");
    let foundUser = await User.findOne({ _id });
    done(null, foundUser); // 將 req.user 這個屬性設定為 foundUser
});

passport.use(
    new GoogleStrategy(
        {
            clientID: process.env.GOOGLE_CLIENT_ID,
            clientSecret: process.env.GOOGLE_CLIENT_SECRET,
            callbackURL: "/auth/google/redirect",
        },
        async (accessToken, refreshToken, profile, done) => {
            // 這裡放成功登入後要做的事情
            console.log("進入Google Strategy的區域");
            // console.log(profile);
            console.log("==========================");
            let foundUser = await User.findOne({ googleID: profile.id }).exec();

            if (foundUser) {
                console.log("使用者已曾透過google登入過，無須重複儲存");
                done(null, foundUser); // 這邊會去執行 serializeUser()
            } else {
                console.log("查無使用者，須新增至資料庫");
                let newUser = new User({
                    name: profile.displayName,
                    googleID: profile.id,
                    thumbnail: profile.photos[0].value,
                    email: profile.emails[0].value,
                });
                let savedUser = await newUser.save();
                console.log("成功創建新用戶");
                done(null, savedUser); // 這邊會去執行 serializeUser()
            }
        }
    )
);

// 對應到表單 name 的屬性值
passport.use(
    new LocalStrategy(async (username, password, done) => {
        let foundUser = await User.findOne({ email: username });
        if (foundUser) {
            let result = await bcrypt.compare(password, foundUser.password);
            if (result) {
                done(null, foundUser);
            } else {
                done(null, false);
            }
        } else {
            done(null, false);
        }
    })
);
