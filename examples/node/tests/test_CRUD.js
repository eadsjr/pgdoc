
const pgdoc = require(`../../../code/node/pgdoc.js`)
const config = require(`./config`)
const str = require('fast-safe-stringify')

console.log(`running tests`)

let playGame = async () => {
  console.log(`testing store()...`)
  let err = await pgdoc.connect(config.connectionString, {schema: config.schema})
  if( err != null ) {
    console.log(err)
    return
  }

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
  console.log(`testing retrieve()...`)
  let search = { id: 0 }
  try {
    let result = await pgdoc.retrieve(type, search)
    console.log(result)
  }
  catch (err) {
    console.log(`pgdoc.retreive failed for type:'${type}' and data:'${str(search)}'.\n${err}`)
    return
  }
  console.log(`testing ...()...`)
}
playGame()

// console.log( pgdoc.JSON.parse(NaN) )
// console.log( pgdoc.JSON.parse('cats Wros') )