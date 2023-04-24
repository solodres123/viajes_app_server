const Componente = require("./componente");
const Habitaciones = require("./habitaciones/habitaciones");
const Habitacion = require("./habitaciones/habitacion");
const habitaciones = new Habitaciones();

const Confirmaciones = require("./confirmaciones/confirmaciones");
const Confirmacion = require("./confirmaciones/confirmacion");
const confirmaciones = new Confirmaciones();

const { v4: uuidv4 } = require('uuid');






const mysql = require('mysql2');  
// Establecer la configuración de la conexión
const connection = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});
//


class Componentes{

    constructor(){
        this.componentes=[];       
    }

    getComponentes(idViaje) {
  
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE viaje_id = ? ORDER BY indice', [idViaje], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const componentes2 = await Promise.all(results.map(async result => {
                            if (result.tipo == "habitaciones") {
                                const listaHabitaciones = await habitaciones.getHabitaciones(result.componentes_id);
                                return new Componente(result.componentes_id, result.tipo, result.color, listaHabitaciones, result.indice,result.nombre);
                            }else if (result.tipo == "confirmaciones") {
                                const listaConfirmaciones = await confirmaciones.getUsusarioConfirma(result.componentes_id);
                                return new Componente(result.componentes_id, result.tipo, result.color, listaConfirmaciones, result.indice,result.nombre);
                            }
                        }));
                        resolve(componentes2);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    deleteComponente(idComponente) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM componentes WHERE componentes_id = ?', [idComponente], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }


    getComponenteHabitaciones(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {  
                    try {
                if (results.length == 1){
                    const listaHabitaciones = await habitaciones.getHabitaciones(idComponente);
                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaHabitaciones,
                        results[0].indice,
                        results[0].nombre)
                        console.log(temp)
                        resolve(temp);
                    }
                    }catch (error) {
                    reject(error); // Devuelve 0 si el correo proporcionado no coincide
                  }
                }
            });
        });
    }

 addComponente(tipo, viaje_id, color, nombre) {
        return new Promise((resolve, reject) => {
            connection.query("SELECT MAX(indice) as maxIndice FROM componentes WHERE viaje_id = ?", [viaje_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    const newIndice = (results[0].maxIndice || 0) + 1;
                    const id = uuidv4();
                    
                    connection.query("INSERT INTO componentes (componentes_id, tipo, viaje_id, color, nombre, indice) VALUES (?, ?, ?, ?, ?, ?)",
                        [id, tipo, viaje_id, color, nombre, newIndice], (err, insertResult) => {
                            if (err) {
                                reject(err);
                            } else {
                                console.log('Componente añadido');
                                resolve(newIndice);
                            }
                        });
                }
            });
        });
    }
    getComponenteConfirmaciones(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {  
                    try {
                if (results.length == 1){
                    const listaConfirmaciones = await confirmaciones.getUsusarioConfirma(idComponente);
                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaConfirmaciones,
                        results[0].indice,
                        results[0].nombre)
                        console.log(temp)
                        resolve(temp);
                    }
                    }catch (error) {
                    reject(error);
                  }
                }
            });
        });
    }
    
}


module.exports=Componentes;