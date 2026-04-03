const fs = require('fs');
const path = require('path');
const pool = require('../config/database');

async function runMigrations() {
  const migrationsDir = path.join(__dirname);
  
  // Get all SQL migration files
  const files = fs.readdirSync(migrationsDir)
    .filter(f => f.endsWith('.sql'))
    .sort();
  
  for (const file of files) {
    const filePath = path.join(migrationsDir, file);
    const sql = fs.readFileSync(filePath, 'utf8');
    
    console.log(`Running migration: ${file}`);
    try {
      await pool.query(sql);
      console.log(`✓ ${file} completed`);
    } catch (err) {
      console.error(`✗ ${file} failed:`, err.message);
    }
  }
  
  console.log('\nAll migrations complete!');
  process.exit(0);
}

runMigrations().catch(err => {
  console.error('Migration error:', err);
  process.exit(1);
});
