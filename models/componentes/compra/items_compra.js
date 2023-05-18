const ItemCompra= require("./item_compra");

const Usuarios= require('../../usuarios')
const Usuario= require('../../usuario')
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


class ItemsCompra{

    constructor(){
        this.items_compra =[]; 
    }

    addItemCompra(componentes_id,titulo){
        return new Promise((resolve, reject) => {
            const id = uuidv4();
            connection.query('INSERT INTO items_compra (id,titulo,estado,componentes_id) VALUES (?,?,?,?)', [id,titulo,"pendiente",componentes_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

    deleteItemCompra(id){
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM items_compra WHERE id = ?', [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }




    getItemsCompra(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM items_compra WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {

                        const items_compra = await Promise.all(results.map(async result => {
                            return new ItemCompra(result.id, result.titulo, result.estado, result.componentes_id);
                        }));
                        resolve(items_compra);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    changeEstadoItemCompra(id){
        return new Promise((resolve, reject) => {
            connection.query('UPDATE items_compra SET estado = ? WHERE id = ?', ["comprado",id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
    }

}

module.exports = ItemsCompra;