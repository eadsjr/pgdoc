
const pgdoc = require(`../../../code/node/pgdoc.js`)
const config = require(`./config`)
const str = require('fast-safe-stringify')

console.log(`running tests`)


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
}

// console.log( pgdoc.JSON.parse(NaN) )
// console.log( pgdoc.JSON.parse('cats Wros') )

let test = async () => {
  let err = await pgdoc.connect(config.connectionString, {schema: config.schema, verbose: true})
  if( err != null ) {
    console.log(err)
    return
  }
  await testStore()
  await testRetrieve()
  await testRequestID()
  await testDelete()
}
test()
