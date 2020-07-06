config = {}
config.username = `griddungeon`
config.password = ``
config.hostname = `127.0.0.1`
config.port     = `5432`
config.database = `pgdoc`
// config.database = `griddungeon`
config.schema   = `griddungeon`
config.connectionString = `postgres://${config.username}:${config.password}@${config.hostname}:${config.port}/${config.database}`

module.exports = config