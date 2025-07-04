const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');

const connectDB = () => {
  return new Promise((resolve, reject) => {
    const db = new sqlite3.Database(dbPath, (err) => {
      if (err) {
        console.error('❌ Error al abrir la base de datos:', err);
        reject(err);
      } else {
        console.log('✅ Conectado a la base de datos SQLite correctamente');

        
        resolve(db); // Devuelve la instancia de la base de datos
      }
    });
  });
};

module.exports = { connectDB };