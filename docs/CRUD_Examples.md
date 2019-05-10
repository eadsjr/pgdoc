
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
errorCode = await pgdoc.connect(connectionString)
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
errorCode = await pgdoc.store( docType, myDoc )
````

You can store more complex objects using the same method.

```js
// Store a more complex object
complexObject = { data: {}, evenMoreData: {} }
docType = "player"
myDoc = { name:"John Smith", age:42, team:"red", config:complexObject }
errorCode = await pgdoc.store( docType, myDoc )
```

You can also store valid JSON strings directly. This can be especially useful when passing stuff through from the client, but it is important that you validate that the incoming data is not malicious, malformed or corrupted.

``` js
// Store a stringified basic object
// SECURITY NOTE: Don't forget to verify incoming data from client is not malicious or malformed!
docType = "player"
myDoc = `{ name:"John Smith", age:42, team:"red" }`
errorCode = await pgdoc.store( docType, myDoc )
```

Though `pg-doc` will attempt to error out should you pass it anything too suspicious, it is ultimately your responsibility to ensure that broken or malicious data isn't hi-jacking your server or being passed through to the database.

This string method is useful if you need some template JSON that will be reused often. You can embed dynamic information in it pretty easily.

``` js
// Store a stringified basic object with dynamic fields
// SECURITY NOTE: Don't forget to verify dynamic data from client is not malicious or malformed!
complexObject = { data: {}, evenMoreData: {} }
docType = "player"
myDoc = `{ name:"John Smith", age:42, team:"red", config:${str(complexObject)} }`
errorCode = await pgdoc.store( docType, myDoc )
```

You can request an ID with `pgdoc.requestID` to store inside the object and make finding it again easier. This ID is a simple integer, but every time it is requested from the database by a server it will be incremented by one. A separate counter sequence is used for each document type.

You should verify you were able to get an ID before using it. Valid IDs will be 1 or greater.

``` js
// Store a basic object with a unique ID
docType = "player"
id = await pgdoc.requestID(docType)
if( id > 0 ) {
  myDoc = { name:"John Smith", age:42, team:"red", config:id }
  errorCode = await pgdoc.store( docType, myDoc )
}
else {
  errorCode = id
  console.error(`Unable to collect a valid id. Error Message: ${pgdoc.errorMessage(errorCode)}`)
}
```

Because the ID is sequential and gives insight into your data, you don't want it to be accessible outside your system for security reasons. If you need to pass objects to clients you should rebuild or prune them to remove any data that the client does not need, including the ID number for it in the database.

If you need an ID to coordinate with the client you should generate one yourself and map it to the server ID for the object.

You can store the id and other metadata outside your data object by nesting them inside another object. This way you aren't 'polluting' your data with extra stuff.

``` js
// Storing metadata apart from your data
docType = "player"
myData = { name:"John Smith", age:42, team:"red" }
id = await pgdoc.requestID(docType)
if( id > 0 ) {
  myMetaData = { timestamp: Date.now(), id: id }
  myDoc = { meta: myMetaData, data: myData }
  errorCode = await pgdoc.store( docType, myDoc )
}
```

Of course if you do this, you must also unpack it before use.

``` js
  myData = docFromDatabase.data
```


### RETRIEVE

You get documents back out by performing a search in the form of an Object. `pgdoc.retrieve()` always returns a list. To get a single document, use something unique like an ID and verify the list size is 1.

```js
// Basic object retrieval
docType = "player"
mySearch = { id: 12576 }
myDoc = null
myDocs = await pgdoc.retrieve(docType, mySearch)
if( myDocs != null && myDocs.length == 1 ) {
  myDoc = myDocs[0]
}
```

This works with any information specific to one document.

```js
// Basic object retrieval, again
docType = "player"
mySearch = { name:"John Smith" }
myDoc = null
myDocs = await pgdoc.retrieve(docType, mySearch)
if( myDocs != null && myDocs.length == 1 ) {
  myDoc = myDocs[0]
}
```

You can retrieve multiple documents by simply searching a shared member.

``` js
// Multiple object retrieval
docType = "player"
mySearch = { team:"red" }
myDocs = await pgdoc.retrieve(docType, mySearch)
for( doc in myDocs ) {
  // <- application logic here
}
```

If you do not need to use the object you can request it be returned as a string to avoid a casting operation. This may be useful if you are just going to transmit it again.

``` js
docType = "player"
mySearch = { name:"John Smith" }
myDoc = null
myDocsAsStrings = await pgdoc.retrieveString(docType, mySearch)
if( myDocsAsStrings != null && myDocsAsStrings.length == 1 ) {
  myDocString = myDocsAsStrings[0]
}
```


### UPDATE

It is very simple to overwrite a document.

``` js
// Overwrite a single existing document
docType = "player"
newDoc  = `{ name:"John Smith", age:43, team:"red" }`
errorCode = await pgdoc.store( docType, newDoc )
if( errorCode == pgdoc.errorCodeFor("CLOBBERED") ) {
  console.warn(`Document was overwritten successfully`)
}
```

It takes a bit more effort to update an existing document. First you need to retrieve the old document, then perform your update logic on it. After that you store it, as per normal.

``` js
// Update a single existing document
docType = "player"
newDoc  = `{ name:"John Smith", age:43, team:"red"} }`
// Perform a search for the document, returning the string representation
oldDoc = null
oldDocs = await pgdoc.retrieveString(docType, mySearch)
if( oldDocs != null && oldDocs.length == 1 ) {
  // React to the returned document
  oldDoc = oldDocs[0]
  if( myDoc == newDoc ) {
    console.log("document already current")
  }
  else if ( myDocString == null ) {
    console.log("document not found")
  }
  else {
    let newDocObject = parse(newDoc)
    let oldDocObject = parse(oldDoc)
    // <- application logic here, combine the objects as you see fit and store in newDoc
    errorCode = await pgdoc.store(docType, newDoc)
  }
}
```


### DELETE

Deletion is handled using the same search method as `pgdoc.retrieve()`, but the matched documents are deleted instead of being retrieved.

``` js
// Multiple object deletion
docType = "player"
mySearch = { team: "red" }
deletedDocCount = await pgdoc.delete(docType, mySearch)
```

You can limit the number of documents to be deleted, which is especially useful if you only want your search to match one document.

``` js
// Single object deletion
docType = "player"
mySearch = { id: 12576 }
options = { "maxMatches": 1 }
deletedDocCount = await pgdoc.delete(docType, mySearch, null, options)
if( deletedDocCount != 1 ) {
  errorCode = deletedDocCount
  console.error(`${docType} deletion failed for search ${str(mySearch)}. Error: ${pgdoc.errorMessage(errorCode)}.`)
}
```

Deleting a document is not hard, though it is important that you specify what happens when it does not work. If something unexpected happens, you can rollback changes with `pgdoc.undo()`. This will only work if it is not disabled and you haven't made another request yet.

``` js
if( deletedDocCount < 0 ) {
  errorCode = deletedDocCount
  console.error(`${docType} deletion failed for search ${str(mySearch)}. Error: ${pgdoc.errorMessage(errorCode)}.`)
}
else if( deletedDocCount > 1 ) {
  console.error(`Document type ${docType} deletion failed for search ${str(mySearch)}. Too many documents removed! Reverting...`)
  errorCode = await pgdoc.undo()
  if( errorCode == 0 ) {
    console.log(`Revert success`)
  }
  else {
    console.error(`Revert failed with error: ${pgdoc.errorMessage(errorCode)}`)
  }
}
else if( deletedDocCount == 0 ) {
  console.warn(`Document type ${docType} deletion failed for search ${str(mySearch)}. Document(s) missing.`)
}
else {
  console.log(`Document type ${docType} deletion success for search ${str(mySearch)}. Removed 1 document.`)
}
```

[CRUD]:https://en.wikipedia.org/wiki/Create,_read,_update_and_delete