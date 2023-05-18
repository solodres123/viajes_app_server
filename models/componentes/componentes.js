const Componente = require("./componente");
const Habitaciones = require("./habitaciones/habitaciones");
const Habitacion = require("./habitaciones/habitacion");
const habitaciones = new Habitaciones();

const Confirmaciones = require("./confirmaciones/confirmaciones");
const Confirmacion = require("./confirmaciones/confirmacion");
const confirmaciones = new Confirmaciones();

const Items_grupal = require("./items_grupal/items_grupal");
const Item_grupal = require("./items_grupal/item_grupal");
const items_grupal = new Items_grupal();

const Eventos = require("./calendario/eventos");
const Evento = require("./calendario/evento");
const eventos = new Eventos();

const Calendarios = require("./calendario/calendarios");
const Calendario = require("./calendario/calendario");
const calendarios = new Calendarios();

const Items_compra = require("./compra/items_compra");
const Item_compra = require("./compra/item_compra");
const items_compra = new Items_compra();





const Tareas = require("./tareas/tareas");
const Tarea = require("./tareas/tarea");
const tareas = new Tareas();

const Deudas = require("./deudas/deudas");
const Deuda = require("./deudas/deuda");
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

    getComponentes(idViaje) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE viaje_id = ? ORDER BY indice', [idViaje], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const componentes = await Promise.all(results.map(async result => {
                            if (result.tipo == "habitaciones") {
                                const listaHabitaciones = await habitaciones.getHabitaciones(result.componentes_id);
                                console.log(listaHabitaciones)
                                return new Componente(result.componentes_id, result.tipo, result.color, listaHabitaciones, result.indice,result.nombre);
                            }else if (result.tipo == "confirmaciones") {
                                const listaConfirmaciones = await confirmaciones.getUsusarioConfirma(result.componentes_id);
                                console.log(listaConfirmaciones)
                                return new Componente(result.componentes_id, result.tipo, result.color, listaConfirmaciones, result.indice,result.nombre);
                            } else if (result.tipo == "deudas") {
                                const listaDeudas = await deudas.getDeudas(result.componentes_id);
                                console.log(listaDeudas)
                                //suma de todas las deudas
                                let sumaDeudas = 0;
                                for (let i = 0; i < listaDeudas.length; i++) {
                                    sumaDeudas = sumaDeudas + parseInt(listaDeudas[i].cantidad);
                                }
                                return new Componente(result.componentes_id, result.tipo, result.color, listaDeudas, result.indice,result.nombre, sumaDeudas);
                            } else if(result.tipo=="tareas"){
                                const listaTareas = await tareas.getTareas(result.componentes_id);
                                console.log(listaTareas)
                                return new Componente(result.componentes_id, result.tipo, result.color, listaTareas, result.indice,result.nombre);
                            } else if(result.tipo=="equipaje_grupal"){
                                const listaItems = await items_grupal.getItemsGrupal(result.componentes_id);
                                console.log(listaItems)
                                let num = 0;
                                for (let i = 0; i < listaItems.length; i++) {
                                    if (listaItems[i].actual >= listaItems[i].cantidad_total) {
                                        num++;
                                    }
                                }
                                return new Componente(result.componentes_id, result.tipo, result.color, listaItems, result.indice,result.nombre, num, listaItems.length);
                            } else if (result.tipo =="calendario"){
                                const listaEventos = await eventos.getEventos(result.componentes_id);
                                console.log(listaEventos)
                                const calendario = await calendarios.getCalendario(result.componentes_id);
                                return new Componente(result.componentes_id, result.tipo, result.color, listaEventos, result.indice,result.nombre,calendario.fechaDeInicio,calendario.fechaDeFinal);
                            }

                            else if (result.tipo =="compra"){
                                const listaItemsCompra = await items_compra.getItemsCompra(result.componentes_id);
                                console.log(listaItemsCompra)
                                let numItemsCompra = 0;
                                for (let i = 0; i < listaItemsCompra.length; i++) {
                                    if (listaItemsCompra[i].estado == "comprado") {
                                        numItemsCompra++;
                                    }
                                }
                                return new Componente(result.componentes_id, result.tipo, result.color, listaItemsCompra, result.indice,result.nombre, numItemsCompra, listaItemsCompra.length);
                            }
     
                        }));
                        console.log(componentes)
                        resolve(componentes);
                    } catch (error) {
                        console.error('Error en get componentes: ', err)
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
                    reject(error);
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

    getComponenteTareas(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                if (results.length == 1){
                    const listaTareas = await tareas.getTareas(idComponente);
                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaTareas,
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

    getComponenteItemsGrupales(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                if (results.length == 1){
                    const listaItemsGrupales = await items_grupal.getItemsGrupal(idComponente);
                    let numItems = 0;
                    for (let i = 0; i < listaItemsGrupales.length; i++) {
                        if (listaItemsGrupales[i].valor_actual < listaItemsGrupales[i].valor_maximo) {
                            numItems++;
                        }
                    }

                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaItemsGrupales,
                        results[0].indice,
                        results[0].nombre,
                        numItems,
                        listaItemsGrupales.length)
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

    getComponenteCalendario(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                if (results.length == 1){
                    const listaEventos = await eventos.getEventos(idComponente);
                    const calendario = await calendarios.getCalendario(idComponente);
                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaEventos,
                        results[0].indice,
                        results[0].nombre,
                        calendario.fechaDeInicio,
                        calendario.fechaDeFinal)
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
    
    getComponenteCompra(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                if (results.length == 1){
                    const listaItemsCompra = await items_compra.getItemsCompra(idComponente);
                    let numItemsCompra = 0;
                    for (let i = 0; i < listaItemsCompra.length; i++) {
                        if (listaItemsCompra[i].estado == "pendiente") {
                            numItemsCompra++;
                        }
                    }

                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaItemsCompra,
                        results[0].indice,
                        results[0].nombre,
                        numItemsCompra,
                        listaItemsCompra.length)
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

    


    getComponenteDeudas(idComponente) {
        return new Promise(async (resolve, reject) => {
            connection.query('SELECT * FROM componentes WHERE componentes_id = ?', [idComponente], async (err, results) => {
                if (err) {
                    reject(err);
                } else {  
                    try {
                if (results.length == 1){
                    const listaDeudas = await deudas.getDeudas(idComponente);
                    const temp = new Componente(
                        results[0].componentes_id,
                        results[0].tipo,
                        results[0].color,
                        listaDeudas,
                        results[0].indice,
                        results[0].nombre)
                        console.log(temp)
                        resolve(temp);
                    }
                    }catch (error) {
                    reject(error);
                  }
                }
            }
            );

}
        );
    }
}


module.exports=Componentes;