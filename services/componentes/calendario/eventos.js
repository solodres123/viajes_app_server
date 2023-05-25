const Evento= require("../../../models/componentes/calendario/evento");

const Usuarios= require('../../usuarios')
const Usuario= require('../../../models/usuario')
const usuarios = new Usuarios();

const { v4: uuidv4 } = require('uuid');

const mysql = require('mysql2');

// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Eventos{

    constructor(){
        this.eventos =[]; 
    } 

    getEventos(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM fechas WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {   
                        const eventos = await Promise.all(results.map(async result => {
                            const usuario = await usuarios.getUsuarioLimitado(result.usuarios_correo);
                            return new Evento(
                                result.inicio.toISOString().substring(0,10),
                                result.final.toISOString().substring(0,10),
                                usuario,
                                result.id,
                                result.prioridad
                                );
                        }));
                        resolve(eventos);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }


    addEvento(id_componente,correo,fecha_inicio,fecha_final,prioridad) {
        return new Promise((resolve, reject) => {
            const id=uuidv4();
            connection.query('INSERT INTO fechas (id,componentes_id,usuarios_correo,inicio,final,prioridad) VALUES (?,?,?,?,?,?)', [id,id_componente,correo,fecha_inicio,fecha_final,prioridad], (err, results) => {
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




    

    deleteEvento(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM fechas WHERE id = ?', [id], (err, results) => {
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

        

    updateEvento(id,inicio,fin,prioridad) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE fechas SET inicio = ?, fin = ?, prioridad = ? WHERE id = ?', [inicio,fin,prioridad,id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

}
module.exports = Eventos;
        
