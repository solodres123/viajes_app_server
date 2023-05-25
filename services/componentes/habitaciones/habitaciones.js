const Habitacion = require("../../../models/componentes/habitaciones/habitacion");
const Camas = require("./camas");
const Cama = require("../../../models/componentes/habitaciones/cama");
const camas = new Camas();
const { v4: uuidv4 } = require('uuid');





const mysql = require('mysql2');
// Establecer la configuración de la conexión
const connection = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Habitaciones{

    constructor(){
        this.habitaciones=[

        ];
          
    }
    
    getHabitaciones(idComponente) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM habitaciones WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const habitaciones = await Promise.all(results.map(async result => {
                            const listaCamas = await camas.getCamas(result.id);
                            return new Habitacion(result.id, result.nombre, listaCamas);
                        }));
                        resolve(habitaciones);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    addHabitacion(idComponente,nombre) {
        return new Promise((resolve, reject) => {
            const id = uuidv4();
            connection.query('INSERT INTO habitaciones (nombre,componentes_id,id) VALUES (?,?,?)', [nombre,idComponente,id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    deleteHabitacion(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM habitaciones WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }
    
    





}














module.exports=Habitaciones;