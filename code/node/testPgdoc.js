/// TODO: interactive terminal test thing, selection options via numbers
/// TODO: hook into pgdoc.js for direct run case
/// TODO: Option to change default config options, manually
/// TODO: Option to change default config options, import from file
/// TODO: Change examples/tests to a template application example.

const pgdoc = require(`./pgdoc.js`)
const str = require(`fast-safe-stringify`)

config = {}
config.username = `pgdoc`
config.password = ``
config.hostname = `127.0.0.1`
config.port     = `5432`
config.database = `pgdoc`
config.schema   = `pgdoc`
config.connectionString = `postgres://${config.username}:${config.password}@${config.hostname}:${config.port}/${config.database}`

module.exports = config
let testStore = async () => {
  console.log(`testing store()...`)
  let type = `CRUD_Test`
  let data = { id: 0, x: 1, y: 3, z: -2 }
  try {
    let err = await pgdoc.store(type, data)
    if( err != null ) {
      console.log(`pgdoc.store failed with error:\n  ${err.label}: ${err.description}`)
      // console.log(str(err))
      return
    }
  }
  catch (err) {
    console.log(`pgdoc.store failed for type:'${type}' and data:'${str(data)}'.\n${err}`)
    return
  }
}

let testRetrieve = async () => {
  console.log(`testing retrieve()...`)
  let type = `CRUD_Test`
  let search = { id: 0 }
  try {
    let result = await pgdoc.retrieve(type, search)
    console.log(result)
  }
  catch (err) {
    console.log(`pgdoc.retreive failed for type:'${type}' and search:'${str(search)}'.\n${err}`)
    return
  }
}

let testDelete = async () => {
  console.log(`testing delete()...`)
  let type = `CRUD_Test`
  let search = { id: 0 }
  try {
    let result = await pgdoc.delete(type, search)
    console.log(result)
  }
  catch (err) {
    console.log(`pgdoc.delete() failed for type:'${type}' and search:'${str(search)}'.\n${err}`)
    return
  }
}

let testRequestID = async () => {
  console.log(`testing requestID()...`)
  let type = `CRUD_Test`
  try {
    let result = await pgdoc.requestID(type)
    console.log(result)
  }
  catch (err) {
    console.log(`pgdoc.requestID() failed for type:'${type}'.\n${err}`)
    return
  }
}

let testConfigure = async () => {
  console.log(`testing configure()... NOT IMPLEMENTED`)
}

// console.log( pgdoc.JSON.parse(NaN) )
// console.log( pgdoc.JSON.parse('cats Wros') )


let connect = async () => {
  console.log(`connecting to database...`)
  let err = await pgdoc.connect(config.connectionString, {schema: config.schema, verbose: true})
  if( err.error ) {
    console.log(err)
  }
  else {
    console.log(`connected!`)
  }
}

let testAll = async () => {
  await testStore()
  await testRetrieve()
  await testRequestID()
  await testDelete()
  await testConfigure()
}


const rl = require('readline').createInterface({
  input: process.stdin,
  output: process.stdout
})
let interactiveTests = async () => {
  rl.question(`(E)xit or Test: (A)ll, (C)reate, (R)etrieve, (U)pdate, (D)elete, (C)onfig, (O)ptions, Request(I)D: `, async (command) => {
    console.log(`Command: ${command}`)
    if( command == 'e' || command == 'E' ) {
      process.exit(0)
    }
    await connect()
    switch( command ) {
      case 'a':
      case 'A':
        await testAll()
        break
      case 'c':
      case 'C':
        await testStore()
        break
      case 'r':
      case 'R':
        await testRetrieve()
        break
      case 'u':
      case 'U':
        /// TODO: Update cases?
        break
      case 'd':
      case 'D':
        await testDelete()
        break
      case 'c':
      case 'C':
        /// TODO: config update function
        break
      case 'o':
      case 'O':
        /// TODO: All options pathways in the system
        break
      case 'i':
      case 'I':
        await testRequestID()
    }
    interactiveTests()
  })
}
interactiveTests()
