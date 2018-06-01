window.onload = function () {


    document.getElementById("contraseña2").addEventListener("blur", function () {
        if (document.getElementById("contraseña").value != document.getElementById("contraseña2").value) {
            document.getElementById("mensajes").setAttribute("style", "display:block");
            document.getElementById("mensajes").innerHTML = "Las contraseñas no son iguales";
        }else{
            document.getElementById("enviar").disabled=false;
        }
    })

   document.getElementById("contraseña2").addEventListener("focus",function(){
       document.getElementById("mensajes").setAttribute("style", "display: none");
   })

   




}