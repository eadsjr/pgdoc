
# pg-doc

## CRUD Examples

When working with databases you generally want to have [CRUD Functionality][CRUD].

That is, the ability to CREATE, RETRIEVE, UPDATE and DELETE data.

Here are some Javascript examples of how to do this using `pg-doc`.

For these examples to work, you must have first run the install script.

Then in your Javascript file include the module.

``` js
const pgdoc = require("pg-doc")
const str   = pgdoc.stringify
const parse = pgdoc.parse
```

This gives you access to pgdoc and some handy aliases.

Now you need to connect to postgres. There must be a running postgres server on the local system for this example to work.

You should have set up some of connection details during the install script, which you now need to provide to your program.

``` js
password = `password` /* the password to access the database */
domain   = `127.0.0.1` /* database domain path. 127.0.0.1 if local */
port     = `5432` /* 5432 is postgres default. It's a major security risk not to change this if you put it online! */
connectionString = `postgres://pgdoc:${password}@${domain}:${port}/pgdoc`
errorCode = pgdoc.connect(connectionString)
if(errorCode == 0 ) {
  console.log(`pg-doc connected to the database successfully`)
}
else {
  console.error(pgdoc.errorMessage(errorCode))
}
```

As you can see, this returns an `errorCode`. This integer can be converted to a printable error message by passing it to `pgdoc.errorMessage()`.

Assuming you were able to connect successfully, you can now start using the methods detailed below.

### CREATE

Now we can store a Javascript object in postgres by simply calling `pgdoc.store()`.

``` js
// Store a basic object
docType = "player"
myDoc = { name:"John Smith", age:42, team:"red" }
errorCode = pgdoc.store( docType, myDoc )
````

You can store more complex objects using the same method.

```js
// Store a more complex object
complexObject = { data: {}, evenMoreData: {} }
docType = "player"
myDoc = { name:"John Smith", age:42, team:"red", config:complexObject }
errorCode = pgdoc.store( docType, myDoc )
```

### RETRIEVE

### UPDATE

### DELETE



[CRUD]:https://en.wikipedia.org/wiki/Create,_read,_update_and_delete