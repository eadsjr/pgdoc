
# pgdoc

## CRUD Examples

> When working with databases you generally want to have [CRUD Functionality][CRUD].

> That is, the ability to CREATE, RETRIEVE, UPDATE and DELETE data.

> Here are some Javascript examples of how to do this using `pgdoc`.

For these examples to work, you must have first have completed the [install process for you operating system][install].

Once that is done and the server is running, you can run `node` to drop into a REPL interactive session or put these example lines of code into a Javascript file and run them with `node myFile.js`.

First we need to include the pgdoc module.

``` js
const pgdoc = require("pgdoc")
const str   = pgdoc.JSON.stringify
const parse = pgdoc.JSON.parse
```

Alternately, if you are in the pgdoc github project, you would load it from the relative path to the pgdoc code.

``` js
const pgdoc = require("./code/node/pgdoc")
const str   = pgdoc.JSON.stringify
const parse = pgdoc.JSON.parse
```

This gives you access to pgdoc's library interface and some handy aliases.

Now you need to connect to postgres. There must be a [postgres server configured for use with pgdoc][install] running on the local system for this example to work.

You should have set up some of connection details during the install script, which you now need to provide to your program.

``` js
let connect = async () => {
  let password = `password` /* the password to access the database */
  let domain   = `127.0.0.1` /* database domain path. 127.0.0.1 if local */
  let port     = `5432` /* 5432 is postgres default. It's a major security risk not to change this if you put it online! */
  let connectionString = `postgres://pgdoc:${password}@${domain}:${port}/pgdoc`
  let rv = await pgdoc.connect(connectionString)
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`pgdoc connected to the database successfully.`)
  }
}
connect()
```

The return value, here called `rv` will either be an a pgdoc error or a simple object indicating success. If it is a pgdoc error, its details can be observed by accessing the appropriate members.

Assuming you were able to connect successfully, you can now start using the methods detailed below.

### CREATE

Now we can store a Javascript object in postgres by simply calling `pgdoc.store()`.

``` js
let storeBasic = async () => {
  let docType = "player"
  let myDoc = { name: "John Smith", age: 42, team: "red", id: "-7" }
  let rv = await pgdoc.store( docType, myDoc )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`record stored`)
  }
}
storeBasic()
```

> Note that if you run this code twice it will create two identical records in the database. Methods to avoid this are explored in the UPDATE section.

You can store more complex objects using the same method.

```js
let storeComplex = async () => {
  let complexObject = { data: {}, evenMoreData: {} }
  let docType = "player"
  let myDoc = { name:"Jane Doe", age:25, team:"red", config:complexObject, id: "-8" }
  let rv = await pgdoc.store( docType, myDoc )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`record stored`)
  }
}
storeComplex()
```

You can also store valid JSON strings directly. This can be especially useful when passing stuff through from the client, but it is important that you validate that the incoming data is not malicious, malformed or corrupted.

``` js
let storeString = async () => {
  // SECURITY NOTE: Don't forget to verify incoming data from client is not malicious or malformed!
  let docType = "player"
  let myDoc = `{ "name":"Bob Smith", "age":42, "team":"red", id: "-9" }`
  let rv = await pgdoc.store( docType, myDoc )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`record stored`)
  }
}
storeString()
```

Though `pgdoc` will attempt to error out should you pass it anything too suspicious, it is ultimately your responsibility to ensure that broken or malicious data isn't hi-jacking your server or being passed through to the database.

This string method is useful if you need some template JSON that will be reused often. You can embed dynamic information in it pretty easily.

``` js
let storeDynamicString = async () => {
  // SECURITY NOTE: Don't forget to verify dynamic data from client is not malicious or malformed!
  let complexObject = { data: {}, evenMoreData: {} }
  let docType = "player"
  let myDoc = `{ "name":"Tammy Smith", "age":25, "team":"blue", "config":${str(complexObject)}, id: "-10" }`
  let rv = await pgdoc.store( docType, myDoc )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`record stored`)
  }
}
storeDynamicString()
```

You can request an ID with `pgdoc.requestID` to store inside the object and make finding it again easier. This ID is a simple integer, but every time it is requested from the database by a server it will be incremented by one. A separate counter sequence is used for each document type.

You should verify you were able to get an ID before using it. Valid IDs will be 1 or greater.

``` js
let storeBasicWithID = async () => {
  let docType = "player"
  let id = await pgdoc.requestID(docType)
  if( id.error ) {
    console.error(`${id.label}: ${id.description}`)
  }
  else {
    console.log(`collected id: ${id}`)
    let myDoc = { name:"John Smith", age:33, team:"red", id:id }
    let rv = await pgdoc.store( docType, myDoc )
    if( rv.error ) {
      console.error(`${rv.label}: ${rv.description}`)
    }
    else {
      console.log(`record stored`)
    }
  }
}
storeBasicWithID()
```

Because the ID is sequential and gives insight into your data, you don't want it to be accessible outside your system for security reasons. If you need to pass objects to clients you should rebuild or prune them to remove any data that the client does not need, including the ID number for it in the database.

If you need an ID to coordinate with the client you should generate one yourself and map it to the server ID for the object.

You can store the id and other metadata outside your data object by nesting them inside another object. This way you aren't 'polluting' your data with extra stuff.

``` js
let storeWithMetadata = async () => {
  let docType = "player"
  let myData = { name:"John Calhoun", age:22, team:"blue" }
  let id = await pgdoc.requestID(docType)
  if( id.error ) {
    console.error(`${id.label}: ${id.description}`)
  }
  else {
    console.log(`collected id: ${id}`)
    myMetaData = { timestamp: Date.now(), id: id }
    myDoc = { meta: myMetaData, data: myData }
    rv = await pgdoc.store( docType, myDoc )
    if( rv.error ) {
      console.error(`${rv.label}: ${rv.description}`)
    }
    else {
      console.log(`record stored`)
    }
  }
}
storeWithMetadata()
```

Of course if you do this, you must also unpack it before use.

``` js
  myData = docFromDatabase.data
```


### RETRIEVE

You get documents back out by performing a search in the form of an Object. `pgdoc.retrieve()` always returns a list. To get a single document, use something unique like an ID and verify the list size is 1.

```js
let retrieveBasic = async ( ID ) => {
  docType = "player"
  mySearch = { id: ID }
  rv = await pgdoc.retrieve(docType, mySearch)
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    if( `length` in rv ) {
      if( rv.length < 1 ) {
        console.log(`No document found...`)
      }
      else if ( rv.length == 1 ) {
        console.log(`Document retrieved.`)
      }
      else if ( rv.length > 1 ) {
        console.log(`Multiple results for given ID!`)
      }
    }
    console.log(rv) /// A list of zero or more documents
  }
}
retrieveBasic("1")
```

This works with any information specific to one document.

```js
let retrieveByName = async ( name ) => {
  docType = "player"
  mySearch = { name }
  rv = await pgdoc.retrieve(docType, mySearch)
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    if( `length` in rv ) {
      if( rv.length < 1 ) {
        console.log(`No document found...`)
      }
      else if ( rv.length == 1 ) {
        console.log(`Document retrieved.`)
      }
      else if ( rv.length > 1 ) {
        console.log(`Multiple results for given name!`)
      }
    }
    console.log(rv) /// A list of zero or more documents
  }
}
retrieveByName("Jane Doe")
```

You can retrieve multiple documents by simply searching a shared member.

``` js
let retrieveMulti = async () => {
  docType = "player"
  mySearch = { team: "red" }
  rv = await pgdoc.retrieve( docType, mySearch )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(rv) /// A list of zero or more documents
    for( doc in rv ) {
      // <- application logic here
    }
  }
}
retrieveMulti()
```


### UPDATE

It is very simple to overwrite a document.

``` js
let storeOverwrite = async () => {
  /// First perform a simple store
  let docType = "player"
  let oldDoc  = { name: "Bill Smith", age:43, team: "red", id: "-1" }
  rv = await pgdoc.store( docType, oldDoc )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    // Now overwrite a the stored data with a specific alternative value
    console.log(`document stored with age: 43`)
    let newDoc  = { name: "Bill Smith", age: 44, team: "red", id: "-1" }
    let mySearch = { id: "-1" }
    rv = await pgdoc.store( docType, newDoc, mySearch )
    if( rv.error ) {
      console.error(`${rv.label}: ${rv.description}`)
    }
    else {
      if( rv.deleted == 1 ) {
        console.log(`Document was overwritten successfully`)
      }
      else if ( rv.deleted == 0 ) {
        console.warn(`Document was written to database, but previous version not found`)
      }
      else {
        console.error(`Document was written to database, and ${rv.deleted} documents were deleted. Something went wrong.`)
      }
    }
  }
}
storeOverwrite()
```
