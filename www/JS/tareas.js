window.onload = function () {

    actualizartabla()


    //     var tareas=[
    //     //     {
    //     //     titulo:"aaa",
    //     //     descripcion:"bbb",
    //     //     autor:"ccc",
    //     //     ejecutor: "ddd",
    //     //     fecha:"2/3/2018",
    //     //     estado:0
    //     // },{
    //     //     titulo:"aaab",
    //     //     descripcion:"bbbc",
    //     //     autor: "cccd",
    //     //     ejecutor: "ddde",
    //     //     fecha:"2/2/2018",
    //     //     estado:0
    //     // }
    //  ];
    //     llenartablatareas(tareas);


    document.getElementById("botonpeticion").onclick = function () {
        var req = new XMLHttpRequest();
        req.open("GET", "/peticion", true);

        req.addEventListener("load", function () {
            console.log("Petición completada")
            if (req.status >= 200 && req.status < 400) {
                // Llamada ala función callback pasándole la respuesta
                document.getElementById("datos").innerHTML = req.responseText;
            } else {
                console.error(req.status + " " + req.statusText);
            }
        });
        req.addEventListener("error", function () {
            console.error("Error de red");
        });


        req.send(null);
    }

    this.document.getElementById("user").onclick = function () {
        if (document.getElementById("useroptions").getAttribute("class") == "dropdown") {
            document.getElementById("useroptions").setAttribute("class", "dropdownver");
        } else {
            document.getElementById("useroptions").setAttribute("class", "dropdown");
        }
    }



    this.document.getElementById("datosusuario").onclick = function (event) {
        event.preventDefault();
        document.getElementById("loader").setAttribute("class", "loader mostrar")
        var req = new XMLHttpRequest();
        req.open("GET", "/datosuser", true);
        req.addEventListener("load", function () {
            console.log("Petición completada")
            if (req.status >= 200 && req.status < 400) {
                // Llamada ala función callback pasándole la respuesta
                console.log(req.response);
                var datosuser = JSON.parse(req.response);
                console.log(datosuser);
                document.getElementById("nombre").value = datosuser.nombre;
                document.getElementById("nickname").value = datosuser.usuario;
                document.getElementById("email").value = datosuser.email;
                document.getElementById("listartareas").setAttribute("class", "ocultar");
                document.getElementById("datosuser").setAttribute("class", "mostrar");
                document.getElementById("loader").setAttribute("class", "loader ocultar");
            } else {
                console.error(req.status + " " + req.statusText);
            }
        });
        req.addEventListener("error", function () {
            console.error("Error de red");
        });

        req.send(null);
    }


    this.document.getElementById("enviar").onclick = function (event) {
        event.preventDefault();
        console.log("Enviando datos por post")
        var req = new XMLHttpRequest();
        req.open("POST", "/datosuser", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            if (req.response == "ok") {
                alert("daatos actualizados correctamente");
            } else {
                alert("error al actualizar datos");
            }
        });
        req.addEventListener("error", function () {
            console.log(req.response);
        });
        var datos = {
            nombre: document.getElementById("nombre").value,
            usuario: document.getElementById("nickname").value,
            contraseña: document.getElementById("contraseña").value,
            email: document.getElementById("email").value,
        }
        req.send(JSON.stringify(datos));
    }


    this.document.getElementById("botontarea").onclick = function (ev) {
        ev.preventDefault();
        var req = new XMLHttpRequest();
        req.open("POST", "/anadirtarea", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            console.log(JSON.parse(req.response));
            var respuesta = JSON.parse(req.response);
            if (respuesta.estado == 1) {
                alert("Tarea crada correctamente idtarea: " + respuesta.idtarea);
                document.getElementById("formularionuevatarea").reset();
            } else {
                alert("Error al crear la tarea");
            }
            document.getElementById("creartarea").setAttribute("class", "ocultar");
            llenartablatareas(respuesta.tareas);

        });
        req.addEventListener("error", function () {
            console.log(req.response);
        });
        var datos = {
            titulo: document.getElementById("titulo").value,
            descripcion: document.getElementById("descripcion").value,
            ejecutor: document.getElementById("ejecutor").value,
            fecha: document.getElementById("fecha").value
        }
        req.send(JSON.stringify(datos));
    }


    this.document.getElementById("addtarea").onclick = function () {
        // document.getElementById("listartareas").setAttribute("class", "ocultar");
        if (document.getElementById("creartarea").getAttribute("class") == "ocultar") {
            document.getElementById("creartarea").setAttribute("class", "mostrar");
            document.getElementById("datosuser").setAttribute("class", "ocultar");
        } else {
            document.getElementById("creartarea").setAttribute("class", "ocultar");
        }
    
    }

    this.document.getElementById("actualizacionbotontarea").onclick = function (ev) {
        ev.preventDefault();
        var req = new XMLHttpRequest();
        req.open("POST", "/actualizartarea", true);
        req.setRequestHeader("Content-Type", "application/json");
        req.addEventListener("load", function () {
            console.log(JSON.parse(req.response));
            var respuesta = JSON.parse(req.response);
            if (respuesta.estado == 1) {
                alert("Tarea actualizada correctamente idtarea: " + respuesta.idtarea);
                document.getElementById("formularioactualizartarea").reset();
            } else {
                alert("Error al actualizar la tarea");
            }
            document.getElementById("actualizartarea").setAttribute("class", "ocultar");
            llenartablatareas(respuesta.tareas);

        });
        req.addEventListener("error", function () {
            console.log(req.response);
        });
        var datos = {
            id: document.getElementById("idtarea").value,
            titulo: document.getElementById("actualizaciontitulo").value,
            descripcion: document.getElementById("actualizaciondescripcion").value,
            ejecutor: document.getElementById("actualizacionejecutor").value,
            fecha: document.getElementById("actualizacionfecha").value
        }
        req.send(JSON.stringify(datos));

    }

    document.getElementById('foto').addEventListener('change', handleFileSelect, false);



}


function llenartablatareas(listatareas) {

    console.log(listatareas);
    var contenidotabla = "";
    for (const tarea of listatareas) {
        switch (tarea.permiso) {
            case 0:
                thOptions = `<i class="fas fa-pencil-alt" onclick="peticioneditar(${tarea.id})" ></i>  <i class="fas fa-trash-alt" onclick="peticioneliminar(${tarea.id})"></i>  <i class="fas fa-check-circle" onclick="cambioestado(${tarea.id})" ></i>`;
                break;
            case 1:
                thOptions = `<i class="fas fa-pencil-alt" onclick="peticioneditar(${tarea.id})" ></i>  <i class="fas fa-trash-alt" onclick="peticioneliminar(${tarea.id})"></i>`;
                break;
            case 2:
                thOptions = `<i class="fas fa-check-circle" onclick="cambioestado(${tarea.id})" ></i>`;
                break;
            case 3:
                thOptions = "";
                break;
        }

        var fila = `<tr>
         <th>${tarea.titulo}</th>
         <th>${tarea.descripcion}</th>
         <th>${tarea.autor}</th>
         <th>${tarea.ejecutor}</th>
         <th>${tarea.fecha}</th>
         <th align="center">${tarea.estado}</th>

         <th>${thOptions}</th>
    </tr>`;
        contenidotabla += fila;
    }
    document.getElementById("tablatareas").innerHTML = contenidotabla;

    
}

function peticioneditar(id) {
    var req = new XMLHttpRequest();
    var url = "/gettarea?id=" + id;
    req.open("GET", url, true);
    req.addEventListener("load", function () {
        var datos = JSON.parse(req.response);
        console.log(datos.tarea.id);
        document.getElementById("idtarea").value = datos.tarea.id;
        document.getElementById("actualizaciontitulo").value = datos.tarea.titulo;
        document.getElementById("actualizaciondescripcion").value = datos.tarea.descripcion;
        document.getElementById("actualizacionejecutor").value = datos.tarea.ejecutor;
        document.getElementById("actualizacionfecha").value = String(datos.tarea.fecha).substr(0, 10);
        document.getElementById("actualizartarea").setAttribute("class", "mostrar");

    });
    req.addEventListener("error", function () {

    });
    req.send(null);
}

function peticioneliminar(id) {
    console.log(id)
    var req = new XMLHttpRequest();
    var url = "/eliminartarea?id=" + id;
    req.open("GET", url, true);
    req.addEventListener("load", function () {
        var resultado = JSON.parse(req.response);
        if (resultado.estado == 1) {
            alert("Tarea eliminada");
        }
        llenartablatareas(resultado.tareas);
    })
    req.send(null)
}


function actualizartabla() {
    var req = new XMLHttpRequest();
    req.open("GET", "/leertareas", true);
    req.addEventListener("load", function () {
        llenartablatareas(JSON.parse(req.response));
    })
    req.addEventListener("error", function (err) {
    })
    req.send(null);
}

function cambioestado(id) {
    var req = new XMLHttpRequest();
    var url = "/cambioestado?id=" + id;
    req.open("GET", url, true);
    req.addEventListener("load", function () {
        console.log(req.response);
        var datos = JSON.parse(req.response);
        llenartablatareas(datos.tareas);
    })
    req.addEventListener("error", function () {
    })
    req.send(null)
}

function handleFileSelect(evt) {
    var files = evt.target.files; // FileList object

    // files is a FileList of File objects. List some properties.
    var output = [];
    for (var i = 0, f; f = files[i]; i++) {
      output.push('<li><strong>', escape(f.name), '</strong> (', f.type || 'n/a', ') - ',
                  f.size, ' bytes, last modified: ',
                  f.lastModifiedDate.toLocaleDateString(), '</li>');
    }
    console.log (output);
  }

