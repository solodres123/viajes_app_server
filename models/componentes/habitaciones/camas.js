const Cama= require("./cama");


const UsuarioOcupaCamas= require('./usuario_ocupa_camas')
const UsuarioOcupaCama= require('./usuario_ocupa_cama')
const usuario_ocupa_camas = new UsuarioOcupaCamas();
const { v4: uuidv4 } = require('uuid');

const mysql = require('mysql2');
// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Camas{

    constructor(){
        this.camas=[]; 
    }


    getCamas(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM camas WHERE habitaciones_id = ?', [id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const camas = await Promise.all(results.map(async result => {
                            const listaUsuarios = await usuario_ocupa_camas.getUsuarioOcupaCama(result.id);
                            return new Cama(result.id, result.tipo, listaUsuarios);
                        }));
                        resolve(camas);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    addCama(idHabitacion,tipo) {
        return new Promise((resolve, reject) => {
            const id = uuidv4();
            connection.query('INSERT INTO camas (tipo,habitaciones_id,id) VALUES (?,?,?)', [tipo,idHabitacion,id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    deleteCama(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM camas WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
  
}

module.exports = Camas;