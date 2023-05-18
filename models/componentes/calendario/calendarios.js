const Calendario= require("./calendario");

const Usuarios= require('../../usuarios')
const Usuario= require('../../usuario')
const usuarios = new Usuarios();



const mysql = require('mysql2');

// Establecer la configuración de la conexión
const connection = mysql.createConnection({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app'
});


class Calendarios{


    

    constructor(){
        this.calendarios =[]; 
    }

    addCalendario(id_componente,fecha_inicio,fecha_final) {
        return new Promise((resolve, reject) => {
            connection.query('INSERT INTO calendario (componentes_id,fechaDefInicio,fechaDefFinal) VALUES (?,?,?)', [id_componente,fecha_inicio,fecha_final], (err, results) => {
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


    getCalendario(componentes_id) {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM calendario WHERE componentes_id = ?', [componentes_id], async (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    try {   
                        const calendario = await Promise.all(results.map(async result => {
                            return new Calendario(
                                result.componentes_id,
                                result.fechaDefInicio.toISOString().substring(0,10),
                                result.fechaDefFinal.toISOString().substring(0,10)
                                );
                        }));
                        resolve(calendario[0]);
                    } catch (error) {
                        reject(error);
                    }
                }
            });
        });
}


updateCalendario(id_componente,fecha_inicio,fecha_final) {
    return new Promise((resolve, reject) => {
        connection.query('UPDATE calendario SET fechaDefInicio = ?, fechaDefFinal = ? WHERE componentes_id = ?', [fecha_inicio,fecha_final,id_componente], (err, results) => {
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



                       


    changefechas(componentes_id,inicio,fin){
        return new Promise((resolve, reject) => {
            connection.query('UPDATE calendario SET fechaDefInicio = ?, fechaDefFinal = ? WHERE componentes_id = ?', [inicio,fin,componentes_id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    resolve(results);
                }
            });
        });
}
}

module.exports = Calendarios;