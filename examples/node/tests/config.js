config = {}
config.username = `pgdoc`
config.password = ``
config.hostname = `127.0.0.1`
config.port     = `5432`
config.database = `pgdoc`
config.schema   = `public`
config.connectionString = `postgres://${config.username}:${config.password}@${config.hostname}:${config.port}/${config.database}`

module.exports = config