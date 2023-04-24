const Viaje = require("./viaje");

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


//  new Viaje(1,'Viaje a Viena','Viaje a Viena con la guapetona de mi novia jaja se chinchan','2021-8-01','2021-08-06','planificando','https://www.civitatis.com/blog/wp-content/uploads/2010/07/shutterstock_1450254959-1920x1280.jpg'),
      //  new Viaje(2,'Mombeltran adventures 2023','Se vienen cositas','2021-8-14','2021-08-19','planificado','https://1.bp.blogspot.com/-Ua0XqhTztOc/YFJzXrNrFaI/AAAAAAABBSQ/yokVJ8QBxKkoS3nbHHS_B0BG4WmVCjDWACLcBGAsYHQ/s16000/Mombeltran-ayuntamiento.jpg'),
      //  new Viaje(3,'Mapaches en Cuenca 2023','La increible historia de 4 amigos que surcaran los mares porque no saben viajar en linea recta','2021-8-25','2021-09-02','cancelado','https://www.thetrainline.com/cms/media/1399/spain-cuenca-old-town.jpg'),
        


class Viajes{

    constructor(){
        this.viajes=[]; 
    }

    getViajes() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM viajes', (err, results) => {
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
}

module.exports=Viajes;