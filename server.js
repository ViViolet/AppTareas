var express = require('express');
var bodyParser = require('body-parser');
var mysql = require('mysql');
var fs = require('fs');
var cookieSession = require('cookie-session')

const SELECTTAREAS= "SELECT tarea.id,titulo,descripcion,usr1.nombre AS autor,usr2.nombre AS ejecutor,fecha,estado FROM tarea,usuario AS usr1,usuario AS usr2 WHERE autor=usr1.id AND ejecutor=usr2.id"
const SELECTTAREASID = "SELECT tarea.id,titulo,descripcion,usr1.nombre AS autor, usr1.id AS autorid, usr2.nombre AS ejecutor, usr2.id AS ejecutorid, fecha,estado FROM tarea,usuario AS usr1,usuario AS usr2 WHERE autor=usr1.id AND ejecutor=usr2.id"

var app = express();

var jsonParser = bodyParser.json();
var urlencodedParser = bodyParser.urlencoded({ extended: false });

app.use(jsonParser);
app.use(urlencodedParser);

app.use(cookieSession({
    name: 'session',
    keys: ["SID"],

    // Cookie Options
    maxAge: 24 * 60 * 60 * 1000 // 24 hours
}))


var connection = mysql.createConnection({
    host: 'localhost',
    user: 'root',
    password: '',
    database: 'apptareas'
});
connection.connect(function (err) {
    if (err) {
        throw error;
    } else {
        console.log("Conexion correcta con el servidor")
    }
});


// PUNTOS DE ENTRADA DE MI SERVIDOR

app.get('/', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect('/login');
    } else {
        res.redirect('/tareas');
    }
})

app.get('/registro', function (req, res) {
    fs.readFile("./www/registro.html", "utf-8", function (err, texto) {
        res.send(texto);
    })
});

app.post('/registro', function (req, res) {
    var nombre = req.body.nombre;
    var nickname = req.body.nickname;
    var contraseña = req.body.contraseña;
    var email = req.body.email;

    connection.query("INSERT INTO usuario (nombre,usuario, contraseña,email) values (?,?,?,?)", [nombre, nickname, contraseña, email], function (err, result) { });
    res.send("Usuario introducido correctamente " + nombre);
});

app.get('/login', function (req, res) {
    if (req.session.user != undefined) {
        res.redirect('/tareas');
    } else {
        fs.readFile("./www/login.html", "utf-8", function (err, texto) {
            res.send(texto);
        })
    }
});

app.post('/login', function (req, res) {
    var nickname = req.body.nickname;
    var contraseña = req.body.contraseña;

    connection.query("SELECT * FROM usuario WHERE usuario=? AND contraseña=?", [nickname, contraseña], function (err, result) {
        if (err) {
            throw err
        } else {
            if (result.length > 0) {
                req.session.user = nickname;
                req.session.idUser = result[0].id;
                res.redirect('/tareas');
            } else {
                fs.readFile("./www/login.html", "utf-8", function (err, texto) {
                    texto = texto.replace('class="ocultar">[error]', 'class="mostrar">Usuario o contraseña incorrecto/s');
                    res.send(texto);
                })
            }
        }
    });
});

app.get('/tareas', function (req, res) {
    if (req.session.user == undefined) {
        res.redirect('/login');
    } else {
        fs.readFile("./www/tareas.html", "utf-8", function (err, texto) {
            texto = texto.replace("[usuario]", req.session.user);
            connection.query("SELECT * FROM usuario", function (err, result) {
                let options = "";
                if (err) {
                    throw err
                } else {
                    for (const usuario of result) {
                        options += `<option value='${usuario.id}'>${usuario.nombre}</option>`;
                    }
                }
                texto = texto.split("[ejecutores]").join(options);
                res.send(texto);
            })

        })
    }
});

app.get('/cerrar', function (req, res) {
    req.session = null;
    res.redirect('/login');
})

app.get('/datosuser', function (req, res) {
    console.log(req.session.idUser);
    connection.query("SELECT * FROM usuario WHERE id =?", [req.session.idUser], function (err, result) {
        if (err) {
            throw err;
        } else {
            console.log(result);
            var datos = {
                id: result[0].id,
                nombre: result[0].nombre,
                usuario: result[0].usuario,
                email: result[0].email
            }
            setTimeout(function () {
                res.send(JSON.stringify(datos));
            }, 500);
        }
    })
})


app.post("/datosuser", function (req, res) {
    if (req.body.contraseña == "") {
        res.send("Nook");
    } else {
        connection.query("UPDATE usuario SET nombre =?, email=?, contraseña=? WHERE id=?", [req.body.nombre, req.body.email, req.body.contraseña, req.session.idUser], function (err, result) {
            if (result.affectedRows > 0) {
                res.send("ok");
            } else {
                res.send("nook");
            }

        });
    }
});

app.get('/peticion', function (req, res) {
    res.send("<i class='fas fa-heart'></i>");
})

app.post('/anadirtarea', function (req, res) {
    var result;
    console.log(req.body);
    connection.query("INSERT INTO tarea (titulo,descripcion,fecha,autor,ejecutor) values(?,?,?,?,?)", [req.body.titulo, req.body.descripcion, req.body.fecha, req.session.idUser, req.body.ejecutor], function (err, result) {
        connection.query(SELECTTAREASID, function (error, resultado) {
            resultado.forEach(element => {
                if (req.session.idUser==element.autorid&&req.session.idUser==element.ejecutorid){
                    element.permiso=0;
                }
                if(req.session.idUser==element.autorid&&req.session.idUser!=element.ejecutorid){
                    element.permiso=1
    
                }
                if(req.session.idUser!=element.autorid&&req.session.idUser==element.ejecutorid){
                    element.permiso=2
                }
                if(req.session.idUser!=element.autorid&&req.session.idUser!=element.ejecutorid){
                    element.permiso=3
                }         
    
            })
            if (error) {
                throw error
            } else {
                resultado = formatearfecha(resultado);
                if (err) {
                    console.log(err);
                    result = {
                        estado: 0,
                        idtarea: null,
                        tareas: resultado
                    }
                } else {
                    console.log(result);
                    result = {
                        estado: 1,
                        idtarea: result.insertId,
                        tareas: resultado
                    }
                }
                console.log(result);
                res.send(JSON.stringify(result));
            }
        });
    })
})

app.get("/leertareas", function (req, res) {

    connection.query(SELECTTAREASID, function (error, resultado) {
        console.log(req.session.idUser);
        resultado.forEach(element => {
            if (req.session.idUser==element.autorid&&req.session.idUser==element.ejecutorid){
                element.permiso=0;
            }
            if(req.session.idUser==element.autorid&&req.session.idUser!=element.ejecutorid){
                element.permiso=1

            }
            if(req.session.idUser!=element.autorid&&req.session.idUser==element.ejecutorid){
                element.permiso=2
            }
            if(req.session.idUser!=element.autorid&&req.session.idUser!=element.ejecutorid){
                element.permiso=3
            }         

        })
        console.log(resultado);
        resultado = formatearfecha(resultado);
        res.send(JSON.stringify(resultado));
    });
})

app.get("/eliminartarea/:id?", function (req, res) {
    var respuesta = {};
    console.log("Eliminando tarea" + req.query.id);
    connection.query("DELETE FROM tarea WHERE tarea.id = ?", [req.query.id], function (err, result) {
        connection.query(SELECTTAREASID, function (error, resultado) {
            resultado.forEach(element => {
                if (req.session.idUser==element.autorid&&req.session.idUser==element.ejecutorid){
                    element.permiso=0;
                }
                if(req.session.idUser==element.autorid&&req.session.idUser!=element.ejecutorid){
                    element.permiso=1
    
                }
                if(req.session.idUser!=element.autorid&&req.session.idUser==element.ejecutorid){
                    element.permiso=2
                }
                if(req.session.idUser!=element.autorid&&req.session.idUser!=element.ejecutorid){
                    element.permiso=3
                }         
    
            })
            resultado = formatearfecha(resultado);
            if (err) {
                throw err;
                respuesta = {
                    estado: 0,
                    tareas: resultado
                }
            } else {
                respuesta = {
                    estado: 1,
                    tareas: resultado
                }
            }
            res.send(JSON.stringify(respuesta));
        })
    })
})


app.get("/gettarea:id?",function(req,res){
    let datos={
        usuarios:[]
    };
    connection.query("SELECT tarea.id as idtarea,titulo,descripcion,autor as autorid,ejecutor as ejecutorid,fecha,estado,usuario.id as usuarioid,nombre FROM tarea RIGHT JOIN usuario on tarea.id=? and autor=usuario.id", [req.query.id], function(err,result){
          for (const iterator of result) {
              if(iterator.idtarea){
                  datos.tarea={
                      id:iterator.idtarea,
                      titulo:iterator.titulo,
                      descripcion:iterator.descripcion,
                      autor:iterator.autorid,
                      ejecutor:iterator.ejecutorid,
                      fecha:iterator.fecha,
                      estado:iterator.estado,
                  }
              }
              if(iterator.usuarioid){
                  let user={
                      id:iterator.usuarioid,
                      nombre:iterator.nombre,
                  }
                  datos.usuarios.push(user);
              }
          }
        res.send(JSON.stringify(datos));
    })
})


app.post("/actualizartarea",function(req,res){
    var result;
    connection.query( "UPDATE tarea SET titulo = ?, descripcion = ?, ejecutor = ? WHERE tarea.id = ?", [req.body.titulo, req.body.descripcion, req.body.ejecutor, req.body.id], function (err, result) {
        connection.query(SELECTTAREASID, function (error, resultado) {
            resultado.forEach(element => {
                if (req.session.idUser==element.autorid&&req.session.idUser==element.ejecutorid){
                    element.permiso=0;
                }
                if(req.session.idUser==element.autorid&&req.session.idUser!=element.ejecutorid){
                    element.permiso=1
    
                }
                if(req.session.idUser!=element.autorid&&req.session.idUser==element.ejecutorid){
                    element.permiso=2
                }
                if(req.session.idUser!=element.autorid&&req.session.idUser!=element.ejecutorid){
                    element.permiso=3
                }         
            })
            if (error) {
                throw error
            } else {
                resultado = formatearfecha(resultado);
                if (err) {
                    console.log(err);
                    result = {
                        estado: 0,
                        idtarea: null,
                        tareas: resultado
                    }
                } else {
                    console.log(result);
                    result = {
                        estado: 1,
                        idtarea: result.insertId,
                        tareas: resultado
                    }
                }
                console.log(result);
                res.send(JSON.stringify(result));
            }
        });
    })
})

app.get("/cambioestado/:id?",function(req,res){
    connection.query("UPDATE tarea SET estado = 1 WHERE tarea.id = ?", [req.query.id],function(err,result){
        if(err){
            throw err;
        }else{
            connection.query(SELECTTAREASID, function (error, resultado) {
                resultado.forEach(element => {
                    if (req.session.idUser==element.autorid&&req.session.idUser==element.ejecutorid){
                        element.permiso=0;
                    }
                    if(req.session.idUser==element.autorid&&req.session.idUser!=element.ejecutorid){
                        element.permiso=1
        
                    }
                    if(req.session.idUser!=element.autorid&&req.session.idUser==element.ejecutorid){
                        element.permiso=2
                    }
                    if(req.session.idUser!=element.autorid&&req.session.idUser!=element.ejecutorid){
                        element.permiso=3
                    }         
                })
                if (error) {
                    throw error
                } else {
                    resultado = formatearfecha(resultado);
                    if (err) {
                        console.log(err);
                        result = {
                            estado: 0,
                            tareas: resultado
                        }
                    } else {
                        console.log(result);
                        result = {
                            estado: 1,
                            tareas: resultado
                        }
                    }
                    console.log(result);
                    res.send(JSON.stringify(result));
                }
            });
        }
    });
})

app.use(express.static('www'));

// INICIO DEL SERVIDOR
var server = app.listen(3000, function () {
    console.log('Servidor web iniciado');
});


function formatearfecha(resultado) {
    for (let i = 0; i < resultado.length; i++) {
        var d = new Date(String(resultado[i].fecha));
        var formatfecha = [d.getDate(), d.getMonth() + 1, d.getFullYear()].join('-');
        resultado[i].fecha = formatfecha;
    }
    return resultado;
}

