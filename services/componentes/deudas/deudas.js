const Deuda= require("../../../models/componentes/deudas/deuda");

const Usuarios= require('../../usuarios')
const Usuario= require('../../../models/usuario')
const usuarios = new Usuarios();

const DeudaPequena= require("../../../models/componentes/deudas/deuda_pequena");

const { v4: uuidv4 } = require('uuid');


const mysql = require('mysql2');

// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Deudas{


 

    constructor(){
        this.deudas =[]; 
    }
    getDeudas(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM deudas WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try { 
                        const deudas = await Promise.all(results.map(async result => {
                            const usuario = await usuarios.getUsuarioLimitado(result.acreedor);
                            const Usuarios= await usuarios.getDeudores(result.id);
                            const deudasPequenas= await this.getDeudasPequeñas(result.id);
                            return new Deuda(result.id,result.nombre,Usuarios,usuario,result.cantidad,deudasPequenas);
                        }));
                        resolve(deudas);
                    } catch (error) {
                        reject(error);
                    }}});});}

    getDeudasPequeñas(id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios_has_deudas WHERE deudas_id = ?', [id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const numeroDeudores=results.length;
                        const deudas = await Promise.all(results.map(async result => {
                            const usuario = await usuarios.getUsuarioLimitado(result.usuarios_correo);
                            const usuarioAcreedor = await usuarios.getUsuarioLimitado(result.acreedor);
                            console.log(result.cantidad)
                            return new DeudaPequena(id,usuario,result.cantidad,usuarioAcreedor);
                        }));
                        resolve(deudas);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }


                addDeudaGrande(acreedor,cantidad,nombre,id_componente) { 
                    return new Promise((resolve, reject) => {
                        const id = uuidv4();
                        connection.query('INSERT INTO deudas (id,acreedor,cantidad,nombre,componentes_id) VALUES (?,?,?,?,?)', [id,acreedor,cantidad,nombre,id_componente], (err, results) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(id);
                            }
                        });
                    }
                    );
                }


                addDeudasPequeñas(id_deuda,acreedor,cantidadPorPersona,deudor) {
                    return new Promise((resolve, reject) => {
                        const id = uuidv4();         
                        connection.query('INSERT INTO usuarios_has_deudas (usuarios_correo,deudas_id,cantidad,acreedor) VALUES (?,?,?,?)', [deudor,id_deuda,cantidadPorPersona,acreedor], (err, results) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }
                        });
                    }
                    );
                }

                deleteDeuda(id) {
                    return new Promise((resolve, reject) => {
                        connection.query('DELETE FROM deudas WHERE id = ?', [id], (err, results) => {
                            if (err) {
                                reject(err);
                            } else {
                                resolve(results);
                            }
                        });
                    }
                    );
                }
            }



module.exports = Deudas;