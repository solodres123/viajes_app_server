class Componente{

//q: como haria para que hubisese dos propiedades mas que en caso de no recibise asignarle un valor por defecto

 constructor(id,tipo,color,subcomponente,indice,nombre,propiedad1=0,propiedad2=0){
      this.id=id;//id unico
      this.tipo=tipo;
      this.color=color;
      this.subcomponente=subcomponente;
      this.indice=indice;
      this.nombre=nombre;
      this.propiedad_1=propiedad1;
      this.propiedad_2=propiedad2;
 }
}
  


module.exports=Componente;