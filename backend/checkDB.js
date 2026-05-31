import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

mongoose.connect(process.env.MONGODB_URI)
  .then(async () => {
    const db = mongoose.connection.db;
    const collections = await db.listCollections().toArray();
    console.log('Collections:', collections.map(c => c.name));
    
    const count = await db.collection('products').countDocuments();
    console.log('Products count:', count);
    
    const products = await db.collection('products').find({}).toArray();
    console.log('Products sample:', products.map(p => p.title));

    process.exit(0);
  })
  .catch(err => {
    console.error(err);
    process.exit(1);
  });
