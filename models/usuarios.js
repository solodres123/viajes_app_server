const Usuario = require("./usuario");



const mysql = require('mysql2');
// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Usuarios {

  constructor() {
    this.usuarios = [];
  }


  validarUsuario(email, password) {
    return new Promise(async (resolve) => {
      try {
        connection.query(`SELECT * FROM usuarios WHERE correo = ?`, [email], (err, results) => {
          if (err) {
            reject(err);
          } else {
            if (results.length == 1) {
              if ((results[0].contraseña == password)) {
                resolve(1); // Devuelve 1 si las contraseñas coinciden
              } else {
                resolve(0); // Devuelve 0 si la contraseña proporcionada no coincide
              } 
            } else { 
              resolve(0); // Devuelve 0 si el correo proporcionado no coincide
            }
          }
        }
        )
      } catch (error) {
        console.error(`Error al verificar el correo y la contraseña en la base de datos: ${error.message}`);
        resolve(0); // Devuelve 0 en caso de cualquier error durante la verificación
      }
    });
  }
  enviarUsuario(email) {
    return new Promise(async (resolve) => {
      try {
        connection.query(`SELECT * FROM usuarios WHERE correo = ?`, [email], (err, results) => {
          if (err) {
            reject(err);
          } else {
            resolve(new Usuario(
              results[0].correo,
              " ",
              results[0].nombre,
              results[0].apellido_1,
              results[0].apellido_2,)); // Devuelve 1 si las contraseñas coinciden
          }
        }
        )
      } catch (error) {
        console.error(`Error al enviar datos de usario a la app: ${error.message}`); // Devuelve 0 en caso de cualquier error durante la verificación
      }
    });
  }

  getUsuarioLimitado(correo) {
    return new Promise((resolve, reject) => {
      connection.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
        if (err) {
          reject(err);
        } else {
          if (results.length == 1) {
            resolve(new Usuario(
              results[0].correo,
              " ",
              results[0].nombre,
              results[0].apellido_1,
              results[0].apellido_2,
              results[0].color_perfil,));
          } else { 
            reject(err); // Devuelve 0 si el correo proporcionado no coincide
          }
        }
      
      });
    });
}

}

module.exports = Usuarios;

