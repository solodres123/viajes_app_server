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

    getUsuarioLimitado(correo) {
          return new Promise((resolve, reject) => {
            connection.query('SELECT * FROM usuarios WHERE correo = ?', [correo], (err, results) => {
              if (err) {
                reject(err);
              } else {
                if (results.length == 1) {
                  resolve(new Usuario(
                    results[0].correo,
                    " ",
                    results[0].nombre,
                    results[0].apellido_1,
                    results[0].apellido_2,
                    results[0].color_perfil,));
                } else {
                  reject(err); // Devuelve 0 si el correo proporcionado no coincide
                }
              }
            });
          });
        }
}


module.exports=Usuario;