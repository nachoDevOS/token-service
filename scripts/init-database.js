const { exec } = require('child_process');
const fs = require('fs');
const path = require('path');

console.log('Initializing database...');

// Leer el script SQL
const sqlScriptPath = path.join(__dirname, 'init-database.sql');
const sqlScript = fs.readFileSync(sqlScriptPath, 'utf8');

// Ejecutar el script SQL usando mysql CLI
exec(`mysql -u root -p < "${sqlScriptPath}"`, (error, stdout, stderr) => {
  if (error) {
    console.error('❌ Error executing SQL script:', error);
    console.log('💡 You may need to run: mysql -u root -p < scripts/init-database.sql');
    return;
  }
  console.log('✅ Database initialized successfully');
  console.log(stdout);
});