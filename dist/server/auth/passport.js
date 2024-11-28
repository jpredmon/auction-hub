import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User.js';
passport.use(new LocalStrategy(async (username, password, done) => {
    try {
        const user = await User.findOne({ where: { username } });
        if (!user)
            return done(null, false, { message: 'Incorrect username.' });
        const isValid = await bcrypt.compare(password, user.password);
        if (!isValid)
            return done(null, false, { message: 'Incorrect password.' });
        return done(null, user);
    }
    catch (err) {
        return done(err);
    }
}));
passport.serializeUser((user, done) => {
    done(null, user.id); // Storing only the user ID in the session
});
passport.deserializeUser(async (id, done) => {
    try {
        // Retrieve user by ID and ensure you return only the raw data
        const user = await User.findByPk(id);
        if (user) {
            // Only pass user data values to the session (no extra metadata)
            done(null, user.dataValues);
        }
        else {
            done(null, null); // If no user is found, pass null
        }
    }
    catch (err) {
        done(err, null); // If error occurs, pass the error to done
    }
});
// passport.serializeUser((user: any, done) => {
//   done(null, user.id);
// });
// passport.deserializeUser(async (id: string | number, done) => {
//   try {
//     const user = await User.findByPk(id); // Ensure `id` is the correct type
//     done(null, user);
//   } catch (err) {
//     done(err, null);
//   }
// });
export default passport;
