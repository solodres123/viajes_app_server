const express = require('express');
const path=require('path');
require('dotenv').config();

const app= express();







//node server
const server = require('http').createServer(app);
module.exports.io = require('socket.io')(server);
const publicPath= path.resolve(__dirname,'public')

require('./sockets/socket')

app.use(express.static(publicPath));

server.listen(process.env.PORT,(err)=>{
    if(err) throw new Error(err);

    console.log('Servidor corriendo en puerto',process.env.PORT);

})


const mysql = require('mysql2');

const connection = mysql.createConnection({
  host: 'localhost', // Cambia esta propiedad si tu servidor MySQL está alojado en otro servidor
  user: 'root',
  password: 'XXXxxx94',
  database: 'viajes_app',
});

connection.connect((error) => {
  if (error) {
    console.error('Error de conexión:', error);
  } else {
    console.log('Conexión establecida con éxito');
  }
});

module.exports = connection;