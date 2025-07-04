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

        // Crear la tabla DNI si no existe
        db.run(`
          CREATE TABLE IF NOT EXISTS dnis (
            id INTEGER PRIMARY KEY AUTOINCREMENT,
            userId TEXT UNIQUE NOT NULL,
            numeroDocumento TEXT UNIQUE NOT NULL,
            nombres TEXT NOT NULL,
            apellidos TEXT NOT NULL,
            fechaNacimiento TEXT NOT NULL,
            sexo TEXT NOT NULL CHECK(sexo IN ('M', 'F')),
            estadoCivil TEXT DEFAULT 'Soltero',
            lugarNacimiento TEXT NOT NULL,
            grupoSanguineo TEXT NOT NULL CHECK(grupoSanguineo IN ('A+', 'A-', 'B+', 'B-', 'AB+', 'AB-', 'O+', 'O-')),
            estatura INTEGER NOT NULL,
            activo BOOLEAN DEFAULT 1,
            createdAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
            updatedAt TIMESTAMP DEFAULT CURRENT_TIMESTAMP
          );
        `);
        resolve(db); // Devuelve la instancia de la base de datos
      }
    });
  });
};

module.exports = { connectDB };