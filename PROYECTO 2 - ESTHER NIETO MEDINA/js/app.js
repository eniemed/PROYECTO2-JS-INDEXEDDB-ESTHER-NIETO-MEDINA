/* PROYECTO 2. ESTHER NIETO MEDINA  2º DAW */

// SELECTORES
const nombreFormulario = document.querySelector("#nombre")
const correoFormulario = document.querySelector("#email")
const telefonoFormulario = document.querySelector("#telefono")
const empresaFormulario = document.querySelector("#empresa")

const botonAgregar = document.querySelector("#formulario input[type='submit']")

const listaHTML = document.querySelector("#listado-clientes")

// LISTENERS
nombreFormulario.addEventListener("blur", validarFormulario)
correoFormulario.addEventListener("blur", validarFormulario)
telefonoFormulario.addEventListener("blur", validarFormulario)
empresaFormulario.addEventListener("blur", validarFormulario)

botonAgregar.addEventListener("click", añadirClienteDataBase)

//DECLARACIONES
let DB = "" 

let listaClientes = []

let clave

//ABRIENDO BASE DE DATOS INDEXEDDB
//eliminarBD() //Uso este método para resetear todo. Lo dejo comentado y lo descomento cuando necesito borrar todo para probar cosas

const request = indexedDB.open('miBase', 1) //Abro la base de datos en su versión primera

request.onerror = () => {
    console.error("Error al abrir la base de datos")
}

request.onsuccess = (evento) => {
    console.log("Base de datos abierta")
    DB = evento.target.result //guardo la base de datos

    
}

request.onupgradeneeded = (evento) => { //onupgradeneeded le doy el valor a la bbdd, creo el almacén con clave primaria autoincrementada y creo los campos
    DB = evento.target.result
    const almacen = DB.createObjectStore("clientes", {autoIncrement: true})

    almacen.createIndex("nombre", "nombre", {unique: false})
    almacen.createIndex("email", "email", {unique: true})
    almacen.createIndex("telefono", "telefono", {unique: true})
    almacen.createIndex("empresa", "empresa", {unique: false})
}

function añadirClienteDataBase(e) { //esta función añade los clientes a la base de datos
    e.preventDefault()

    let transaccion = DB.transaction(["clientes"], "readwrite")
 
    let store = transaccion.objectStore("clientes")

    let objetoCliente = { //creo un objeto para guardarlo 
        nombre: nombreFormulario.value.trim(),
        email: correoFormulario.value.trim(),
        telefono: telefonoFormulario.value.trim(),
        empresa: empresaFormulario.value.trim(),
    }


    let requestAñadir = store.add(objetoCliente) //añado el objeto a la bbdd

    requestAñadir.onsuccess = function(evento) {
        console.log("Agregado con éxito")
        clave = evento.target.result //guardo su clave primaria para poder eliminarlo más adelante
        cargarClientesDesdeDB() //actualizo la lista dinámica
        
    }

    requestAñadir.onerror = function(event) {
        console.error("Error al agregar", event)
    }
    
}

// FUNCIONES
desactivarBoton() //empiezo con el botón desactivado para eviar problemas de añadir datos vacíos. Luego lo activo con condiciones

function validarFormulario(e) { //esta función se encarga de comprobar que los valores introducidos son correctos, si no lo son muestra una alerta. Si todo es correcto activa el botón para agregar
    
    desactivarBoton()

    const nombre = nombreFormulario.value.trim()
    const email = correoFormulario.value.trim()
    const telefono = telefonoFormulario.value.trim()
    const empresa = empresaFormulario.value.trim()

    if (e.target.value.trim() === "") {
        limpiarAlerta(e.target.parentElement)
        desactivarBoton()
        mostrarAlerta(`El campo ${e.target.id} es obligatorio`, e.target.parentElement)  //para que aparezca bajo la caja que es
        comprobarEmail(email)
        comprobarTelefono(telefono)
        return
    }

    if (e.target.id === "email" && !comprobarEmail(email)) {
        mostrarAlerta("El email no es válido", e.target.parentElement)
        return
    }

    if (e.target.id === "telefono" && !comprobarTelefono(telefono)) {
        mostrarAlerta("El teléfono no es válido", e.target.parentElement)
        return
    }

    if (nombre !== "" && email !== "" && telefono !== "" && empresa !== "" && comprobarEmail(email) && comprobarTelefono(telefono)) {

        activarBoton()
    } else {
        desactivarBoton()
    }

    limpiarAlerta(e.target.parentElement) //limpio las alertas para evitar que se dupliquen

    //compruebo valores
    comprobarEmail(email)
    comprobarTelefono(telefono)
}

function desactivarBoton() { //función que desactiva el botón. Le añado la clase de transparencia para que se note que está desactivado. Le quito la animación de hover
    botonAgregar.disabled = true
    botonAgregar.classList.add("opacity-50")
    botonAgregar.classList.remove("hover:bg-teal-900")
}

function activarBoton() { //función que activa el botón. Le quito la opacidad reducida y le añado el hover.
    botonAgregar.disabled = false
    botonAgregar.classList.remove("opacity-50")
    botonAgregar.classList.add("hover:bg-teal-900")
}

function comprobarEmail(email) { //valida el email con expresión regular
    const regex = /^\w+([.-_+]?\w+)*@\w+([.-]?\w+)*(\.\w{2,10})+$/
    return regex.test(email)
}

function comprobarTelefono(telefono) { //valida el telefono con expresión regular. Que empiece por un num de 0 a 9 y tenga 9 dígitos
    const regex = /^[0-9]\d{8}$/
    return regex.test(telefono)
}

function mostrarAlerta(mensaje, referencia) { //tiene que recibir un mensaje para ser reutilizable, la referencia sirve para colocar la alerta bajo el campo correcto

    limpiarAlerta(referencia) //limpio las posibles alertas por si ya hay una para que la sustituya y no se acumulen

    const error = document.createElement("p")
    error.textContent = mensaje
    error.classList.add("bg-red-600", "text-center", "text-white", "p-2")
    referencia.appendChild(error) //introduzco la alerta bajo el campo correspondiente

}

function limpiarAlerta(referencia) { //esta función eliminar la alerta si la encuentra en la referencia
    const alerta = referencia.querySelector(".bg-red-600")
    if (alerta) {
        alerta.remove()
    }
}

function cargarClientesDesdeDB() { //recorre la bbdd de indexeddb con un cursor y lo pasa todo a la lista. De esta manera podemos trabajar solo en la bbdd y la lista se podrá actualizar sola
    listaClientes = [] //para evitar duplicaciones, vaciamos la lista

    const transaccion = DB.transaction(["clientes"], "readonly") //abrimos una transaccion en el almacén
    const store = transaccion.objectStore("clientes")

    store.openCursor().onsuccess = function (event) { //abrimos el cursor para recorrer el almacén
        const cursor = event.target.result
        if (cursor) {
            listaClientes.push(cursor.value) //metemos los objetos en la lista
            cursor.continue()
        }
    }

    transaccion.oncomplete = function () {
        mostrarLista() //cuando se termina la transacción, mostramos la lista para que se actualice
    }
}


function mostrarLista() { //crea la lista al vuelo con los botones de eliminar y editar correspondientes. Añade los valores a cada celda para que se muestre correctamnente

    const botonEliminar = document.createElement("button")
    const botonEditar = document.createElement("button")
    const tr1 = document.createElement("tr")
    const tr2 = document.createElement("tr")
    const celda1 = document.createElement("td")
    const celda2 = document.createElement("td")
    const celda3 = document.createElement("td")
    const celda4 = document.createElement("td")
    const celda5 = document.createElement("td")
    const celda6 = document.createElement("td")

    botonEliminar.textContent = "ELIMINAR"
    botonEditar.textContent = "EDITAR"

    celda5.appendChild(botonEditar)
    celda6.appendChild(botonEliminar)

    tr2.appendChild(celda5)
    tr2.appendChild(celda6)

    listaClientes.forEach((elemento) => {
        celda1.textContent = elemento.nombre
        celda2.textContent = elemento.email
        celda3.textContent = elemento.telefono
        celda4.textContent = elemento.empresa
        botonEditar.classList.add("esquinas-redondeadas", "boton-editar") //clases que he creado para hacer los botones más atractivos
        botonEliminar.classList.add("esquinas-redondeadas", "boton-eliminar")
        
        botonEliminar.setAttribute("data-id", elemento.email) //almaceno el email para usarlo como clave del objeto a borrar de la lista, ya que el email es único (al igual que el telefono)
    })
    
    tr1.appendChild(celda1)
    tr1.appendChild(celda2)
    tr1.appendChild(celda3)
    tr1.appendChild(celda4)
    tr1.appendChild(tr2)

    listaHTML.appendChild(tr1)

    botonEditar.addEventListener("click", editarCliente)
    botonEliminar.addEventListener("click", eliminarCliente)
}

function eliminarCliente(e) { //elimina un cliente de la base de datos y de la lista
    
    e.preventDefault()

    var transaccion = DB.transaction(["clientes"], "readwrite") //abrimos transacción en el almacén
    var objectStore = transaccion.objectStore("clientes")

    var deleteRequest = objectStore.delete(parseInt(clave)) //borramos elemento por clave

    deleteRequest.onsuccess = function(event) {
        console.log("Cliente eliminado correctamente")
        e.target.parentElement.parentElement.remove()
    }

    deleteRequest.onerror = function(event) {
        console.error("Error al eliminar el cliente: ", event.target.errorCode)
    }

    console.log("borrando...")
    const claveEmail = e.target.getAttribute("data-id") //recuperamos el email para usarlo de clave de borrado en la lista

    listaClientes = listaClientes.filter((cliente) => cliente.email !== claveEmail) //filtrado por email
}

function editarCliente(){
    console.log("editar")
}

function eliminarBD() { //función que elimina la bbdd y el almacén para hacer pruebas, comentado en el código
    var solicitudEliminar = indexedDB.open("miBase", 1)

    solicitudEliminar.onsuccess = function (evento) {
        DB = evento.target.result
        DB.close()

        var solicitudEliminacion = indexedDB.deleteDatabase("miBase")

        solicitudEliminacion.onsuccess = function () {
            console.log("Base de datos y almacén eliminados con éxito")
        }

        solicitudEliminacion.onerror = function () {
            console.error("Error al eliminar la base de datos y el almacén")
        }
    }

}