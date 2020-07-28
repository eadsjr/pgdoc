
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
  return Math.floor(Math.random() * Math.floor(size))
}

let newGame = async () => {

  gameState = {}

  let rv = await pgdoc.connect(config.connectionString, {schema: config.schema})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }

  /// Secure a fresh ID for the game
  let gameType = `game`
  rv = await pgdoc.requestID({type:gameType})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }
  let gameID = rv

  /// Make a board grid, and populate it randomly with a hero and 3 monsters
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
  }

  /// Save the game and game state
  game = { id: gameID, state: `new`, move: 0, boardSize: config.boardSize }
  rv = await pgdoc.store({type: gameType, doc: game})
  if( rv.error ) { console.error(`${rv.label}: ${rv.description}`) ; return }

  /// Save the gameState
  gameState.entities = entities
  gameState.gameID = gameID
  gameState.move = 0
  let gameStateType = `gameState`
  rv = await pgdoc.store({type: gameStateType, doc: gameState})
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
    let lineY = lines[y].slice(0,x) + figure + lines[y].slice(x,0)
    board[y] = lineY
  }
  return board
}
let renderGame = async () => {
  let board = renderBoard()
  rl.write(board)
}

let processInput = async (e) => {
  // console.log(str(e))
  // rl.clearLine(process.stdin, -1)
  readline.cursorTo(process.stdin, 0)
  rl.write(e)
}

let playGame = async () => {
  // readline.emitKeypressEvents(process.stdin)
  // if (process.stdin.isTTY)
  //   process.stdin.setRawMode(true);
  // process.stdin.on(`keypress`, processInput )

  await newGame()
  console.log(str(game))
  console.log(str(gameState))
}
playGame()

