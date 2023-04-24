//cosas 
const mysql = require('mysql2');
const connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: 'XXXxxx94',
    database: 'viajes_app'
});
//mensajes de sockets
const { io } = require('../index');

const Componentes = require('../models/componentes/componentes')
const Componente = require('../models/componentes/componente')
const componentes = new Componentes();

const Habitaciones = require('../models/componentes/habitaciones/habitaciones')
const Habitacion = require('../models/componentes/habitaciones/habitacion')
const habitaciones = new Habitaciones();

const Camas = require('../models/componentes/habitaciones/camas')
const Cama = require('../models/componentes/habitaciones/cama')
const camas = new Camas();

const Usuarios = require('../models/usuarios')
const Usuario = require('../models/usuario')
const usuarios = new Usuarios();

const Viajes = require('../models/viajes')
const Viaje = require('../models/viaje')
const viajes = new Viajes();

const Confirmaciones = require('../models/componentes/confirmaciones/confirmaciones');
const Confirmacion = require('../models/componentes/confirmaciones/confirmacion');
const confirmaciones = new Confirmaciones();

const { v4: uuidv4 } = require('uuid');

const UsuarioOcupaCama = require('../models/componentes/habitaciones/usuario_ocupa_cama');
const UsuarioOcupaCamas = require('../models/componentes/habitaciones/usuario_ocupa_camas');
const usuarioOcupaCamas = new UsuarioOcupaCamas();



io.on('connection', client => {
    console.log('Cliente conectado')
    client.on('disconnect', () => {
        console.log('Cliente desconectado')
    });

    client.on('solicitud-viajes', async (payload) => {
        try {
            console.log('viajes solicitados')
            const listaViajes = await viajes.getViajes();
            client.emit('envio-viajes', listaViajes);
            console.log(listaViajes)
        } catch (err) {
            console.error('Error al enviar la lista de viajes', err);
        }
    })


//componente generales-------------------------------------------------------------------------------------------

    client.on('solicitud-componentes', async (payload) => { try {
            console.log('componentes solicitados')
            client.emit('lista-componentes', componentes.getComponentes())   
        }catch(err){console.error('Error enviando componentes', err);}})

    client.on('peticion-this-componente', async (payload) => {try {
            console.log('componente solicitado para screen')
            console.log(payload)
            switch (payload.tipo) {
                case 'habitaciones':client.emit('envio-this-componente', await componentes.getComponenteHabitaciones(payload.id))
                break;
                case 'confirmados':client.emit('envio-this-componente', await componentes.getComponenteConfirmaciones(payload.id))
                break;
                default:console.log('default')
                break;
            }} catch (err) {console.error('Error enviando componentes', err);}})

    client.on('solicitud-componentes-viaje', async (payload) => {
        try {
            console.log('componentes para viaje solicitados')
            const listaComponentes = await componentes.getComponentes(payload);
            client.emit('lista-componentes', listaComponentes);
            console.log(listaComponentes);
        } catch (err) { 
            console.error('Error en la prueba:', err);
        }
    })

    client.on('creacion-nuevo-componente', async (payload) => {
        try {
            console.log('componentes para viaje solicitados')
            const Componente = await componentes.addComponente(payload.tipo,payload.viaje_id,payload.color,payload.nombre);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('lista-componentes', listaComponentes); 
            console.log("componente creado");
            console.log(Componente);
        } catch (err) {
            console.error('Error creando componente:', err);
        }
    })

    //borrado de un componente
    client.on('borrar-componente', async (payload) => {
        try { 
            console.log('borrado de componente solicitado')
            const Componente = await componentes.deleteComponente(payload.id);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('lista-componentes', listaComponentes);
            console.log("componente borrado");
            console.log(Componente);
        } catch (err) {
            console.error('Error borrando componente:', err);
        }
    })
    

    client.on('cambio-confirmacion', async (payload) => {
        try {
            console.log('cambio en confirmacion solicitado')
            const confirmacion= await confirmaciones.changeEstadoConfirmacion(payload.id_componente,payload.correo_usuario,payload.estado);
            client.emit('envio-this-componente', await componentes.getComponenteConfirmaciones(payload.id_componente))
            console.log(confirmacion);
        } catch (err) {
            console.error('Error actualizando componente confirmaciones:', err);
        }
    })
    
 //habitaciones------------------------------------------------------------------------------------------------------------
 //crear habitacion nueva dentro de un componente
    client.on('creacion-nueva-habitacion', async (payload) => {
        try {
            console.log('nueva habitacion solicitada')
            await habitaciones.addHabitacion(payload.id_componente,payload.nombre);
            const Habitacion = await componentes.getComponenteHabitaciones(payload.id_componente);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('envio-this-componente', Habitacion);
            io.emit('lista-componentes', listaComponentes);   
            console.log("habitacion creada");
            console.log(Habitacion);
        } catch (err) {
            console.error('Error creando habitacion:', err);
        }
    })

    //crear nueva cama dentro de una habitacion
    client.on('creacion-nueva-cama', async (payload) => {
        try {
            console.log('nueva cama solicitada')
            await camas.addCama(payload.id_habitacion,payload.tipo_cama);
            const Habitacion = await componentes.getComponenteHabitaciones(payload.id_componente);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('envio-this-componente', Habitacion);
            io.emit('lista-componentes', listaComponentes);
            console.log("cama creada");
            console.log(Habitacion);
        } catch (err) {
            console.error('Error creando cama:', err);
        }
    })

    //borrar cama
    client.on('borrar-cama', async (payload) => {
        try {
            console.log('borrado de cama solicitado')
            const Cama = await camas.deleteCama(payload.id_cama);
            const Habitacion = await componentes.getComponenteHabitaciones(payload.id_componente);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('envio-this-componente', Habitacion);
            io.emit('lista-componentes', listaComponentes);
            console.log("cama borrada");
            console.log(Habitacion);
        } catch (err) {
            console.error('Error borrando cama:', err);
        }
    })


    //añadir usuario a una cama
    client.on('añadir-usuario-cama', async (payload) => {
        try {
            console.log('añadir usuario a cama solicitado')
            const UsuarioOcupaCama=  await usuarioOcupaCamas.addUsuarioOcupaCama(payload.id_cama,payload.correo);
            const Habitacion = await componentes.getComponenteHabitaciones(payload.id_componente);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('envio-this-componente', Habitacion);
            io.emit('lista-componentes', listaComponentes);
            console.log("usuario añadido a cama");
            console.log(Habitacion);
        } catch (err) {
            console.error('Error añadiendo usuario a cama:', err);
        }
    })

    //borrar usuario de una cama
    client.on('borrar-usuario-cama', async (payload) => {
        try {
            console.log('borrar usuario de cama solicitado')
            const UsuarioOcupaCama=  await usuarioOcupaCamas.deleteUsuarioOcupaCama(payload.id_cama,payload.correo);
            const Habitacion = await componentes.getComponenteHabitaciones(payload.id_componente);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('envio-this-componente', Habitacion);
            io.emit('lista-componentes', listaComponentes);
            console.log("usuario borrado de cama");
            console.log(Habitacion);
        } catch (err) {
            console.error('Error borrando usuario de cama:', err);
        }
    })

    //borrar habitacion
    client.on('borrar-habitacion', async (payload) => {
        try {
            console.log('borrar habitacion solicitado')
            const Habitacion1 = await habitaciones.deleteHabitacion(payload.id_habitacion);
            const Habitacion = await componentes.getComponenteHabitaciones(payload.id_componente);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
            io.emit('envio-this-componente', Habitacion);
            io.emit('lista-componentes', listaComponentes);
            console.log("habitacion borrada");
            console.log(Habitacion1);
        } catch (err) {
            console.error('Error borrando habitacion:', err);
        }
    })





   
    client.on('refresh', async (payload) => {
        try {
            console.log('refresh solicitado')
            const updatedComponentes = await componentes.getComponentes();
            client.emit('lista-componentes', updatedComponentes);
            console.log(updatedComponentes)
        } catch (err) {
            console.error('Error al votar y actualizar las bandas:', err);
        }
    })

    client.on('comprobar-usuario', async (payload) => {
        try {
            console.log('comprobacion-usuario-solicitada')
            const valor_comp = await usuarios.validarUsuario(payload.email, payload.password);
            if (valor_comp == 1) {
                console.log('usuario valido')
                const usuarioTemp = await usuarios.enviarUsuario(payload.email)
                client.emit('usuario-valido', usuarioTemp);
                console.log('confirmacion enviada')
                console.log('confirmacion enviada')
            } else {
                client.emit('usuario-no-valido');
                console.log('rechazo enviado')
            }
        } catch (err) {
            console.error('Error al validar usuario:', err);
        }
    })

   

  
    client.on('prueba-comp', async (payload) => {
        try {
            console.log('prueba solicitada')
            const listaComponentes = await componentes.getComponentes();
            client.emit('lista-componentes', listaComponentes);
            console.log(listaComponentes)
        } catch (err) {
            console.error('Error en la prueba:', err);
        }
    })

    client.on('mensaje', (payload) => {
        console.log('loquisimo', payload)
        io.emit('mensaje', { admin: 'nuevo mensaje' })
    })

    client.on('new-vote', async (payload) => {
        try {
            await bands.voteBand(payload.id);
            const updatedBands = await bands.getBands();
            io.emit('bandas-activas', updatedBands);
            console.log(updatedBands)
        } catch (err) {
            console.error('Error al votar y actualizar las bandas:', err);
        }
    });





});