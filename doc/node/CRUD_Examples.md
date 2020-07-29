
# pgdoc

## CRUD Examples

[Click here for a shorter and less verbose version of this document.][terse]

> When working with databases you generally want to have [CRUD Functionality][CRUD].

> That is, the ability to CREATE, RETRIEVE, UPDATE and DELETE data.

> Here are some Javascript examples of how to do this using `pgdoc`.

For these examples to work, you must have first have completed the [install process for you operating system][install].

Once that is done and the server is running, you can run `node` to drop into a REPL interactive session or put these example lines of code into a Javascript file and run them with `node myFile.js`.

First we need to require the pgdoc module.

``` js
const pgdoc = require(`pgdoc-nosql`)
const str   = pgdoc.JSON.stringify
const parse = pgdoc.JSON.parse
```

Alternately, if you are in the pgdoc github project, you would load it from the relative path to the pgdoc code.

``` js
const pgdoc = require(`./code/node/pgdoc`)
const str   = pgdoc.JSON.stringify
const parse = pgdoc.JSON.parse
```

This gives you access to pgdoc's library interface and some handy aliases.

Now you need to connect to postgres. There must be a [postgres server configured for use with pgdoc][install] running on the local system for this example to work.

You should have set up some of connection details during the install script, which you now need to provide to your program.

``` js
let connect = async () => {
  let username = `pgdoc` /* which user within the PostgreSQL system */
  let password = `password` /* the password to access the database for the given user */
  let domain   = `127.0.0.1` /* database domain path. 127.0.0.1 if local */
  let port     = `5432` /* 5432 is postgres default. It's a major security risk not to change this if you put it online! */
  let database = `pgdoc` /* which database within the PostgreSQL system */
  let connectionString = `postgres://${username}:${password}@${domain}:${port}/${database}`
  let rv = await pgdoc.connect( { connectionString } )
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
  let params = {}
  params.type = `player`
  params.doc = { name: `John Smith`, age: 42, team: `red`, id: `-7` }
  let rv = await pgdoc.store( params )
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
  let params = {}
  let complexObject = { data: {}, evenMoreData: {} }
  params.type = `player`
  params.doc = { name:`Jane Doe`, age:25, team:`red`, config:complexObject, id: `-8` }
  let rv = await pgdoc.store( params )
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
  let params = {}
  params.type = `player`
  params.doc = `{ "name": "Bob Smith", "age":42, "team": "red", "id": "-9" }`
  let rv = await pgdoc.store( params )
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
  let params = {}
  let complexObject = { data: {}, evenMoreData: {} }
  params.type = `player`
  params.doc = `{ "name":"Tammy Smith", "age":25, "team":"blue", "config": ${str(complexObject)}, "id": "-10" }`
  let rv = await pgdoc.store( params )
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

> NOTE: The integer values provided by requestID() will roll over to negative after reaching 9223372036854775807. If your use case needs more then 9 to 18 quintillion ID's for a particular document type, you need to use a different method of acquiring IDs.

You should verify you were able to get an ID before using it. Valid IDs will be 1 or greater.

``` js
let storeBasicWithID = async () => {
  let id = await pgdoc.requestID( { type: `player`} )
  if( id.error ) {
    console.error(`${id.label}: ${id.description}`)
  }
  else {
    console.log(`collected id: ${id}`)
    let params = {}
    params.type = `player`
    params.doc = { name:`Joel Smith`, age:33, team:`red`, id:id }
    let rv = await pgdoc.store( params )
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
  let params = {}
  params.type = `player`
  let id = await pgdoc.requestID( params )
  if( id.error ) {
    console.error(`${id.label}: ${id.description}`)
  }
  else {
    console.log(`collected id: ${id}`)
    let myMetaData = { timestamp: Date.now(), id: id }
    let myData = { name:`John Calhoun`, age:22, team:`blue` }
    let params = {}
    params.type = `player`
    params.doc = { meta: myMetaData, data: myData }
    rv = await pgdoc.store( params )
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

You get documents back out by performing a search in the form of an Object. `pgdoc.retrieve()` always returns a list on success. To get a single document, use something unique like an ID and verify the list size is 1.

```js
let retrieveBasic = async ( ID ) => {
  let params = {}
  params.type = `player`
  params.search = { id: ID }
  let rv = await pgdoc.retrieve(params)
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
retrieveBasic(`1`)
```

This works with any information specific to one document.

```js
let retrieveByName = async ( name ) => {
  let params = {}
  params.type = `player`
  params.search = { name }
  rv = await pgdoc.retrieve(params)
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
retrieveByName(`Jane Doe`)
```

You can retrieve multiple documents by simply searching a shared member.

``` js
let retrieveMulti = async () => {
  let params = {}
  params.type = `player`
  params.search = { team: `red` }
  rv = await pgdoc.retrieve( params )
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

If you want to further refine your search, you can use a second filter to exclude something from the search.

``` js
let retrieveExcluding = async () => {
  let params = {}
  params.type = `player`
  params.search = { team: `red` }
  params.exclude = { age: 42 }
  rv = await pgdoc.retrieve( params )
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
retrieveExcluding()
```

### UPDATE

By adding a search filter unique to the document you are updating, you can overwrite a document.

``` js
let storeOverwrite = async () => {
  /// First perform a simple store
  let params = {}
  params.type = `player`
  params.doc  = { name: `Bill Smith`, age:43, team: `red`, id: `-1` }
  params.search = { id: `-1` } /// This will wipe out existing records with this ID
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    // Now overwrite the stored data with a specific alternative value
    console.log(`document stored with age: 43`)
    let params = {}
    params.type = `player`
    params.doc  = { name: `Bill Smith`, age: 44, team: `red`, id: `-1` }
    params.search = { id: `-1` } /// This will wipe out the previous store's record
    rv = await pgdoc.store( params )
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
        console.error(`1 Document was written to database, and ${rv.deleted} documents were deleted. Maybe something went wrong.`)
      }
    }
  }
}
storeOverwrite()
```

If you want to avoid deleting too much you can specify the number of documents you expect to be deleted in the event.

``` js
let storeOverwriteMax = async () => {
  /// First perform a simple store
  let params = {}
  params.type = `player`
  params.doc  = { name: `Jill Smith`, age:23, team: `red`, id: `-2` }
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
    return
  }
  /// Now an overlapping store...
  params = {}
  params.type = `player`
  params.doc  = { name: `Joan Doe`, age:19, team: `red`, id: `-2` } /// ID CONFLICT!
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
    return
  }
  // Now attempt to overwrite the stored data with a specific alternative value
  console.log(`documents with conflicting ids stored.`)
  params = {}
  params.type = `player`
  params.doc  = { name: `Joan Doe`, age: 20, team: `red`, id: `-2` }
  params.search = { id: `-2` }
  params.maxMatch = 1
  rv = await pgdoc.store( params )
  if( rv.error ) {
    /// This should trigger with a MaxExceeded error.
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    /// This won't happen.
    console.error(`pgdoc.store() failed to catch the conflicting IDs somehow?`)
  }
}
storeOverwriteMax()
```

You can also use this maxMatch feature to ensure a unique value in the first place.

> IDs provided by pgdoc.requestID() will be unique for that database, so this should not normally be necessary for them.

``` js
let storeUnique = async () => {
  /// Store a document with a unique player name if and only if it is unique
  let params = {}
  params.type = `player`
  params.doc  = { name: `Jimmy Smith`, age:23, team: `red`, id: `-3` }
  params.search = { name: `Jimmy Smith` }
  params.maxMatch = 0
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.error(`record stored with no duplicate player name`)
  }
}
storeUnique()
```

You can exclude from pgdoc.store() deletion searches in the same way you would with retrieve.

``` js
let storeOverwriteMaxExcluding = async () => {
  /// First perform a simple store
  let params = {}
  params.type = `player`
  params.doc  = { name: `Sandy Smith`, position: `pitcher`, age:23, team: `red`, id: `-4` }
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
    return
  }
  /// Now an overlapping store...
  params = {}
  params.type = `player`
  params.doc  = { name: `Samuel Doe`, position: `pitcher`, age:19, team: `red`, id: `-5` } /// position CONFLICT!
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
    return
  }
  /// Now precisely ignore the conflicting data...
  console.log(`documents with conflicting ids stored.`)
  params = {}
  params.type = `player`
  params.doc  = { name: `Samuel Doe`, age: 20, team: `red`, id: `-5` }
  params.search = { position: `pitcher` }
  params.exclude = { name: `Sandy Smith` }
  params.maxMatch = 1
  rv = await pgdoc.store( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    if( rv.deleted == 1 ) {
      console.log( `Samuel Doe's age updated non-destructively despite conflicting position.` )
    }
    else {
      console.error( `Error: Something prevented a proper update...\nrv: ${str(rv)}` )
    }
  }
}
storeOverwriteMaxExcluding()
```

### DELETE

Deletion is handled using the same search method as `pgdoc.retrieve()`, but the matched documents are deleted instead of being retrieved.

``` js
let deleteBasic = async ( ID ) => {
  let params = {}
  params.type = `player`
  params.search = { id: ID }
  rv = await pgdoc.delete( params )
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`Deleted ${rv.deleted} document(s)`)
  }
}
deleteBasic(`1`)
```

You can limit the number of documents to be deleted, which is especially useful if you only want your search to match one document.

``` js
let deleteLimited = async ( ID ) => {
  let params = {}
  params.type = `player`
  params.search = { id: ID }
  params.maxMatch = 1
  rv = await pgdoc.delete(params)
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
  else {
    console.log(`Deleted ${rv.deleted} document(s)`)
  }
}
deleteLimited(`-4`)
```

### [Back to getting started page][start]

[CRUD]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[install]: Install.md
[start]: Start.md
[terse]: CRUD_Examples_Terse