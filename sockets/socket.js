const mysql = require('mysql2');
const connection = mysql.createConnection({
	host: 'localhost',
	user: 'root',
	password: 'XXXxxx94',
	database: 'viajes_app'
});

const {io} = require('../index');
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
const Deudas = require('../models/componentes/deudas/deudas');
const Deuda = require('../models/componentes/deudas/deuda');
const deudas = new Deudas();
const Tareas = require('../models/componentes/tareas/tareas');
const Tarea = require('../models/componentes/tareas/tarea');
const tareas = new Tareas();
const ItemsGrupal = require('../models/componentes/items_grupal/items_grupal');
const ItemGrupal = require('../models/componentes/items_grupal/item_grupal');
const itemsGrupal = new ItemsGrupal();
const Eventos = require('../models/componentes/calendario/eventos');
const Evento = require('../models/componentes/calendario/evento');
const eventos = new Eventos();
const Calendarios = require('../models/componentes/calendario/calendarios');
const Calendario = require('../models/componentes/calendario/calendario');
const calendarios = new Calendarios();
const AsignacionEquipaje = require('../models/componentes/items_grupal/asignacion');
const Confirmaciones = require('../models/componentes/confirmaciones/confirmaciones');
const Confirmacion = require('../models/componentes/confirmaciones/confirmacion');
const confirmaciones = new Confirmaciones();
const {v4: uuidv4} = require('uuid');
const UsuarioOcupaCama = require('../models/componentes/habitaciones/usuario_ocupa_cama');
const UsuarioOcupaCamas = require('../models/componentes/habitaciones/usuario_ocupa_camas');
const Asignacion = require('../models/componentes/items_grupal/asignacion');
const ItemsCompra = require('../models/componentes/compra/items_compra');
const ItemCompra = require('../models/componentes/compra/item_compra');
const itemsCompra = new ItemsCompra();
const usuarioOcupaCamas = new UsuarioOcupaCamas();

let userToSocket = new Map();


//q: estoy haciendo la memoria de este trabajo, como podira llamar al apartado que habla de estas conexiones
//q: y como podria explicar que es lo que hace cada una de estas conexiones
//a: podrias llamarlo "conexiones con el cliente" y explicar que es lo que hace cada una de estas conexiones
//conexion con el cliente ------------------------------------------------------------------------------------------------------

io.on('connection', client => {
	console.log('Cliente conectado')
	client.on('disconnect', () => {
		console.log('Cliente desconectado')
        for (let [correo, id] of userToSocket.entries()) {
            if (id === client.id) {
                userToSocket.delete(correo);
                break;
            }
        }
	});

    client.on('register-user', (correo) => {
        userToSocket.set(correo, client.id);
    });


	client.on('solicitud-viajes', async (payload) => {
		try {
			console.log('viajes solicitados')
			const listaViajes = await viajes.getViajes(payload);
			client.emit('envio-viajes', listaViajes);
			console.log(listaViajes)
		} catch (err) {
			console.error('Error al enviar la lista de viajes', err);
		}
	})
    

	//componente generales-------------------------------------------------------------------------------------------

	client.on('solicitud-componentes', async (payload) => {
		try {
			console.log('componentes solicitados')
			client.emit('lista-componentes', componentes.getComponentes())
		} catch (err) {
			console.error('Error enviando componentes', err);
		}
	})

	client.on('peticion-this-componente', async (payload) => {
		try {
			console.log('componente solicitado para screen')
			console.log(payload)
			switch (payload.tipo) {
				case 'habitaciones':
					client.emit('envio-this-componente-habitaciones', await componentes.getComponente(payload.id))			
					break;
				case 'confirmados':
					client.emit('envio-this-componente-confirmados', await componentes.getComponente(payload.id))
					break;
				case 'deudas':
					client.emit('envio-this-componente-deudas', await componentes.getComponente(payload.id))
					break;
				case 'tareas':
					client.emit('envio-this-componente-tareas', await componentes.getComponente(payload.id))
					break;
				case 'equipaje_grupal':
					client.emit('envio-this-componente-equipaje_grupal', await componentes.getComponente(payload.id))
					break;
				case 'calendario':
					client.emit('envio-this-componente-calendario', await componentes.getComponente(payload.id))
					break;
				case 'compra':
					client.emit('envio-this-componente-compra', await componentes.getComponente(payload.id))
					break;
				default:
					console.log('default')
					break;
			}
		} catch (err) {
			console.error('Error enviando componentes', err);
		}
	})

    client.on('add-viaje', async (payload) => {
        try {
            console.log('añadir viaje solicitado')
            console.log(payload.urlImagen)
            const Viaje = await viajes.addViaje(payload.nombre, payload.fechaInicio, payload.fechaFin, payload.urlImagen);
            const UsuarioViaje = await usuarios.addUsuarioViaje(payload.correo, Viaje);
            const listaViajes = await viajes.getViajes(payload.correo);
            client.emit('envio-viajes', listaViajes);
            console.log("viaje añadido");
            console.log(Viaje);
        } catch (err) {
            console.error('Error añadiendo viaje:', err);
        }
    })
 
	client.on('eliminar-viaje', async (payload) => {
		try {
			console.log('eliminar viaje solicitado')
			const Viaje = await viajes.deleteViaje(payload.viaje_id);
			io.to(payload.viaje_id).emit('actualiza-viajes');
			console.log("viaje eliminado");
			console.log(Viaje);
		} catch (err) {
			console.error('Error eliminando viaje:', err);
		}
	})



	client.on('actualizar-viaje', async (payload) => {
		try {
			console.log('actualizar viaje solicitado')
			const Viaje = await viajes.updateViaje(payload.id, payload.nombre, payload.fechaInicio, payload.fechaFin, payload.estado, payload.urlImagen);
			client.emit('envio-viaje', Viaje);
			const listaViajes = await viajes.getViajes(payload.correo);
			io.to(payload.id).emit('envio-viajes', listaViajes);
			console.log("viaje actualizado");
			console.log(Viaje);
		} catch (err) {
			console.error('Error actualizando viaje:', err);
		}
	})

	client.on('solicitud-viajes', async (payload) => {
		try {
			console.log('viajes solicitados')
			const listaViajes = await viajes.getViajes(payload);
			listaViajes.forEach(viaje => {
				client.join(viaje.id);
			});
			client.emit('envio-viajes', listaViajes);
			console.log(listaViajes)
		} catch (err) {
			console.error('Error al enviar la lista de viajes', err);
		}
	})


	client.on('solicitud-componentes-viaje', async (payload) => {
		try {
            client.join(payload);
			const UsuariosViaje = await usuarios.getUsuariosViaje(payload);
			const listaComponentes = await componentes.getComponentes(payload);
			client.emit('lista-usuarios', UsuariosViaje);
			client.emit('lista-componentes', listaComponentes);
		} catch (err) {
			console.error('Error enviando la lista de usuarios o componentes:', err);
		}
	})

	client.on('creacion-nuevo-componente', async (payload) => {
		try {
			const Componente = await componentes.addComponente(payload.tipo, payload.viaje_id, payload.color, payload.nombre);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
		} catch (err) {
			console.error('Error creando componente:', err);
		}
	})

	client.on('borrar-componente', async (payload) => {
		try {
			console.log('borrado de componente solicitado')
			const Componente = await componentes.deleteComponente(payload.id);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("componente borrado");
			console.log(Componente);
		} catch (err) {
			console.error('Error borrando componente:', err);
		}
	})


	//usuarios------------------------------------------------------------------------------------------------------------

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

	client.on('crear-usuario', async (payload) => {
		try {
			console.log('añadir-usuario-solicitado')
			const valor_comp = await usuarios.usuarioEsNuevo(payload.correo);
			if (valor_comp == 1) {
				console.log('usuario valido')
				const usuarioTemp = await usuarios.addUsuario(payload.correo, payload.contrasena, payload.nombre, payload.primerApellido, payload.segundoApellido, payload.color);
				client.emit('usuario-valido', usuarioTemp);
				console.log('confirmacion enviada')
			} else {
				client.emit('correo-ya-existe');
				console.log('rechazo enviado ya existe ese correo')
			}
		} catch (err) {
			console.error('Error al crear usuario:', err);
		}
	})

	client.on('obtener-usuarios-viaje', async (payload) => {
		try {
			console.log('obtener usuarios de viaje solicitado')
			const UsuariosViaje = await usuarios.getUsuariosViaje(payload);
			client.emit('envio-usuarios-viaje', UsuariosViaje);
			console.log("usuarios de viaje enviados");
			console.log(UsuariosViaje);
		} catch (err) {
			console.error('Error obteniendo usuarios de viaje:', err);
		}
	})

	client.on('añadir-usuario-a-viaje', async (payload) => {
		try {
			console.log('añadir usuario a viaje solicitado')
			const UsuarioViaje = await usuarios.addUsuarioViaje(payload.correo, payload.viaje_id);
			const UsuariosViaje = await usuarios.getUsuariosViaje(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-usuarios-viaje', UsuariosViaje);
            io.to(userToSocket.get(payload.correo)).emit('añadido-a-viaje');
		} catch (err) {
			console.error('Error añadiendo usuario a viaje:', err);
		}
	})

	client.on('borrar-usuario-de-viaje', async (payload) => {
		try {
			console.log('borrar usuario de viaje solicitado')
			const UsuarioViaje = await usuarios.deleteUsuarioViaje(payload.correo, payload.viaje_id);
			const UsuariosViaje = await usuarios.getUsuariosViaje(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-usuarios-viaje', UsuariosViaje);
		} catch (err) {
			console.error('Error borrando usuario de viaje:', err);
		}
	})


	//habitaciones------------------------------------------------------------------------------------------------------------

	client.on('creacion-nueva-habitacion', async (payload) => {
		try {
			console.log('nueva habitacion solicitada')
			await habitaciones.addHabitacion(payload.id_componente, payload.nombre);
			const Habitacion = await componentes.getComponente(payload.id_componente);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-habitaciones', Habitacion);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("habitacion creada");
			console.log(Habitacion);
		} catch (err) {
			console.error('Error creando habitacion:', err);
		}
	})

	client.on('creacion-nueva-cama', async (payload) => {
		try {
			console.log('nueva cama solicitada')
			await camas.addCama(payload.id_habitacion, payload.tipo_cama);
			const Habitacion = await componentes.getComponente(payload.id_componente);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-habitaciones', Habitacion);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("cama creada");
			console.log(Habitacion);
		} catch (err) {
			console.error('Error creando cama:', err);
		}
	})

	client.on('borrar-cama', async (payload) => {
		try {
			console.log('borrado de cama solicitado')
			const Cama = await camas.deleteCama(payload.id_cama);
			const Habitacion = await componentes.getComponente(payload.id_componente);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-habitaciones', Habitacion);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("cama borrada");
			console.log(Habitacion);
		} catch (err) {
			console.error('Error borrando cama:', err);
		}
	})

	client.on('añadir-usuario-cama', async (payload) => {
		try {
			console.log('añadir usuario a cama solicitado')
			const UsuarioOcupaCama = await usuarioOcupaCamas.addUsuarioOcupaCama(payload.id_cama, payload.correo);
			const Habitacion = await componentes.getComponente(payload.id_componente);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-habitaciones', Habitacion);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("usuario añadido a cama");
			console.log(Habitacion);
		} catch (err) {
			console.error('Error añadiendo usuario a cama:', err);
		}
	})

	client.on('borrar-usuario-cama', async (payload) => {
		try {
			console.log('borrar usuario de cama solicitado')
			const UsuarioOcupaCama = await usuarioOcupaCamas.deleteUsuarioOcupaCama(payload.id_cama, payload.correo);
			const Habitacion = await componentes.getComponente(payload.id_componente);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-habitaciones', Habitacion);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("usuario borrado de cama");
			console.log(Habitacion);
		} catch (err) {
			console.error('Error borrando usuario de cama:', err);
		}
	})

	client.on('borrar-habitacion', async (payload) => {
		try {
			console.log('borrar habitacion solicitado')
			const Habitacion1 = await habitaciones.deleteHabitacion(payload.id_habitacion);
			const Habitacion = await componentes.getComponente(payload.id_componente);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-habitaciones', Habitacion);
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("habitacion borrada");
			console.log(Habitacion1);
		} catch (err) {
			console.error('Error borrando habitacion:', err);
		}
	})

	//confirmaciones------------------------------------------------------------------------------------------------------------

	client.on('cambio-confirmacion', async (payload) => {
		try {
			console.log('cambio en confirmacion solicitado')
			const confirmacion = await confirmaciones.changeEstadoConfirmacion(payload.id_componente, payload.correo_usuario, payload.estado);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-confirmaciones', await componentes.getComponente(payload.id_componente))
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log(confirmacion);
		} catch (err) {
			console.error('Error actualizando componente confirmaciones:', err);
		}
	})

	//compras------------------------------------------------------------------------------------------------------------
	client.on('añadir-item-compra', async (payload) => {
		try {
			console.log('añadir item compra solicitado')
			const Item = await itemsCompra.addItemCompra(payload.id_componente, payload.titulo);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-compra', await componentes.getComponente(payload.id_componente));
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("item añadido");
			console.log(Item);
		} catch (err) {
			console.error('Error añadiendo item compra:', err);
		}
	})

	client.on('borrar-item-compra', async (payload) => {
		try {
			console.log('borrar item compra solicitado')
			const Item = await itemsCompra.deleteItemCompra(payload.id);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-compra', await componentes.getComponente(payload.id_componente));
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("item borrado");
			console.log(Item);
		} catch (err) {
			console.error('Error borrando item compra:', err);
		}
	})

	client.on('actualizar-item-compra', async (payload) => {
		try {
			console.log('actualizar item compra solicitado')
			const Item = await itemsCompra.changeEstadoItemCompra(payload.id);
			const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-compra', await componentes.getComponente(payload.id_componente));
			io.to(payload.viaje_id).emit('lista-componentes', listaComponentes);
			console.log("item actualizado");
			console.log(Item);
		} catch (err) {
			console.error('Error actualizando item compra:', err);
		}
	})


	//deudas------------------------------------------------------------------------------------------------------------

	client.on('añadir-deuda-grande', async (payload) => {
		try {
			console.log('añadir deuda grande solicitado')
			const DeudaGrande = await deudas.addDeudaGrande(payload.acreedor, payload.cantidad, payload.nombre, payload.id_componente);
			for (let i = 0; i < payload.deudores.length; i++) {
				const DeudasPequeñas = await deudas.addDeudasPequeñas(DeudaGrande, payload.acreedor, payload.cantidadPorPersona, payload.deudores[i]);
			}
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-deudas', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("deuda grande añadida");
			console.log(DeudaGrande);
		} catch (err) {
			console.error('Error añadiendo deuda grande:', err);
		}
	})

	client.on('borrar-deuda', async (payload) => {
		try {
			console.log('borrar deuda grande solicitado')
			const DeudaGrande = await deudas.deleteDeuda(payload.id_deuda);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-deudas', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("deuda grande borrada");
			console.log(DeudaGrande);
		} catch (err) {
			console.error('Error borrando deuda grande:', err);
		}
	})
 
	//tareas------------------------------------------------------------------------------------------------------------

	client.on('add-tarea', async (payload) => {
		try {
			console.log(payload.encargados)
			console.log('añadir tarea')
			const Tarea = await tareas.addTarea(payload.nombre, payload.id_componente);
			for (let i = 0; i < payload.encargados.length; i++) {
				const TareaUsuario = await tareas.addEncargadoTarea(Tarea, payload.encargados[i]);
			}
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-tareas', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("tarea añadida");
			console.log(Tarea);
		} catch (err) {
			console.error('Error añadiendo tarea:', err);
		}
	})

	client.on('borrar-tarea', async (payload) => {
		try {
			console.log('borrar tarea solicitado')
			const Tarea = await tareas.deleteTarea(payload.id_tarea);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-tareas', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("tarea borrada");
			console.log(Tarea);
		} catch (err) {
			console.error('Error borrando tarea:', err);
		}
	})

	client.on('actualizar-tarea', async (payload) => {
		try {
			console.log('actualizar tarea solicitado')
			const Tarea = await tareas.updateTarea(payload.id_tarea, payload.estado);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-tareas', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("tarea actualizada");
			console.log(Tarea);
		} catch (err) {
			console.error('Error actualizando tarea:', err);
		}
	})

	//equipaje grupal------------------------------------------------------------------------------------------------------------

	client.on('añadir-item-grupal', async (payload) => {
		try {
			console.log('añadir item grupal solicitado')
			const Item = await itemsGrupal.addItemGrupal(payload.id_componente, payload.nombre, payload.cantidad_total);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-equipaje_grupal', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes',listaComponentes)
			console.log("item añadido");
			console.log(Item);
		} catch (err) {
			console.error('Error añadiendo item grupal:', err);
		}
	})

	client.on('borrar-item-grupal', async (payload) => {
		try {
			console.log('borrar item grupal solicitado')
			const Item = await itemsGrupal.deleteItemGrupal(payload.id);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-equipaje_grupal', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes',listaComponentes)
			console.log("item borrado");
			console.log(Item);
		} catch (err) {
			console.error('Error borrando item grupal:', err);
		}
	})

	client.on('modificar-asignacion-item-grupal', async (payload) => {
		try {
			console.log('modificar asignacion item grupal solicitado');
			await itemsGrupal.updateAsignacionItemGrupal(payload.id_item, payload.email, payload.cantidad);
			await itemsGrupal.updateCantidadTotalItemGrupal(payload.id_item, payload.cantidad_total);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			console.log('enviando componente');
			io.to(payload.viaje_id).emit('envio-this-componente-equipaje_grupal', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("item modificado");
		} catch (err) {
			console.error('Error modificando asignacion item grupal:', err);
		}
	});

	//calendario------------------------------------------------------------------------------------------------------------

	client.on('añadir-evento', async (payload) => {
		try {
			console.log('añadir evento solicitado')
			const Evento = await eventos.addEvento(payload.id_componente, payload.correo, payload.fecha_inicio, payload.fecha_final, payload.prioridad);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-calendario', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("evento añadido");
			console.log(Evento);
		} catch (err) {
			console.error('Error añadiendo evento:', err);
		}
	})

	client.on('actualizar-fechas', async (payload) => {
		try {
			console.log('actualizar fechas solicitado')
			const Calendario = await calendarios.updateCalendario(payload.id_componente, payload.fecha_inicio, payload.fecha_final);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes',listaComponentes)
			console.log("fechas actualizadas");
			console.log(Calendario);
		} catch (err) {
			console.error('Error actualizando fechas:', err);
		}
	})

	client.on('borrar-evento', async (payload) => {
		try { 
			console.log('borrar evento solicitado')
			const Evento = await eventos.deleteEvento(payload.id);
            const listaComponentes = await componentes.getComponentes(payload.viaje_id);
			io.to(payload.viaje_id).emit('envio-this-componente-calendario', await componentes.getComponente(payload.id_componente));
            io.to(payload.viaje_id).emit('lista-componentes', listaComponentes)
			console.log("evento borrado");
			console.log(Evento);
		} catch (err) {
			console.error('Error borrando evento:', err);
		}
	})

	//pruebas------------------------------------------------------------------------------------------------------------

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
		io.emit('mensaje', {
			admin: 'nuevo mensaje'
		})
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