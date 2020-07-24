/// TODO: interactive terminal test
/// TODO: hook into pgdoc.js for direct run case
/// TODO: load config from file
/// TODO: Change examples/tests to a template application example.

const pgdoc = require(`./pgdoc.js`)
const str = require(`fast-safe-stringify`)
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
  config.schema   = `pgdoc`
  config.connectionString = `postgres://${config.username}:${config.password}@${config.hostname}:${config.port}/${config.database}`
}

let testBasic = async () => {
  rl.write(`Testing Basic Use Cases...\n`)

  rl.write(`connect()...`)
  let connectionString = config.connectionString
  let options = { verbose: config.verbose }
  let rv = await pgdoc.connect( { connectionString, options } )
  assert( !rv.error )
  rl.write(` passed.\n`)

  rl.write(`configure()...`)
  rv = await pgdoc.configure( { options: { verbose: false } } )
  assert( !rv.error )
  rl.write(` passed.\n`)

  let type = `pgdocTest`

  rl.write(`requestID()...`)
  rv = await pgdoc.requestID( { type } )
  assert( !rv.error )
  rl.write(` passed.\n`)
  let id = rv

  rl.write(`ensuring no conflicting records in database via delete()...`)
  rv = await pgdoc.delete( { type: `pgdocTest` } )
  assert( !rv.error )
  rl.write(` passed. Deleted ${rv.deleted} documents.\n`)

  let doc = { id, x: 1, y: 2, z: 3 }

  rl.write(`store()...`)
  rv = await pgdoc.store( { type, doc } )
  assert( !rv.error )
  rl.write(` passed. Stored: ${doc}\n`)

  let search = { id }

  rl.write(`retrieve()...`)
  rv = await pgdoc.retrieve( { type, search } )
  assert( rv.length == 1 )
  rl.write(` passed. Retrieve: ${rv[0]}\n`)

  rl.write(`delete()...`)
  rv = await pgdoc.delete( { type, search } )
  assert( !rv.error )
  assert( rv.deleted == 1 )
  rl.write(` passed. Deleted ${rv.deleted} documents.\n`)

  rl.write(`Testing Basic Use Cases... passed.\n\n`)
}
testBasic()
