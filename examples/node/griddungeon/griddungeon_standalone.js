
const pgdoc = require(`../../../code/node/pgdoc.js`)
const config = require(`./config`)
const str = require('fast-safe-stringify')

console.log(`starting griddungeon standalone server`)

let playGame = async () => {
  let err = await pgdoc.connect(config.connectionString, {schema: config.schema})
  if( err != null ) {
    console.log(err)
    return
  }

  let type = `hero`
  // let data = { id: 0, x: 1, y: 3, hp: 10, attack: 4 }
  // try {
  //   let err = await pgdoc.store(type, data)
  //   if( errCode != 0 ) {
  //     console.log(`pgdoc.store failed with error code:'${errCode}'`)
  //     return
  //   }
  // }
  // catch (err) {
  //   console.log(`pgdoc.store failed for type:'${type}' and data:'${str(data)}'.\n${err}`)
  //   return
  // }
  let search = { id: 0 }
  // try {
    let result = await pgdoc.retrieve(type, search)
    console.log(result)
  // }
  // catch (err) {
    // console.log(`pgdoc.retreive failed for type:'${type}' and data:'${str(search)}'.\n${err}`)
    // return
  // }
}
playGame()

// console.log( pgdoc.JSON.parse(NaN) )
// console.log( pgdoc.JSON.parse('cats Wros') )
