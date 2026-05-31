import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from './src/auth/models/user.model.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    console.log('Connected to DB');
    const user = await userModel.findOne({ username: 'prashanta' }) || await userModel.findOne();
    if (user) {
      console.log('Found user:', user.username, 'role:', user.role);
      user.role = 'admin';
      await user.save();
      console.log('Updated role to admin');
    } else {
      console.log('No user found');
    }
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
