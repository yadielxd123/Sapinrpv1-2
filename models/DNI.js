const sqlite3 = require('sqlite3').verbose();
const path = require('path');

const dbPath = path.join(__dirname, '../database.sqlite');
const db = new sqlite3.Database(dbPath);

class DNI {
  static generateNumeroDocumento() {
    return Math.floor(100000000 + Math.random() * 900000000).toString();
  }

  static crear(datos) {
    const numeroDocumento = this.generateNumeroDocumento();
    return new Promise((resolve, reject) => {
      const sql = `
        INSERT INTO dnis (
          userId, numeroDocumento, nombres, apellidos, fechaNacimiento,
          sexo, estadoCivil, lugarNacimiento, grupoSanguineo, estatura
        ) VALUES (?, ?, ?, ?, ?, ?, ?, ?, ?, ?)
      `;
      
      db.run(sql, [
        datos.userId,
        numeroDocumento,
        datos.nombres,
        datos.apellidos,
        datos.fechaNacimiento,
        datos.sexo,
        datos.estadoCivil || 'Soltero',
        datos.lugarNacimiento,
        datos.grupoSanguineo,
        datos.estatura
      ], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve({
            id: this.lastID,
            numeroDocumento,
            ...datos
          });
        }
      });
    });
  }

  static buscarPorUserId(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM dnis WHERE userId = ? AND activo = 1';
      
      db.get(sql, [userId], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static buscarPorNumero(numeroDocumento) {
    return new Promise((resolve, reject) => {
      const sql = 'SELECT * FROM dnis WHERE numeroDocumento = ? AND activo = 1';
      
      db.get(sql, [numeroDocumento], (err, row) => {
        if (err) {
          reject(err);
        } else {
          resolve(row);
        }
      });
    });
  }

  static eliminar(userId) {
    return new Promise((resolve, reject) => {
      const sql = 'UPDATE dnis SET activo = 0 WHERE userId = ?';
      
      db.run(sql, [userId], function(err) {
        if (err) {
          reject(err);
        } else {
          resolve(this.changes > 0);
        }
      });
    });
  }
}

module.exports = DNI;