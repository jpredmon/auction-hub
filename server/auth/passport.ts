import passport from 'passport';
import { Strategy as LocalStrategy } from 'passport-local';
import bcrypt from 'bcrypt';
import User from '../models/User.js';

passport.use(
  new LocalStrategy(async (username, password, done) => {
    try {
      const user = await User.findOne({ where: { username } });
      if (!user) return done(null, false, { message: 'Incorrect username.' });

      const isValid = await bcrypt.compare(password, user.password);
      if (!isValid) return done(null, false, { message: 'Incorrect password.' });

      return done(null, user);
    } catch (err) {
      return done(err);
    }
  })
);

passport.serializeUser((user: any, done) => { 
  //console.log('serializeUser called');
  //console.log('User to serialize:', user); // Log the user being serialized
  done(null, user.id);  // Storing only the user ID in the session
});


passport.deserializeUser(async (id: string | number, done) => { 
  //console.log('deserializeUser called');
  //console.log('ID to deserialize:', id); // Log the ID being deserialized
  try {
    // Retrieve user by ID and ensure you return only the raw data
    const user = await User.findByPk(id);
    if (user) {
      //console.log('User found during deserialization:', user.dataValues); // Log the user data found
      // Only pass user data values to the session (no extra metadata)
      done(null, user.dataValues); 
    } else {
      console.log('No user found during deserialization'); // Log if no user is found
      done(null, null);  // If no user is found, pass null
    }
  } catch (err) {
    console.error('Error during deserialization:', err); // Log any error encountered
    done(err, null);  // If error occurs, pass the error to done
  }
});

export default passport;
