class Usuario{
    //q:como le digo que id es requerido y name no?
    //a: en el constructor
    //q:y como se veria
    

    constructor(correo,contrasena,nombre,primer_apellido,segundo_apellido,color){  
        this.correo=correo;                                                                                           
        this.contraseña=contrasena;  
        this.nombre=nombre;
        this.apellido_1=primer_apellido;
        this.apellido_2=segundo_apellido;
        this.color=color;

    }
}


module.exports=Usuario;