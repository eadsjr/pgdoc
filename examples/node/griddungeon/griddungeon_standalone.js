
const pgdoc = require(`../../../code/node/pgdoc.js`)
const config = require(`./config`)
const str = require(`fast-safe-stringify`)
const readline = require(`readline`)
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log(`starting griddungeon standalone terminal application`)


let gameState = {}
let game = {}

let randomInt = (max) => {
  return Math.floor(Math.random() * Math.floor(max))
}

let newGame = async () => {

  gameState = {}

  let rv = await pgdoc.connect({connectionString: config.connectionString, schema: config.schema})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }

  /// Secure a fresh ID for the game
  rv = await pgdoc.requestID({type:`game`})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
  // if( rv.error ) { console.error(`${rv.label}: ${rv.description}: ${str(rv.wrapped)}`) ; return }
  let gameID = rv

  if(config.verbose) {
    console.log(`gameID: ${str(gameID)}`)
  }

  /// Make a board grid, and populate it randomly with a hero and 3 monsters
  let i = 0
  let entities = []
  while( i < 4 ) {
    /// Create a new entity
    rv = await pgdoc.requestID({type:`entity`})
    if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
    let entity = {}
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
    i += 1
  }

  /// Save the game and game state
  game = { id: gameID, state: `new`, move: 0, boardSize: config.boardSize }
  if(config.verbose) {
    console.log(`game: ${str(game)}`)
  }
  rv = await pgdoc.store({type: `game`, doc: game})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }

  /// Save the gameState
  gameState.entities = entities
  gameState.gameID = gameID
  gameState.move = 0
  if(config.verbose) {
    console.log(`gameState: ${str(gameState)}`)
  }
  rv = await pgdoc.store({type: `gameState`, doc: gameState})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
}

/// TODO: this should flex with game.boardSize
let boardTemplate = {
   0: `+++++++++++++++\n`,
   1: `+             +\n`,
   2: `+             +\n`,
   3: `+             +\n`,
   4: `+             +\n`,
   5: `+             +\n`,
   6: `+             +\n`,
   7: `+             +\n`,
   8: `+++++++++++++++\n\n`,
}

let renderBoard = async () => {
  let board = {}
  Object.assign( board, boardTemplate )
  for( e in gameState.entities ) {
    let entity = gameState.entities[e]
    let x = (entity.x * 2) + 1
    let y = entity.y + 1
    let figure = entity.class == `hero` ? `@` : `M`
    // rl.write(board[y])
    let lineY = board[y].slice(0,x) + figure + board[y].slice(x+1,board[y].length)
    // rl.write(lineY)
    board[y] = lineY
  }
  return board
}
let renderGame = async () => {
  let board = await renderBoard()
  for(l in board) {
    rl.write(board[l])
  }
}

let processInput = async (e) => {
  // console.log(str(e))
  // rl.clearLine(process.stdin, -1)
  readline.cursorTo(process.stdin, 0)
  rl.write(e)
}

let playGame = async () => {
  // await newGame()
  // console.log(str(game))
  // console.log(str(gameState))
  game = {"id":"11","state":"new","move":0,"boardSize":7}
  gameState = {"entities":[{"id":"23055","x":0,"y":3,"hp":15,"class":"hero","attack":6,"gameID":"11"},{"id":"23056","x":2,"y":0,"hp":15,"class":"monster","attack":6,"gameID":"11"},{"id":"23057","x":2,"y":5,"hp":13,"class":"monster","attack":6,"gameID":"11"},{"id":"23058","x":6,"y":1,"hp":8,"class":"monster","attack":6,"gameID":"11"}],"gameID":"11","move":0}

  await renderGame()

  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY)
    process.stdin.setRawMode(true);
  process.stdin.on(`keypress`, processInput )
}
playGame()

