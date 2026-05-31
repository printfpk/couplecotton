import { env } from './config/env.js';
import app from './app.js';
import connectDB from './config/db.js';

const PORT = env.PORT;

async function start() {
  await connectDB();
  app.listen(PORT, () => {
    console.log('🚀 Server running on http://localhost:' + PORT);
    console.log('   Environment: ' + env.NODE_ENV);
  });
}

start();

