/// TODO: interactive terminal test
/// TODO: hook into pgdoc.js for direct run case
/// TODO: load config from file
/// TODO: Change examples/tests to a template application example.

const pgdoc = require(`./pgdoc.js`)
const str = pgdoc.JSON.stringify
const assert = require(`assert`)
const rl = require('readline').createInterface({
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
  assert( !rv.error )
  rl.write(`passed.\n`)

  rl.write(`configure()...                                                 `)
  rv = await pgdoc.configure( { options: { verbose: config.verbose, quiet: config.quiet } } )
  assert( !rv.error )
  rl.write(`passed.\n`)

  let type = `pgdocTest`

  rl.write(`requestID()...                                                 `)
  rv = await pgdoc.requestID( { type } )
  assert( !rv.error )
  let id = rv
  rl.write(`passed.\n  ID: ${id}\n`)

  rl.write(`ensuring no conflicting records in database via delete()...    `)
  rv = await pgdoc.delete( { type: `pgdocTest` } )
  assert( !rv.error )
  rl.write(`passed.\n  Deleted ${rv.deleted} documents.\n`)

  let doc = { id, x: 1, y: 2, z: 3 }

  rl.write(`store()...                                                     `)
  rv = await pgdoc.store( { type, doc } )
  assert( !rv.error )
  rl.write(`passed.\n  Stored: ${str(doc)}\n`)

  let search = { id }

  rl.write(`retrieve()...                                                  `)
  // rv = await pgdoc.retrieve( { type, search } )
  // rv = await pgdoc.retrieve( { type, search, options: { verbose: true, quiet: true } } )
  rv = await pgdoc.retrieve( { type, search, options: { verbose: true, quiet: true, schema: `blat` } } )
  assert( rv.length == 1 )
  rl.write(`passed.\n  Retrieved: ${str(rv[0])}\n`)

  rl.write(`delete()...                                                    `)
  rv = await pgdoc.delete( { type, search } )
  assert( !rv.error )
  assert( rv.deleted == 1 )
  rl.write(`passed.\n  Deleted ${rv.deleted} documents.\n`)

  rl.write(`Testing Basic Use Cases...                                     passed.\n\n`)

  process.exit(0)
}

let testAdvanced = async () => {
  rl.write(`Testing Basic Use Cases...\n`)

  let connectionString = config.connectionString
  let options = { verbose: config.verbose }
  let rv = await pgdoc.connect( { connectionString, options } )
  assert( !rv.error )

  let type = `pgdocTest`

  rl.write(`ensuring no conflicting records in database via delete()...    `)
  rv = await pgdoc.delete( { type: `pgdocTest` } )
  assert( !rv.error )
  rl.write(`passed.\n  Deleted ${rv.deleted} documents.\n`)

  rl.write(`store() update test...                                         `)
  let oldDoc = { id: `-15`, v: 1 }
  rv = await pgdoc.store( { type, doc: oldDoc } )
  assert( !rv.error )
  assert( rv.deleted == 0 )
  rl.write(`\n`)
  let newDoc = { id: `-15`, v: 2 }
  let search = { id: `-15` }
  let maxMatch = 1
  rv = await pgdoc.store( { type, doc: newDoc, search , maxMatch } )
  console.error(rv)
  console.error(!rv.error)
  assert( !rv.error )
  assert( rv.deleted == 1 )
  rl.write(`passed.\n  Stored: ${str(oldDoc)}\n  Updated: ${str(newDoc)}\n`)



}

let testErrors = async () => {}

tests = async () => {
  // await testBasic()
  await testAdvanced()
  // await testErrors()
  process.exit(0)
}
try {
  tests()
}
catch (err) {
  console.error(err)
  process.exit(1)
}
