const Componente = require("../../models/componentes/componente");
const Habitaciones = require("./habitaciones/habitaciones");
const Habitacion = require("../../models/componentes/habitaciones/habitacion");
const habitaciones = new Habitaciones();

const Confirmaciones = require("./confirmaciones/confirmaciones");
const Confirmacion = require("../../models/componentes/confirmaciones/confirmacion");
const confirmaciones = new Confirmaciones();

const Items_grupal = require("./items_grupal/items_grupal");
const Item_grupal = require("../../models/componentes/items_grupal/item_grupal");
const items_grupal = new Items_grupal();

const Eventos = require("./calendario/eventos");
const Evento = require("../../models/componentes/calendario/evento");
const eventos = new Eventos();

const Calendarios = require("./calendario/calendarios");
const Calendario = require("../../models/componentes/calendario/calendario");
const calendarios = new Calendarios();

const Items_compra = require("./compra/items_compra");
const Item_compra = require("../../models/componentes/compra/item_compra");
const items_compra = new Items_compra();





const Tareas = require("./tareas/tareas");
const Tarea = require("../../models/componentes/tareas/tarea");
const tareas = new Tareas();

const Deudas = require("./deudas/deudas");
const Deuda = require("../../models/componentes/deudas/deuda");
const deudas = new Deudas();

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
 
    getComponente(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        if (results.length == 1) {
                            const result = results[0];
                            let componente;
    
                            switch(result.tipo) {
                                case "habitaciones":
                                    const listaHabitaciones = await habitaciones.getHabitaciones(result.componentes_id);
                                    console.log(listaHabitaciones);
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaHabitaciones, result.indice,result.nombre);
                                    break;
                                case "confirmaciones":
                                    const listaConfirmaciones = await confirmaciones.getUsusarioConfirma(result.componentes_id);
                                    console.log(listaConfirmaciones);
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaConfirmaciones, result.indice,result.nombre);
                                    break;
                                case "deudas":
                                    const listaDeudas = await deudas.getDeudas(result.componentes_id);
                                    console.log(listaDeudas);
                                    let sumaDeudas = 0;
                                    for (let i = 0; i < listaDeudas.length; i++) {sumaDeudas = sumaDeudas + parseInt(listaDeudas[i].cantidad);}
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaDeudas, result.indice,result.nombre, sumaDeudas);
                                    break;
                                case "tareas":
                                    const listaTareas = await tareas.getTareas(result.componentes_id);
                                    console.log(listaTareas);
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaTareas, result.indice,result.nombre);
                                    break;
                                case "equipaje_grupal":
                                    const listaItems = await items_grupal.getItemsGrupal(result.componentes_id);
                                    let num = 0;
                                    for (let i = 0; i < listaItems.length; i++) {if (listaItems[i].actual >= listaItems[i].cantidad_total) {num++;}}
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaItems, result.indice,result.nombre, num, listaItems.length);
                                    break;
                                case "calendario":
                                    const listaEventos = await eventos.getEventos(result.componentes_id);
                                    const calendario = await calendarios.getCalendario(result.componentes_id);
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaEventos, result.indice,result.nombre, calendario.fechaDeInicio, calendario.fechaDeFinal);
                                    break;
                                case "compra":
                                    const listaItemsCompra = await items_compra.getItemsCompra(result.componentes_id);
                                    let numItemsCompra = 0;
                                    for (let i = 0; i < listaItemsCompra.length; i++) {if (listaItemsCompra[i].estado == "comprado") {numItemsCompra++;}}
                                    componente = new Componente(result.componentes_id, result.tipo, result.color, listaItemsCompra, result.indice,result.nombre, numItemsCompra, listaItemsCompra.length);
                                    break;

                                default:
                                    throw new Error(`Component type ${result.tipo} is not recognized`);
                            }
                            console.log(componente);
                            resolve(componente);
                        }
                    } catch (error) {
                        console.error('Error en get componente: ', error)
                        reject(error);
                    }
                }
            });
        });
    }

    getComponentes(idViaje) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE viaje_id = ? ORDER BY indice', [idViaje], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const componentesPromises = results.map(result => this.getComponente(result.componentes_id));
                        
                        Promise.all(componentesPromises)
                            .then(componentes => {
                                resolve(componentes);
                            })
                            .catch(error => {
                                console.error('Error en get componentes: ', error);
                                reject(error);
                            });
    
                    } catch (error) {
                        console.error('Error en get componentes: ', error)
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
}

module.exports=Componentes;