
const pgdoc = require(`../../../code/node/pgdoc.js`)
const config = require(`./config`)
const str = require(`fast-safe-stringify`)
const readline = require(`readline`)
let rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
})

console.log(`starting griddungeon standalone terminal application`)

let systemState = { banner: ``, ready: false, footer: `` }
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

  game = { id: gameID, status: `active`, move: 0, boardSize: config.boardSize }

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
    while( j < Object.keys(entities).length ) {
      if( entities[j].x == entity.x && entities[j].y == entity.y ) {
        entity.x = randomInt(config.boardSize)
        entity.y = randomInt(config.boardSize)
        j = 0
      }
      else {
        j += 1
      }
    }

    if( i == 0 ) {
      game.heroID = entity.id
    }

    entities[entity.id] = entity
    i += 1
  }

  /// Save the game and gameState
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
  readline.moveCursor(process.stdin, 0, -12)
  readline.clearScreenDown(process.stdin)
  rl.write(systemState.banner)
  systemState.banner = ``
  rl.write(`\n`)
  let board = await renderBoard()
  for(l in board) {
    rl.write(board[l])
  }
  rl.write(systemState.footer)
}
let initRender = async () => {
  rl.write(`\n\n\n\n\n\n\n\n\n\n\n\n`)
}

/// Checks for collision and damages if one happens with a non-ally.
let checkCollision = async ( myID ) => {
  for( let id in gameState.entities ) {
    if( id != myID ) {
      if( gameState.entities[id].x == gameState.entities[myID].x &&
          gameState.entities[id].y == gameState.entities[myID].y ) {

        /// Contact made, damage if non-enemy
        if( gameState.entities[id].class != gameState.entities[myID].class ) {
          gameState.entities[id].hp -= gameState.entities[myID].attack
          systemState.banner += `The ${gameState.entities[id].class} was hit. `
          if( gameState.entities[id].hp <= 0 ) {
            systemState.banner += `The ${gameState.entities[id].class} falls. `
            delete gameState.entities[id] /// Defeated!
            if( id == game.heroID ) {
              game.status = `lost`
              systemState.banner += `You Lost!`
            }
            else if ( Object.keys(gameState.entities).length == 1 ) {
              game.status = `won`
              systemState.banner += `You Won!`
            }
          }
        }
        return true /// Report collision
      }
    }
  }
  return false
}
let moveEntity = async ( id, dir ) => {
  if( dir == 0 ) {
    gameState.entities[id].y = ( gameState.entities[id].y <= 0 ) ? 0 : gameState.entities[id].y - 1
    gameState.entities[id].y = await checkCollision(id) ? gameState.entities[id].y + 1 : gameState.entities[id].y
    return true
  }
  else if( dir == 1 ) {
    gameState.entities[id].x = ( gameState.entities[id].x <= 0 ) ? 0 : gameState.entities[id].x - 1
    gameState.entities[id].x = await checkCollision(id) ? gameState.entities[id].x + 1 : gameState.entities[id].x
    return true
  }
  else if( dir == 2 ) {
    let b = config.boardSize - 1
    gameState.entities[id].y = ( gameState.entities[id].y >= b ) ? b : gameState.entities[id].y + 1
    gameState.entities[id].y = await checkCollision(id) ? gameState.entities[id].y - 1 : gameState.entities[id].y
    return true
  }
  else if( dir == 3 ) {
    let b = config.boardSize - 1
    gameState.entities[id].x = ( gameState.entities[id].x >= b ) ? b : gameState.entities[id].x + 1
    gameState.entities[id].x = await checkCollision(id) ? gameState.entities[id].x - 1 : gameState.entities[id].x
    return true
  }
  return false
}
let moveMonsters = async () => {
  for( let id in gameState.entities ) {
    if( id != game.heroID ) {
      await moveEntity(id, randomInt(4))
    }
  }
}
let processInput = async (c) => {
  readline.cursorTo(process.stdin, 0)
  if( systemState.ready ) {
    let dir = null
    if( c == `w` ) {
      dir = 0
    }
    else if( c == `a` ) {
      dir = 1
    }
    else if( c == `s` ) {
      dir = 2
    }
    else if( c == `d` ) {
      dir = 3
    }
    if( dir != null && gameState.entities[game.heroID] ) {
      systemState.ready = false
      await moveEntity( game.heroID, dir )
      await moveMonsters()
      await renderGame()

      if( game.status == `active` ) {
        systemState.ready = true
      }
    }
  }
}

let playGame = async () => {
  // await newGame()
  game = {"id":"11","status":"active","move":0,"boardSize":7,"heroID":"23055"}
  gameState = {"entities":{ "23055": {"id":"23055","x":0,"y":3,"hp":15,"class":"hero","attack":6,"gameID":"11"}, "23056": {"id":"23056","x":2,"y":0,"hp":15,"class":"monster","attack":6,"gameID":"11"}, "23057": {"id":"23057","x":2,"y":5,"hp":13,"class":"monster","attack":6,"gameID":"11"}, "23058": {"id":"23058","x":6,"y":1,"hp":8,"class":"monster","attack":6,"gameID":"11"}},"gameID":"11","move":0}


  systemState.footer = `Defeat the monsters. WASD to move. Bump to fight. (N)ew Game. EXI(T).\n`
  if( game.status == `active` ) {
    systemState.ready = true
  }
  await initRender()
  await renderGame()

  readline.emitKeypressEvents(process.stdin)
  if (process.stdin.isTTY)
    process.stdin.setRawMode(true);
  process.stdin.on(`keypress`, processInput )
}
playGame()

