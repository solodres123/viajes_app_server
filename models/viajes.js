const Viaje = require("./viaje");
const { v4: uuidv4 } = require('uuid');
 fechaInicio = new Date();
 fechaFin = new Date();
const mysql = require('mysql2');
// Establecer la configuración de la conexión
const connection = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Viajes{
 
    constructor(){
        this.viajes=[];  
    }

    getViajes(correo) {
        return new Promise((resolve, reject) => {
            //una query que me devuelva todas las rows de la tabla para las que su id aparece en la tabla usuarios_viajes para el usuario con el correo que le paso
            connection.query('SELECT * FROM viajes WHERE id IN (SELECT viaje_id FROM usuarios_viajes WHERE usuarios_correo = ?)', [correo], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    this.viajes = [];
                    results.forEach(results => {
                        console.log(results.fechaInicio);
                        console.log(results.fechaFin);
                        fechaInicio = results.fechaInicio.toISOString().substring(0,10);
                        fechaFin = results.fechaFin.toISOString().substring(0,10);
                        this.viajes.push(new Viaje(results.id, results.nombre, results.descripcion,fechaInicio,fechaFin, results.estado, results.urlImagen));
                    });
                    resolve(this.viajes);
                }
            });
        });
    }   
    addViaje(nombre, fechaInicio, fechaFin, urlImagen) {
        return new Promise((resolve, reject) => {
            const id=uuidv4();
            connection.query('INSERT INTO viajes (id,nombre,descripcion,fechaInicio,fechaFin,estado,urlImagen) VALUES (?,?,?,?,?,?,?)', [id,nombre,"",fechaInicio,fechaFin,"Planificando",urlImagen], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(
                            id
                        );
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    deleteViaje(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM viajes WHERE id = ?', [id], (err, results) => {
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
    



    updateViaje(id, nombre, fechaInicio, fechaFin, estado, urlImagen) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE viajes SET nombre = ?, fechaInicio = ?, fechaFin = ?, estado = ?, urlImagen = ? WHERE id = ?', [nombre, fechaInicio, fechaFin, estado, urlImagen, id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        resolve(
                            new Viaje(id, nombre, "", fechaInicio, fechaFin, estado, urlImagen)
                        );
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }
}

module.exports=Viajes;