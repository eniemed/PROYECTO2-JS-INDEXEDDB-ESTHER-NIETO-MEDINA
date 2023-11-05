---
marp: true
---
###### Esther Nieto Medina 2º DAW
# PROYECTO 2: Guía de uso de IndexedDB

Según la página web https://es.javascript.info/indexeddb#:~:text=IndexedDB%20es%20una%20base%20de,rango%20por%20clave%2C%20e%20%C3%ADndices IndexedDB es una base de datos incrustada en el navegador, una mucho mejor opción que localStorage.

Una de sus mejores ventajas es que el almacén se realiza mediante claves y valores. Esto hace las consultas y en general el trabajo con IndexedDB mucho más fácil y preciso, además de permitirnos almacenar una cantidad mucho mayor de datos que localStorage.

#### ABRIR LA BASE DE DATOS

Para empezar a usar IndexedDB, el primer paso es abrir una base de datos. Para ello debemos usar "open" de la siguiente manera:
~~~
let openRequest = indexedDB.open(name, version);
~~~
donde "name" es el nombre de la base de datos que queramos establecer y "version" es un número entero mayor que 0 y que sirve para marcar la versión en la que se encuentra nuestra base de datos, para cuando sea actualizar poder controlar las versiones. Si no añadimos valor, estará predeterminadamente en 1.

Controlamos una serie de eventos con "upgradeneeded" si la versión es anterior a una ya existente, "onsuccess" cuando todo está correctamente y "onerror" cuando ocurre algún error.

#### USO DE INDEXEDDB

Para almacenar un dato en la base de datos usamos un almacén de objetos, lo que equivale a una tabla en otras bases de datos que hemos usado en el pasado. Podemos tener una tabla para cada distinción que queramos hacer: "clientes", "empleados", etc.

Para guardar un valor en una tabla, debemos asignarle una clave a dicho valor, la cual debe ser un número, fecha, string, binario o un array, y debe ser único.

Para crear un almacén de objetos se usa la siguiente sintaxis:
~~~
db.createObjectStore(name[, keyOptions]);
~~~
donde "name" es el nombre del almacén y keyOptions es un objeto opcional con una ruta que será usada como clave ("keyPath"), o un "autoIncrement" que, en el caso de ser "true", será la clave para el nuevo dato que sea almacenado, siendo un número autoincremental generado automáticamente.

Si no añadimos un valor y solo ponemos el nombre del almacén, será obligatorio añadir una clave más tarde cuando añadamos el primer objeto a dicho almacén.

Un ejemplo de keyPath es:
~~~
db.createObjectStore('books', {keyPath: 'id'});
~~~
#### OPERACIONES

Los resultados de todas las operaciones realizadas con IndexedDB están vinculados, por lo que deben de estar todas correctas, o fallarán todas. Esto es así para asegurar que no hay un problema mayor, por ejemplo:

Tenemos dos operaciones a realizar.

<li>Quitar dinero a una cuenta tras una compra.</li>
<li>Agregar el producto comprado a su inventario.</li>
<br>
Si la primera se completase pero la segunda fallase, sería un problema mucho mayor que si fallasen las dos. Por esto IndexedDB funciona de esta manera.

Iniciamos una transacción de la siguiente manera:
~~~
db.transaction(store[, type]);
~~~
Donde store es el nombre del almacén al que queremos acceder para realizar la transacción. Si queremos acceder a varios, debemos proporcionar un array de nombres de almacenes.

Type se corresponde al tipo de transacción, que puede ser:

<li>readonly: Solo de lectura, el cual es el predeterminado si no añadimos valor.</li>
<li>readwrite: De lectura y escritura (pero no permite crear/quitar/modificar el almacén)</li>
<br>
Esto hay que tenerlo en cuenta sobre todo por el rendimiento de nuestro programa. Readonly permite la lectura de un almacén simultáneamente a otras operaciones o lecturas, pero readwrite no permite hacer esto, ya que bloquea el almacén para realizar la escritura en él y prevenir errores.

Una vez hemos creado la transacción, la obtenemos así:
~~~
let ejemplo = transaction.objectStore("ejemplo");
~~~
Ahora podemos crear un objeto y añadirlo de la siguiente manera:

~~~
let request = ejemplo.add(objeto);
~~~
Y ahora podríamos definir los eventos de los que hablamos anteriormente. Vamos a hacerlo para verlo todo junto en el mismo ejemplo y que quede clara su funcionalidad:

~~~
request.onsuccess = function() {
	console.log("Objeto añadido con éxito al almacén", request.result);
};
~~~
~~~
request.onerror = function() {
	console.log("Error", request.error);
};
~~~
Así quedaría completa nuestra primera transacción.

Para repasar los pasos para dicha transacción, este índice escrito en la página web que referencié al principio es muy útil:

Crear la transacción con el nombre de todos los almacenes a los que queremos acceder.
Obtener el almacén con objectStore.
Hacer una petición con, por ejemplo, .add.
Manejar errores y éxitos de la petición con error o success.

Para almacenar un valor, podemos usar dos métodos. El que usamos anteriormente (".add(value, [key])") o .put, que igualmente debe añadirse con un valor, pero que la clave será obligatoria sólo cuando no se añada un keyPath o autoIncrement. En caso de tener añadir una clave que ya pertenece a otro valor, este valor será reemplazado por el nuevo, por eso hay que tener cuidado.

#### BÚSQUEDAS/CONSULTAS

Podemos buscar y recibir un campo del objeto de la base de datos con un índice. Para obtener dicho índice y poder acceder al campo/objeto deseado, lo haremos con esta sintaxis:
~~~
objectStore.createIndex(name, keyPath, [options])
~~~
Donde name es el nombre del índice, keyPath es la ruta al campo del objeto deseado y options hace referencia a las propiedades unique o multiEntry, según el valor del campo pueda  o no repetirse. En caso de que sea multiEntry true, se obtendrá un array con los valores almacenados.

En la página referenciada al principio hay un ejemplo muy detallado que ayuda mucho a entender la mecánica de una consulta:
~~~
let transaction = db.transaction("books"); // readonly 
let books = transaction.objectStore("books"); 
let priceIndex = books.index("price_idx"); 

let request = priceIndex.getAll(10); 

request.onsuccess = function() { 
if (request.result !== undefined) { 
console.log("Books", request.result); // array de libros con precio = 10 
} else { 
console.log("No hay libros así"); 
} 
};
~~~
También usamos cursores para recorrer un almacén y con getAll/getAllKeys recibimos un array de claves/valores.

Abrimos el cursor de esta forma:
~~~
let request = store.openCursor(query, [direction]);
~~~
Donde query es una clave o rango de claves y directions es el orden que se va a usar, que puede ser "next" (predeterminado), "prev" (inverso) o "nextunique"/"prevunique", que salta registros con la misma clave en orden predeterminado o inverso.

#### BORRAR ALMACÉN DE OBJETOS

Para borrar un almacén de objetos existente, usamos esta sintaxis:
~~~
db.deleteObjectStore("name")
~~~
Donde name es el nombre de dicho almacén.

#### CERRAR LA BASE DE DATOS

Por último, vamos a aprender a cerrar una base de datos existente, algo que es bastante simple. 

Para ello usaremos "deleteRequest(name)" donde name es el nombre de la base creada.

Así finaliza la guía personal que he desarrollado para entender y reforzar mi aprendizaje de IndexedDB, herramienta que he encontrado muy útil e interesante, y que definitivamente seguiré usando en el futuro y aprendiendo cada vez más sobre ella.
