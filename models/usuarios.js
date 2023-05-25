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

  usuarioEsNuevo(email) {
    return new Promise(async (resolve) => {
      try {
        connection.query(`SELECT * FROM usuarios WHERE correo = ?`, [email], (err, results) => {
          if (err) {
            reject(err);
          } else {
            if (results.length == 0) {
              resolve(1); // Devuelve 0 si el correo proporcionado ya existe
            } else {
              resolve(0); // Devuelve 1 si el correo proporcionado no existe
            }
          }
        }
        )
      } catch (error) {
        console.error(`Error al verificar el correo en la base de datos: ${error.message}`);
        resolve(0); // Devuelve 0 en caso de cualquier error durante la verificación
      }
    });
  }



  addUsuario(email, password, nombre, apellido1,apellido2,color) {
    return new Promise((resolve, reject) => {
      connection.query('INSERT INTO usuarios (correo,contraseña,nombre,apellido_1,apellido_2,color_perfil) VALUES (?,?,?,?,?,?)',
       [email, password, nombre, apellido1,apellido2,color], (err, results) => {
        if (err) {
          reject(err);
        } else {
          try {
            resolve();
          } catch (error) {
            reject(error);
          }
        }
      });

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

 getEncargados(tarea_id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM usuarios_encargados_tareas WHERE tareas_id = ?', [tarea_id], async (err, results2) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const encargados = await Promise.all(results2.map(async result2 => {
                        const usuario = await this.getUsuarioLimitado(result2.usuarios_correo);
                        return usuario;
                    }));
                    resolve(encargados);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}



                  

  getUsuariosViaje(viaje_id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM usuarios_viajes WHERE viaje_id = ?', [viaje_id], async (err, results2) => {
            if (err) {
                reject(err);
            } else {
                try {
                    const usuarios = await Promise.all(results2.map(async result2 => {
                        const usuario = await this.getUsuarioLimitado(result2.usuarios_correo);
                        return usuario;
                    }));
                    resolve(usuarios);
                } catch (error) {
                    reject(error);
                }
            }
        });
    });
}

addUsuarioViaje(correo,viaje_id) {
    return new Promise((resolve, reject) => {
        connection.query('INSERT INTO usuarios_viajes (viaje_id,usuarios_correo) VALUES (?,?)', [viaje_id,correo], (err, results) => {
            if (err) {
                reject(err);
            } else {  
                try {
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });

    });
}

deleteUsuarioViaje(correo,viaje_id) {
    return new Promise((resolve, reject) => {
        connection.query('DELETE FROM usuarios_viajes WHERE viaje_id = ? AND usuarios_correo = ?', [viaje_id,correo], (err, results) => {
            if (err) {
                reject(err);
            } else {
                try {
                    resolve();
                } catch (error) {
                    reject(error);
                }
            }
        });

    });
}




  getDeudores(deuda_id) {
    return new Promise((resolve, reject) => {
        connection.query('SELECT * FROM usuarios_has_deudas WHERE deudas_id = ?', [deuda_id], async (err, results2) => {
            if (err) {
                reject(err);
            } else {  
                try {
                    const deudores = await Promise.all(results2.map(async result2 => {
                        const usuario = await this.getUsuarioLimitado(result2.usuarios_correo);
                        return usuario;
                    }));  
                    resolve(deudores);
                } catch (error) {
                    reject(error);
                }
            }
        });
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

  

}

module.exports = Usuarios;

