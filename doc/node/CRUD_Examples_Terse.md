
# pgdoc

## CRUD Examples

[Click here for a longer and more thorough version of this document with directly runnable scripts.][verbose]

For these examples to work, you must have first have completed the [install process for you operating system][install].

Connect to the database.

``` js
const pgdoc = require(`pgdoc-nosql`)
connectionString = `postgres://pgdoc:${config.password}@${config.domain}:${config.port}/pgdoc`
rv = await pgdoc.connect({connectionString})
```

### CREATE & UPDATE

Now we can store a Javascript object in postgres by simply calling `pgdoc.store()`.

``` js
rv = await pgdoc.store( { type: `player`, doc: { name:`John Smith`, age:42, team:`red`, id:`-1` } } )
```

This method creates duplicate records. To prevent that, search for something unique to the record and require maxMatch of 0.

``` js
rv = await pgdoc.store( {
  type: `player`,
  doc: { name:`John Smith`, age:43, team:`red`, id:`-1` },
  search: { id:`-1` },
  maxMatch: 0
} )
```

This will fail if run in order, as there is already a document with the id '-1'. To delete the old record and replace it, relax maxMatch by 1.

``` js
rv = await pgdoc.store( {
  type: `player`,
  doc: { name:`John Smith`, age:43, team:`red`, id:`-1` },
  search: { id:`-1` },
  maxMatch: 1
} )
```

That will replace the existing record with the new one, unless there are too many records.

You can use requestID() to get a ID for use as a unique identifier for a given type.

``` js
  let id = await pgdoc.requestID( { type: `player`} )
  if( !id.error ) {
    rv = await pgdoc.store( { type: `player`, doc: { name:`Joel Smith`, age:42, team:`red`, id } } )
  }
```

### RETRIEVE

You get documents back with a search.

```js
rv = await pgdoc.retrieve( { type: `player`, search: { id: `1` } } )
```

You can retrieve multiple documents by simply searching a shared member.

``` js
rv = await pgdoc.retrieve( { type: `player`, search: { team: `red` } } )
```

To further refine your search, you can exclude based on other parameters.

``` js
rv = await pgdoc.retrieve( { type: `player`, search: { team: `red` }, exclude: { name: `John Smith` } } )
```

### DELETE

Deletion is handled using the same search method as store.

``` js
rv = await pgdoc.delete( { type: `player`, search: { id: `-1` }, maxMatch: 1 } )
```

The less specific, the more you might delete. This deletes all `player` documents.

``` js
rv = await pgdoc.delete( { type: `player` } )
```


### [Back to start][start]

[CRUD]: https://en.wikipedia.org/wiki/Create,_read,_update_and_delete
[install]: Install.md
[start]: Start.md
[verbose]: CRUD_Examples.md