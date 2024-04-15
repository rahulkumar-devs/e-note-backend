import  passport  from 'passport';
import express, { Request, Response } from "express";

import { createUser } from "../controllers/user.ctrl";


const userRouter = express.Router();



// Route for user registration
userRouter.route("/register").post(createUser);

// Route for user login



userRouter.get('/auth/google', passport.authenticate('google', { scope: ['profile',"email"] }));

userRouter.get('/auth/google/callback', 
  passport.authenticate('google', { failureRedirect: '/login' }),
  (req, res) => {
    // Successful authentication, redirect home.
    res.redirect('/');
  });

userRouter.post('/login', passport.authenticate('local', { failureRedirect: '/login', successRedirect: '/' }));




export default userRouter;
