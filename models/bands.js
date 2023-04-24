const Band = require("./band").default;



const mysql = require('mysql2');
// Establecer la configuración de la conexión
const connection = mysql.createConnection ({
  host: 'localhost',
  user: 'root',
  password: 'XXXxxx94',
  database: 'prueba'
});


class Bands{



    constructor(){
        this.bands=[]       
    }





    addBand(band=new Band()) {
        return new Promise((resolve, reject) => {

            connection.query("INSERT INTO bandsdb (id, name, votes) VALUES (?, ?, ?)",[band.id, band.name, band.votes], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('banda añadida');
                    resolve();
                }
            });
        });
    }




    push(band){
    this.bands.push(band)
    } 

    getBands() {
        return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM bandsdb', (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    this.bands = [];
                    results.forEach(element => {
                        this.bands.push(new Band(element.id, element.name, element.votes));
                    });
                    resolve(this.bands);
                }
            });
        });
    } 

   


    deleteBands(id=''){

        return new Promise((resolve, reject) => {
            //una query para borrar la banda de la base de datos
            connection.query("DELETE FROM bandsdb WHERE id = ?", [id], (err, results) => {
                connection.query("DELETE FROM bandsdb WHERE id = ?", [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('se ha borrado');
                    resolve();
                }
            });
        });
    }
    )
    }

    voteBand(id = '') {
        return new Promise((resolve, reject) => {
            connection.query("UPDATE bandsdb SET votes = votes + 1 WHERE id = ?", [id], (err, results) => {
                if (err) {
                    reject(err);
                } else {
                    console.log('se ha votado');
                    resolve();
                }
            });
        });
    }
}

module.exports=Bands;