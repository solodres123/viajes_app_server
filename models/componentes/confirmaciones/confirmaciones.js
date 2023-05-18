const Confirmacion= require("./confirmacion");

const Usuarios= require('../../usuarios')
const Usuario= require('../../usuario')
const usuarios = new Usuarios();



const mysql = require('mysql2');

// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Confirmaciones{


    

    constructor(){
        this.confirmaciones =[]; 
    }

    getUsusarioConfirma(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM confirmacion_usuario_viaje WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        
                        const confirmaciones = await Promise.all(results.map(async result => {
                            const usuario = await usuarios.getUsuarioLimitado(result.usuarios_correo);
                            return new Confirmacion( result.estado,usuario,result.componentes_id);
                        }));
                        resolve(confirmaciones);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }
//q: porque no se esta modificando el estado de la confirmacion?
//a: porque no se esta llamando a la funcion

    changeEstadoConfirmacion(componentes_id,usuarios_correo,estado){
        return new Promise((resolve, reject) => {
            connection.query('UPDATE confirmacion_usuario_viaje SET estado = ? WHERE componentes_id = ? AND usuarios_correo = ?', [estado,componentes_id,usuarios_correo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

  
}

module.exports = Confirmaciones;