import passport from "passport";
import { Strategy as GoogleStrategy, Profile } from "passport-google-oauth20";
import { config } from "./config";
// import { User, UserType } from './models';

passport.use(
   new GoogleStrategy(
      {
         clientID: config.google_client_id,
         clientSecret: config.google_client_secret,
         callbackURL: "http://localhost:4000/auth/google/callback",
   
      },
      async (
         accessToken: string,
         refreshToken: string,
         profile: Profile,
         cb: (err: any, user?: any) => void
      ) => {
         return cb(null, profile);
      }
   )
);

passport.serializeUser((user: any, done) => {
   done(null, user);
});
passport.deserializeUser((user: any, done) => {
   done(null, user);
});
