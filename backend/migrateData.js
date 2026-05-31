import mongoose from 'mongoose';
import dotenv from 'dotenv';
dotenv.config();

const localURI = 'mongodb://127.0.0.1:27017/couplecotton';
const cloudURI = 'mongodb+srv://printfpk:PO7mL7g7aihMAWfz@cluster1.oker5wm.mongodb.net/couplecotton';

async function migrate() {
  try {
    console.log('Connecting to Local MongoDB...');
    const localDb = await mongoose.createConnection(localURI).asPromise();
    console.log('✅ Connected to Local MongoDB');

    console.log('Connecting to Cloud MongoDB Atlas...');
    const cloudDb = await mongoose.createConnection(cloudURI).asPromise();
    console.log('✅ Connected to Cloud MongoDB Atlas');

    const collections = await localDb.db.listCollections().toArray();
    
    for (const collectionInfo of collections) {
      const collectionName = collectionInfo.name;
      console.log(`\nMigrating collection: ${collectionName}...`);
      
      const localCollection = localDb.collection(collectionName);
      const cloudCollection = cloudDb.collection(collectionName);
      
      const docs = await localCollection.find({}).toArray();
      console.log(`Found ${docs.length} documents in local ${collectionName}`);
      
      if (docs.length > 0) {
        // Optional: clear cloud collection before inserting to prevent duplicate keys during testing
        // await cloudCollection.deleteMany({});
        
        try {
          await cloudCollection.insertMany(docs, { ordered: false });
          console.log(`✅ Successfully inserted ${docs.length} documents into cloud ${collectionName}`);
        } catch (err) {
          // ordered: false allows it to continue even if there are duplicate key errors
          console.log(`⚠️ Insert completed with some warnings (likely duplicates): ${err.message}`);
        }
      }
    }

    console.log('\n🎉 Migration completed successfully!');
    process.exit(0);
  } catch (err) {
    console.error('Migration failed:', err);
    process.exit(1);
  }
}

migrate();
