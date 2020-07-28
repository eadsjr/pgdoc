
const pgdoc = require(`../../../code/node/pgdoc.js`)
const config = require(`./config`)
const str = require(`fast-safe-stringify`)

console.log(`starting griddungeon standalone terminal application`)


let gameState = {}

let randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(size))
}

let newGame = async () => {

  let rv = await pgdoc.connect(config.connectionString, {schema: config.schema})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }

  let gameType = `game`
  rv = await pgdoc.requestID({type:gameType})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
  let gameID = rv
  let game = { id: gameID, state: `new` }

  /// Make a 7x7 grid, and populate it randomly with a hero and 3 monsters

  let entityType = `entity`
  let i = 0
  let entities, entity
  while( i < 4 ) {
    /// Create a new entity
    rv = await pgdoc.requestID({type:entityType})
    if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
    entity = {}
    entity.id = rv
    entity.x = randomInt(config.boardSize)
    entity.y = randomInt(config.boardSize)
    entity.hp = 6 + randomInt(10) /// Total between 6 and 15
    entity.class = ( i == 0 ) ? `hero` : `monster`
    entity.attack = 6
    entity.gameID = gameID

    /// Ensure no starting position collisions
    let j = 0
    while( j < entities.length ) {
      if( entities[j].x == entity.x && entities[j].y == entity.y ) {
        entity.x = randomInt(config.boardSize)
        entity.y = randomInt(config.boardSize)
        j = 0
      }
      else {
        j += 1
      }
    }

    entities.push(entity)
    rv = await pgdoc.store({type: entityType, doc: entity})
    if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
  }
  gameState.entities = entities
  gameState.gameID = gameID

  rv = await pgdoc.store({type: gameType, doc: game})
}

let playGame = async () => {
  let err = await pgdoc.connect(config.connectionString, {schema: config.schema})
  if( err != null ) {
    console.log(err)
    return
  }

  let type = `entity`
  let data = { id: 0, x: 1, y: 3, hp: 10, attack: 4 }
  let rv = await pgdoc.store(type, data)
  if( rv.error ) {
    console.error(`${rv.label}: ${rv.description}`)
  }
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
