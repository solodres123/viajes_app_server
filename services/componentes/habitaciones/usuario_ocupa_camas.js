const UsuarioOcupaCama= require("../../../models/componentes/habitaciones/usuario_ocupa_cama");

const Usuarios= require('../../usuarios')
const Usuario= require('../../../models/usuario')
const usuarios = new Usuarios();



const mysql = require('mysql2');

// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class usuarioOcupaCamas{

    constructor(){
        this.usuario_ocupa_camas=[]; 
    }


    getUsuarioOcupaCama(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM cama_ocupada_por_usuario WHERE camas_id = ?', [id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const usuario_ocupa_camas = await Promise.all(results.map(async result => {
                            const usuario = await usuarios.getUsuarioLimitado(result.usuarios_correo);
                            return usuario;
                        }));
                        resolve(usuario_ocupa_camas);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    addUsuarioOcupaCama(idCama,correo) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO cama_ocupada_por_usuario (camas_id,usuarios_correo) VALUES (?,?)', [idCama,correo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    deleteUsuarioOcupaCama(idCama,correo) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM cama_ocupada_por_usuario WHERE camas_id = ? AND usuarios_correo = ?', [idCama,correo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
  
}

module.exports = usuarioOcupaCamas;