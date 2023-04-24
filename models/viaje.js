class Viaje{

    constructor(id,nombre,descripcion,fechaInicio,fechaFin,estado,urlImagen){
        this.id=id;//id unico  
        this.nombre=nombre;
        this.descripcion=descripcion;
        this.fechaInicio=fechaInicio;
        this.fechaFin=fechaFin;
        this.estado=estado;
        this.urlImagen=urlImagen;       
    }
} 

module.exports=Viaje;