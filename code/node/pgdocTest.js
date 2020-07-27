/// TODO: interactive terminal test
/// TODO: hook into pgdoc.js for direct run case
/// TODO: load config from file
/// TODO: Change examples/tests to a template application example.

const pgdoc = require(`./pgdoc.js`)
const str = pgdoc.JSON.stringify
const assert = require(`assert`)
const rl = require(`readline`).createInterface({
  input: process.stdin,
  output: process.stdout
})

let config
try {
  config = require(`./config.js`)
  rl.write(`NOTE: config loaded from ./config.js\n\n`)
}
catch (err) {
  rl.write(`NOTE: config generated from defaults\n\n`)
  config = {}
  config.username = `pgdoc`
  config.password = `password`
  config.hostname = `127.0.0.1`
  config.port     = `5432`
  config.database = `pgdoc`
  config.connectionString = `postgres://${config.username}:${config.password}@${config.hostname}:${config.port}/${config.database}`
  config.schema   = `pgdoc`
  config.verbose  = false
  config.quiet    = false
}

let testBasic = async () => {
  rl.write(`Testing Basic Use Cases...\n`)
  rl.write(`connect()...                                                   `)
  let connectionString = config.connectionString
  let options = { verbose: config.verbose }
  let rv = await pgdoc.connect( { connectionString, options } )
  assert( !rv.error, `connect failed with error ${str(rv)}` )
  rl.write(`passed.\n`)

  rl.write(`configure()...                                                 `)
  rv = await pgdoc.configure( { options: { verbose: config.verbose, quiet: config.quiet } } )
  assert( !rv.error, `configure failed with error ${str(rv)}` )
  rl.write(`passed.\n`)

  let type = `pgdocTest`

  rl.write(`requestID()...                                                 `)
  rv = await pgdoc.requestID( { type } )
  assert( !rv.error, `requestID failed with error ${str(rv)}` )
  let id = rv
  rl.write(`passed.\n`)
  rl.write(`  ID: ${id}\n`)

  rl.write(`delete() ensuring no conflicting records in database...        `)
  rv = await pgdoc.delete( { type: `pgdocTest` } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  rl.write(`passed.\n`)
  rl.write(`  Deleted ${rv.deleted} documents.\n`)

  let doc = { id, x: 1, y: 2, z: 3 }

  rl.write(`store()...                                                     `)
  rv = await pgdoc.store( { type, doc } )
  assert( !rv.error, `store failed with error ${str(rv)}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored: ${str(doc)}\n`)

  let search = { id }

  rl.write(`retrieve()...                                                  `)
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Retrieved: ${str(rv[0])}\n`)

  rl.write(`delete()...                                                    `)
  rv = await pgdoc.delete( { type, search } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `delete failed to get expected result, expected 1 deletion and got ${rv.deleted}` )
  rl.write(`passed.\n`)
  rl.write(`  Deleted ${rv.deleted} documents.\n`)

  rl.write(`store() with string...                                         `)
  rv = await pgdoc.requestID( { type } )
  assert( !rv.error, `requestID failed with error ${str(rv)}` )
  id = rv
  doc = `{ "id": "${id}", "x": 1, "y": 2, "z": 3 }`
  rv = await pgdoc.store( { type, doc } )
  assert( !rv.error, `store failed with error ${str(rv)}` )
  search = { id }
  rv = await pgdoc.delete( { type, search } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `delete failed to get expected result, expected 1 deletion and got ${rv.deleted}` )
  rl.write(`passed.\n`)
  rl.write(`  ID: ${id}\n`)
  rl.write(`  Stored: ${str(doc)}\n`)
  rl.write(`  Deleted ${rv.deleted} documents.\n`)

  rl.write(`Testing Basic Use Cases...                                     passed.\n\n`)
}

let testAdvancedStore = async () => {
  rl.write(`Testing Advanced Use Cases for Store...\n`)

  let connectionString = config.connectionString
  let options = { verbose: config.verbose }
  let rv = await pgdoc.connect( { connectionString, options } )
  assert( !rv.error, `connect failed with error ${str(rv)}` )

  let type = `pgdocTest`

  rl.write(`delete() ensuring no conflicting records in database...        `)
  rv = await pgdoc.delete( { type } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  rl.write(`passed.\n`)
  rl.write(`  Deleted ${rv.deleted} documents.\n`)

  rl.write(`store() search test...                                         `)
  let oldDoc = { id: `-15`, v: 1 }
  rv = await pgdoc.store( { type, doc: oldDoc } )
  assert( !rv.error, `store of oldDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of oldDoc failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  let newDoc = { id: `-15`, v: 2 }
  let search = { id: `-15` }
  rv = await pgdoc.store( { type, doc: newDoc, search } )
  assert( !rv.error, `store of newDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `store of newDoc failed to get expected result, expected 1 deletion and got ${rv.deleted}` )
  rl.write(`passed.\n  Stored: ${str(oldDoc)}\n  Updated: ${str(newDoc)}\n`)
  rl.write(`  Stored:  ${str(oldDoc)}\n`)
  rl.write(`  Updated: ${str(newDoc)}\n`)

  rl.write(`store() search + maxMatch test...                              `)
  oldDoc = { id: `-16`, v: 1 }
  rv = await pgdoc.store( { type, doc: oldDoc } )
  assert( !rv.error, `store of oldDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of oldDoc failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  newDoc = { id: `-16`, v: 2 }
  search = { id: `-16` }
  let maxMatch = 1
  rv = await pgdoc.store( { type, doc: newDoc, search, maxMatch } )
  assert( !rv.error, `store of newDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `store of newDoc failed to get expected result, expected 1 deletion and got ${rv.deleted}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored:  ${str(oldDoc)}\n`)
  rl.write(`  Updated: ${str(newDoc)}\n`)

  rl.write(`store() search, exclude test...                                `)
  oldDoc = { id: `-17`, v: 1, ignore: false }
  rv = await pgdoc.store( { type, doc: oldDoc } )
  assert( !rv.error, `store of oldDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of oldDoc failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  oldDoc2 = { id: `-17`, v: 1, ignore: true }
  rv = await pgdoc.store( { type, doc: oldDoc2 } )
  assert( !rv.error, `store of oldDoc2 failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of oldDoc2 failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  newDoc = { id: `-17`, v: 100, ignore: false }
  search = { id: `-17` }
  let exclude = { ignore: true }
  rv = await pgdoc.store( { type, doc: newDoc, search, exclude } )
  assert( !rv.error, `store of newDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `store of newDoc failed to get expected result, expected 1 deletion and got ${rv.deleted}` )
  let deleted = rv.deleted
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 2, `retrieve failed to get expected result, expected 2 documents and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored:     ${str(oldDoc)}\n`)
  rl.write(`  Stored:     ${str(oldDoc2)}\n`)
  rl.write(`  Updated:    ${str(newDoc)}\n`)
  rl.write(`  Deleted:    ${deleted}\n`)
  rl.write(`  Retrieved:  ${str(rv[0])}\n`)
  rl.write(`  Retrieved:  ${str(rv[1])}\n`)

  rl.write(`store() search + maxMatch, exclude test...                     `)
  oldDoc = { id: `-18`, v: 1, ignore: false }
  rv = await pgdoc.store( { type, doc: oldDoc } )
  assert( !rv.error, `store of oldDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of oldDoc failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  oldDoc2 = { id: `-18`, v: 100, ignore: true }
  rv = await pgdoc.store( { type, doc: oldDoc2 } )
  assert( !rv.error, `store of oldDoc2 failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of oldDoc2 failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  newDoc = { id: `-18`, v: 2 }
  search = { id: `-18` }
  maxMatch = 1
  exclude = { ignore: true }
  rv = await pgdoc.store( { type, doc: newDoc, search, exclude, maxMatch } )
  assert( !rv.error, `store of newDoc failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `store of newDoc failed to get expected result, expected 1 deletion and got ${rv.deleted}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored:  ${str(oldDoc)}\n`)
  rl.write(`  Stored:  ${str(oldDoc2)}\n`)
  rl.write(`  Updated: ${str(newDoc)}\n`)
  rl.write(`  Deleted: ${rv.deleted}\n`)

  rl.write(`delete() to clean up...                                        `)
  rv = await pgdoc.delete( { type } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  assert( rv.deleted == 6, `delete failed to get expected result, expected 6 deletions and got ${rv.deleted}` )
  rl.write(`passed.\n`)
  rl.write(`  Deleted ${rv.deleted} documents.\n`)

  rl.write(`Testing Advanced Use Cases for Store...                        passed.\n\n`)
}

let testAdvancedRetrieve = async () => {
  rl.write(`Testing Advanced Use Cases for Retrieve...\n`)

  let connectionString = config.connectionString
  let options = { verbose: config.verbose }
  let rv = await pgdoc.connect( { connectionString, options } )
  assert( !rv.error, `connect failed with error ${str(rv)}` )

  let type = `pgdocTest`

  rl.write(`ensuring no conflicting records in database via delete()...    `)
  rv = await pgdoc.delete( { type } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  rl.write(`passed.\n  Deleted ${rv.deleted} documents.\n`)

  rl.write(`store() of searchable documents...                             `)

  let doc1 = { id: -19, group: `A`, x:1, y:2, complex: { a: { t: 7, u: 3 } } }
  let search = { id: `-19` }
  let maxMatch = 0
  rv = await pgdoc.store( { type, doc: doc1, search, maxMatch } )
  assert( !rv.error, `store of doc1 failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of doc1 failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  let doc2 = { id: -20, group: `B`, x:1, y:2, complex: { a: { t: 2, u: 4 }, c: 8 } }
  search = { id: `-20` }
  rv = await pgdoc.store( { type, doc: doc2, search, maxMatch } )
  assert( !rv.error, `store of doc2 failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of doc2 failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  let doc3 = { id: -21, group: `B`, x:2, y:1, complex: { a: { t: 1, u: -5 }, b: 3 } }
  search = { id: `-21` }
  rv = await pgdoc.store( { type, doc: doc3, search, maxMatch } )
  assert( !rv.error, `store of doc3 failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of doc3 failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  let doc4 = { id: -22, group: `A`, x:2, y:1, complex: { a: { t: 7, u: 2 }, b: 3 } }
  search = { id: `-22` }
  rv = await pgdoc.store( { type, doc: doc4, search, maxMatch } )
  assert( !rv.error, `store of doc4 failed with error ${str(rv)}` )
  assert( rv.deleted == 0, `store of doc4 failed to get expected result, expected 0 deletions and got ${rv.deleted}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored: ${str(doc1)}\n`)
  rl.write(`  Stored: ${str(doc2)}\n`)
  rl.write(`  Stored: ${str(doc3)}\n`)
  rl.write(`  Stored: ${str(doc4)}\n`)

  rl.write(`retrieve() by shared member...                                 `)
  search = { group: `A` }
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 2, `retrieve failed to get expected result, expected 2 documents and got ${rv.length}` )
  assert( doc1.complex.a.u == rv[0].complex.a.u || doc1.complex.a.u == rv[1].complex.a.u,
          `expected doc1 data element to be in retrieved documents, but unable to find it!\n`+
          `Expected: doc1.complex.a.u == ${doc1.complex.a.u} to be in Retrieved: ${str(rv)}`)
  rl.write(`passed.\n`)
  rl.write(`  Search: ${str(search)}\n`)
  rl.write(`  Retrieved: ${str(rv[0])}\n`)
  rl.write(`  Retrieved: ${str(rv[1])}\n`)

  // rv = await pgdoc.configure( { options: { verboseSQL: true, verbose: false, quiet: false } } )

  rl.write(`retrieve() search + maxMatch...                                `)
  search = { complex: { a: { t: 1, u: -5 }, b: 3 } }
  maxMatch = 1
  // maxMatch = 0
  rv = await pgdoc.retrieve( { type, search, maxMatch } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Search: ${str(search)}\n`)
  rl.write(`  Retrieved: ${str(rv[0])}\n`)

  rl.write(`retrieve() search, exclude...                                  `)
  search = { x: 2 }
  let exclude = { group: `A` }
  rv = await pgdoc.retrieve( { type, search, exclude } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Search: ${str(search)}\n`)
  rl.write(`  Exclude: ${str(exclude)}\n`)
  rl.write(`  Retrieved: ${str(rv[0])}\n`)

  rl.write(`retrieve() search + maxMatch, exclude...                       `)
  search = { x: 1 }
  exclude = { group: `B` }
  maxMatch = 1
  // maxMatch = 0 /// TEMPORARY CHANGE TO FLUSH OUT maxMatch issues, needs own test later
  rv = await pgdoc.retrieve( { type, search, maxMatch, exclude } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Search: ${str(search)}\n`)
  rl.write(`  Exclude: ${str(exclude)}\n`)
  rl.write(`  Retrieved: ${str(rv[0])}\n`)

  // /// This feature will take some serious work, and is not yet supported
  // rl.write(`retrieve() multi-level objects...                              `)
  // search = { complex: { a: { t: 1 } } }
  // rv = await pgdoc.retrieve( { type, search, exclude } )
  // assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  // assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  // rl.write(`passed.\n`)
  // rl.write(`  Search: ${str(search)}\n`)
  // rl.write(`  Retrieved: ${str(rv[0])}\n`)

  // console.error(rv)
  // console.error(!rv.error)
  // rv = await pgdoc.configure( { options: { verbose: true, quiet: false } } )
  // rv = await pgdoc.configure( { options: { verboseSQL: true, verbose: false, quiet: false } } )

  rl.write(`Testing Advanced Use Cases for Retrieve...                     passed.\n\n`)
}

let testAdvancedDelete = async () => {
  rl.write(`Testing Advanced Use Cases for Delete...\n`)

  let connectionString = config.connectionString
  let options = { verbose: config.verbose }
  let rv = await pgdoc.connect( { connectionString, options } )
  assert( !rv.error, `connect failed with error ${str(rv)}` )

  let type = `pgdocTest`

  rl.write(`ensuring no conflicting records in database via delete()...    `)
  rv = await pgdoc.delete( { type } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  let deleted = rv.deleted
  rv = await pgdoc.retrieve( { type } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 0, `retrieve failed to get expected result, expected 0 documents and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Deleted ${deleted} documents.\n`)
  rl.write(`  Retrieved ${rv.length} documents.\n`)

  rl.write(`delete() with search...                                        `)
  let doc = { a: 1, b: 2 }
  let search = doc
  rv = await pgdoc.store( { type, doc } )
  assert( !rv.error, `store of doc failed with error ${str(rv)}` )
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  rv = await pgdoc.delete( { type, search } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `delete failed to get expected result, expected 1 document and got ${rv.deleted}` )
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 0, `retrieve failed to get expected result, expected 0 documents and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored and Deleted document.\n`)

  rl.write(`delete() with search + maxMatch...                             `)
  doc = { a: 2, b: 1 }
  search = doc
  let maxMatch = 1
  rv = await pgdoc.store( { type, doc } )
  assert( !rv.error, `store of doc failed with error ${str(rv)}` )
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 1, `retrieve failed to get expected result, expected 1 document and got ${rv.length}` )
  rv = await pgdoc.delete( { type, search, maxMatch } )
  assert( !rv.error, `delete failed with error ${str(rv)}` )
  assert( rv.deleted == 1, `delete failed to get expected result, expected 1 document and got ${rv.deleted}` )
  rv = await pgdoc.retrieve( { type, search } )
  assert( !rv.error, `retrieve failed with error ${str(rv)}` )
  assert( rv.length == 0, `retrieve failed to get expected result, expected 0 documents and got ${rv.length}` )
  rl.write(`passed.\n`)
  rl.write(`  Stored and Deleted document.\n`)


  /// TODO: search + maxMatch
  /// TODO: search, exclude
  /// TODO: search + maxMatch, exclude
  /// TODO: search ( multi level objects )

  // console.error(rv)
  // console.error(!rv.error)
  // rv = await pgdoc.configure( { options: { verbose: true, quiet: false } } )

  rl.write(`Testing Advanced Use Cases for Delete...                       passed.\n\n`)
}

let testErrors = async () => {}

let tests = async () => {
  await testBasic()
  await testAdvancedStore()
  await testAdvancedRetrieve()
  // await testAdvancedDelete()
  // await testAdvanced()
  // await testParallel()
  // await testErrors()
  process.exit(0)
}
let interactiveTests = async () => {
  rl.question(`(E)xit or Test: (A)ll, (1)Basic, (2)Advanced, (0) Current: `, async (command) => {
    // console.log(`Command: ${command}`)
    if( command == 'e' || command == 'E' ) {
      process.exit(0)
    }
    switch( command ) {
      case 'a':
      case 'A':
        rl.write(`Running all tests...\n\n`)
        await tests()
        break
      case '1':
        rl.write(`Running basic tests...\n\n`)
        await testBasic()
        process.exit(0)
        break
      case '2':
        rl.write(`Running advanced tests...\n\n`)
        await testAdvancedStore()
        process.exit(0)
        // await testAdvanced()
        break
      case '0':
        rl.write(`Running current module tests...\n\n`)
        await testAdvancedRetrieve()
        process.exit(0)
        break
      default:
        rl.write(`Running all tests...\n\n`)
        await tests()
    }
    interactiveTests()
  })
}
try {
  interactiveTests()
}
catch (err) {
  console.error(err)
  process.exit(1)
}
