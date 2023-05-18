
const Tarea= require("./tarea");

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


class Tareas{

    constructor(){
        this.tareas =[]; 
    }

        getTareas(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM tareas WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        const tareas = await Promise.all(results.map(async result => {
                            const Usuarios= await usuarios.getEncargados(result.id);
                            return new Tarea(result.id,result.nombre,Usuarios,result.estado);
                        }));
                        resolve(tareas);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
    }

    addEncargadoTarea(id,correo){
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO usuarios_encargados_tareas (usuarios_correo,tareas_id) VALUES (?,?)', [correo,id], (err, results) => {
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

    updateTarea(id,estado){
        return new Promise((resolve, reject) => {
            connection.query('UPDATE tareas SET estado = ? WHERE id = ?', [estado,id], (err, results) => {
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



    deleteTarea(id){
        return new Promise((resolve, reject) => {
            connection.query('DELETE FROM tareas WHERE id = ?', [id], (err, results) => {
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



   addTarea(nombre,id_componente) {
        return new Promise((resolve, reject) => {
            const id = uuidv4();
            connection.query('INSERT INTO tareas (id,nombre,estado,componentes_id) VALUES (?,?,?,?)', [id,nombre,"Pendiente",id_componente], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {
                        
                    
                    resolve(id);
                }
                catch (error) {
                    reject(error);
                }
            }
            });
        });
    }

                



            
}


module.exports = Tareas;