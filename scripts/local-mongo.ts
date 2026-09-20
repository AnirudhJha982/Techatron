// @ts-nocheck
import { MongoMemoryServer } from 'mongodb-memory-server';
import fs from 'fs';
import path from 'path';

async function main() {
  console.log('Initializing in-memory MongoDB Server (downloading MongoDB binary if needed)...');
  
  let mongod: MongoMemoryServer;
  try {
    mongod = await MongoMemoryServer.create({
      instance: {
        port: 27017,
        dbName: 'kisan_portal',
      },
    });
  } catch (err) {
    console.log('Port 27017 unavailable or failed, creating on dynamic port...');
    mongod = await MongoMemoryServer.create({
      instance: {
        dbName: 'kisan_portal',
      },
    });
  }

  const uri = mongod.getUri() + 'kisan_portal';
  console.log(`[In-Memory MongoDB] Active at: ${uri}`);

  // Update .env.local
  const envPath = path.resolve(process.cwd(), '.env.local');
  let envContent = '';
  if (fs.existsSync(envPath)) {
    envContent = fs.readFileSync(envPath, 'utf-8');
  }

  if (envContent.includes('MONGODB_URI=')) {
    envContent = envContent.replace(/MONGODB_URI=.*/, `MONGODB_URI="${uri}"`);
  } else {
    envContent += `\nMONGODB_URI="${uri}"\n`;
  }
  fs.writeFileSync(envPath, envContent.trim() + '\n', 'utf-8');
  console.log(`[In-Memory MongoDB] Wrote MONGODB_URI to .env.local`);

  // Run seed script automatically
  try {
    console.log('[In-Memory MongoDB] Triggering initial database seed...');
    process.env.MONGODB_URI = uri;
    // Dynamic import to seed
    const { execSync } = await import('child_process');
    execSync('npx tsx scripts/seed-mongo.ts', {
      stdio: 'inherit',
      env: { ...process.env, MONGODB_URI: uri }
    });
    console.log('[In-Memory MongoDB] Seed completed successfully!');
  } catch (seedErr) {
    console.error('[In-Memory MongoDB] Seed warning:', seedErr);
  }

  console.log('[In-Memory MongoDB] Server is ready and serving requests.');

  // Keep alive
  setInterval(() => {}, 1000 * 60 * 60);

  const cleanUp = async () => {
    console.log('\nStopping in-memory MongoDB server...');
    await mongod.stop();
    process.exit(0);
  };

  process.on('SIGINT', cleanUp);
  process.on('SIGTERM', cleanUp);
}

main().catch((err) => {
  console.error('Fatal error starting in-memory MongoDB:', err);
  process.exit(1);
});
