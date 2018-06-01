window.onload = function () {

 document.getElementById("nickname","contraseña").addEventListener("focus",function(){
    document.getElementById("incorrecto").setAttribute("class", "ocultar");
 })

}