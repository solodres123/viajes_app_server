const ItemGrupal = require("../../../models/componentes/items_grupal/item_grupal");

const Usuarios= require('../../usuarios')
const Usuario= require('../../../models/usuario')
const usuarios = new Usuarios();

const Asignacion= require("../../../models/componentes/items_grupal/asignacion");

const { v4: uuidv4 } = require('uuid');


const mysql = require('mysql2');


// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class ItemsGrupal{

    constructor(){
        this.itemsGrupal =[]; 
    }

    getItemsGrupal(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM items_grupales WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const itemsGrupal = await Promise.all(results.map(async result => {
                            const asignaciones = await this.getAsignaciones(result.id);
                            const actual =asignaciones.reduce((total,asignacion)=>total+asignacion.cantidad,0);
                            return new ItemGrupal(result.id,result.nombre,asignaciones,result.cantidad_total,actual);   
                        }));
                        resolve(itemsGrupal);
                    } catch (error) {
                        reject(error);
                    }}});});}

    addItemGrupal(componentes_id,nombre,cantidad_total) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO items_grupales (id,nombre,cantidad_total,componentes_id) VALUES (?,?,?,?)', [uuidv4(),nombre,cantidad_total,componentes_id], (err, results) => {
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

    deleteItemGrupal(id) {
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM items_grupales WHERE id = ?', [id], (err, results) => {
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


    updateAsignacionItemGrupal(id_item, email, cantidad) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE usuario_lleva_item SET cantidad = ? WHERE items_grupales_id = ? AND usuarios_correo = ?', [cantidad,id_item,email], (err, results) => {
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


    updateCantidadTotalItemGrupal(id, cantidad_total) {
        return new Promise((resolve, reject) => {
            connection.query('UPDATE items_grupales SET cantidad_total = ? WHERE id = ?', [cantidad_total,id], (err, results) => {
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






    getAsignaciones(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuario_lleva_item WHERE items_grupales_id = ?', [id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const asignaciones = await Promise.all(results.map(async result => {
                            const usuario = await usuarios.getUsuarioLimitado(result.usuarios_correo);
                            return new Asignacion(result.id,usuario,result.cantidad);
                        }));
                        resolve(asignaciones);
                    } catch (error) {
                        reject(error);
                    }}});});}



              modAsignacion(id,cantidad,correo) {
                    return new Promise((resolve, reject) => {
                        //donde el id es el id de la asignacion
                        connection.query('UPDATE usuario_lleva_item SET cantidad = ? WHERE items_grupales_id = ? AND usuarios_correo = ?', [cantidad,correo,id], (err, results) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }
                        });


                    });

                }
            }

            


module.exports = ItemsGrupal;