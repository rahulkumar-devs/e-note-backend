import passport from "passport";
import { Strategy as GoogleStrategy } from "passport-google-oauth20";
import { config } from "./config";
import UserModel, { IUser } from "../models/user.model";

passport.use(
   new GoogleStrategy(
      {
         clientID: config.google_client_id,
         clientSecret: config.google_client_secret,
         callbackURL: "http://localhost:4000/auth/google/callback",
      },
      async (accessToken, refreshToken, profile, cb) => {
         try {
            const profileData = {
               name: profile.displayName,
               email: (profile.emails && profile.emails[0].value) || "",
               avatar: (profile.photos && profile.photos[0].value) || "",
            };

            let user = await UserModel.findOne({ email: profileData.email });
            if (!user) {
               user = await UserModel.create(profileData);
            }

            return cb(null, user); // Pass user object instead of profile
         } catch (error: any) {
            cb(error);
         }
      }
   )
);

passport.serializeUser(function (user, done) {
   done(null, user);
});

passport.deserializeUser(function (user: IUser, done) {
   done(null, user);
});
