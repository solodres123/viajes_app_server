class Deuda{

    constructor(id,nombre,deudores,acreedor,cantidad,deudasPequeñas){
           this.id=id;
           this.nombre=nombre;   
           this.deudores=deudores;
           this.acreedor=acreedor;  
           this.cantidad=cantidad; 
           this.deudasPequenas=deudasPequeñas;
    }
} 

module.exports=Deuda; 