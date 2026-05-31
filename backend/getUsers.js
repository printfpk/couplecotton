import mongoose from 'mongoose';
import dotenv from 'dotenv';
import userModel from './src/auth/models/user.model.js';

dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const users = await userModel.find({});
    users.forEach(u => {
      console.log(`Username: ${u.username}, Email: ${u.email}, Role: ${u.role}, Name: ${u.fullName?.firstName} ${u.fullName?.lastName}`);
    });
    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
