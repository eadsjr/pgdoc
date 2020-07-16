/**
 * The pgdoc core module
 *
 * This file is intended for use by NodeJS as an imported module.
 *
 * @todo TODO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
 */ 

const pg = require('pg')
const stringify = require('fast-safe-stringify')

let config = {
  database: 'pgdoc',
  schema: 'pgdoc',
  verbose: false,
}

/**
 * Stringify a javascript object, returning a string
 */
const str = (object) => {
  return stringify(object);
}

/**
 * Parse JSON string to a javascript object
 */
const parse = (string) => {
  args = [string]
  try {
    object = JSON.parse(string)
    /// TODO: ensure no security hole here in case of compromised database / database connection
    return object
  }
  catch (err) {
    /// Triggers on NaN, invalid JSON strings and possibly other strange input
    return pgdocError(`ParseFailed`, args)
  }
}

module.exports.JSON = { parse, stringify: str, str }

const unhandledError = `\n!!!! pgdoc unhandled error! Please report the above object on an issue here: https://github.com/eadsjr/pgdoc/issues !!!!\n`
const unknownError   = `\n!!!! pgdoc unknown error! Please report any relevant details on an issue here: https://github.com/eadsjr/pgdoc/issues !!!!\n`

const connectionErrorHandler = ( client, err, args, fallbackError ) => {
  if(client != null) {
    client.end()
  }
  if( err.code == `ECONNREFUSED` ) {
    /// SYSTEM: net.js: TCPConnectWrap.afterConnect: ECONNREFUSED
    return pgdocError(`DatabaseUnreachable`, args, err)
  }
  else if( err.code == `28000` ) {
    /// POSTGRES: error: role {} does not exist
    /// POSTGRES: error: role {} is not permitted to log in
    return pgdocError(`AccessDenied`, args, err)
  }
  else if( err.code == `42501` ) {
    /// POSTGRES: error: permission denied for schema {}
    /// POSTGRES: error: permission denied for table docs
    return pgdocError(`BadPermissions`, args, err)
  }
  else if( err.code == `3D000` ) {
    /// POSTGRES: error: database {} does not exist
    return pgdocError(`DatabaseNotCreated`, args, err)
  }
  else {
    if( fallbackError != null ) {
      console.error(err)
      console.error(unhandledError)
      return fallbackError
    }
    else {
      console.error(err)
      console.error(unhandledError)
      return pgdocError(`UnknownError`, args, err)
    }
  }
}

/**
 * Configure connection to postgres
 *
 * @param {string} - connectionString - a URL path to connect to postgres with
 * @param {object} - options - a list of configuration options for pgdoc
 * @returns {object} - A pgdoc error object. Null if no error.
 */
module.exports.connect = async (connectionString, options) => {
  let args = [connectionString, options]
  if( connectionString == null ) {
    return pgdocError(`BadConnectionString`, args)
  }
  if ( options != null ) {
    if( typeof(options) == 'object' ) {
      Object.assign(config, options)
    }
    else {
      return pgdocError(`BadOptions`, args)
    }
  }
  config.connectionString = connectionString

  try {
    let client = new pg.Client(connectionString);
    await client.connect()
    client.end()
  }
  catch (err) {
    return connectionErrorHandler(client, err, args, pgdocError( "ConnectFailed", args) )
  }
  return null /// All is well
}

/**
 * Store a document in the database.
 *
 * @todo document sequence integer limits of postgres here
 * @param {string} - type - The type of document. AKA - The name of the document collection
 * @param {string} - data - A javascript object that can be stringified into proper JSON
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {object, number} - A pgdoc error object or a number indicating the number of documents deleted in an overwrite. Usually 0.
 */
module.exports.store = async (type, data, search, options) => {
  let args = [type, data, options]

  if( typeof(data) != `string` ) {
    data = str(data)
  }
  if( search != null && typeof(search) != `string` ) {
    search = str(search)
  }
  let schema = config.schema

  /// TODO: option for NoClobber

  /// TODO: THIS IS NOT SQL INJECTION SAFE
  let command
  if( search == null ) {
    /// Simple store command. May produce duplicates.
    command = `INSERT INTO ${schema}.docs VALUES ('${type}', '${data}') ;`
  }
  else {
    /// Store command with search. May clobber or fail.
    if( options == null || ! (`maxMatch` in options) ) {
      /// Delete any matching records and store the value
      /// Return number of records deleted
      command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}'; ` +
                `INSERT INTO ${schema}.docs VALUES ('${type}', '${data}') ;`
    }
    else {
      /// If the limit is not reached, delete matching records and store the value
      /// React if limit is reached.
      /// TODO
      console.error(`ERR: maxMatch not implemented`)
      return null
    }
  }
  if(config.verbose) {
    console.log(command)
  }
  /// INSERT INTO docs VALUES ('test','{"a":"a", "b":"b", "c":{"test":1}}') ;

  let client
  /// Execute store command
  try {
    /// Get connection online.
    client = new pg.Client(config.connectionString)
    if(client == null) {
      return pgdocError('UnknownError',args)
    }
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      /// TODO: more specific success validation
      if( search != null ) {
        /// Update case: expecting at least one result with a rowCount
        if( `length` in res && res.length > 0 && `rowCount` in res[1] ) {
          return res[1].rowCount
        }
        else {
          return pgdocError('UpdateFailed', args)
        }
      }
      else if(res.rowCount > 0) {
        return 0
      }
      else {
        /// Nothing was stored
        return pgdocError('NothingChanged', args)
      }
    }
    else {
      console.error(unknownError)
      return pgdocError('StoreFailed', args)
    }
  }
  catch (err) {
    return connectionErrorHandler(client, err, args, pgdocError('StoreFailed', args) )
  }
}

/**
 * Retrieve a list of objects built from JSON documents matching the fields of a JSON object.
 *
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @param {string} - search - An object with key-value pairs that must be matched to be returned.
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {list} - A list of javascript objects parsed from the document, or NULL
 */
module.exports.retrieve = async (type, search, options) => {
  let args = [type, search, options]

  if( typeof(search) != `string` ) {
    search = str(search)
  }
  let schema = config.schema

  let command = `SELECT data FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  if(config.verbose) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(config.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      // TODO: more specific success validation
      if(config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      if(res.rowCount > 0) {
        if(res.rowCount == 1) {
          /// Return a single, naked data item.
          let data = res.rows[0].data
          return data
        }
        else {
          /// Return a list of data items.
          let data = res.rows
          return data
        }
      }
      else {
        // Nothing was found
        return []
      }
    }
    else {
      console.error(unknownError)
      return pgdocError('RetrieveFailed', args)
    }
  }
  catch (err) {
    return connectionErrorHandler(client, err, args, pgdocError('RetrieveFailed', args) )
  }
}

/**
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @param {string} - search - An object with key-value pairs that must be matched to be returned.
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {number} - The number of deleted documents, or a pgdoc error
 */
module.exports.delete = async (type, search, options) => {
  let args = [type, search, options]

  if( typeof(search) != `string` ) {
    search = str(search)
  }
  let schema = config.schema

  let command
  if(search == null) {
    command = `DELETE FROM ${schema}.docs WHERE type = '${type}';`
  }
  else {
    command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  }
  /// DELETE FROM pgdocs.docs WHERE type = 'test' AND data @> '{"id":0}' ;
  if( config.verbose ) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(config.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      // TODO: more specific success validation
      if(config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      return res.rowCount
    }
    else {
      console.error(unknownError)
      return pgdocError('DeleteFailed', args)
    }
  }
  catch (err) {
    return connectionErrorHandler(client, err, args, pgdocError('DeleteFailed', args) )
  }
}

/**
 * Get a new ID from the database, unique and unused for given document type
 *
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @returns {object} - A javascript object parsed from the document, or null
 */
module.exports.requestID = async (type) => {
  let args = [type]
  let schema = config.schema

  // TODO: THIS IS NOT SQL INJECTION SAFE
  let command = `SELECT pgdoc.incrementSequence('${schema}', '${type}') ;`
  if(config.verbose) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(config.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      // TODO: more specific success validation
      if(res.rowCount > 0) {
        let data = res.rows[0].incrementsequence
        return data
      }
      else {
        /// Nothing was stored
        return pgdocError('RequestIDFailed', args)
      }
    }
    else {
      /// Null response
      return pgdocError('RequestIDFailed', args)
    }
  }
  catch (err) {
    return connectionErrorHandler(client, err, args, pgdocError('RequestIDFailed', args) )
  }
}

/**
 * Changes default options for all actions starting after this change takes effect.
 *
 * They can be overridden on a per-method-call basis
 *
 * @param {object} - options - object containing options to alter default function behavior
 *
 * @returns {number} - errorCode -  negative integer representing the kind of pgdoc error
 */
module.exports.configure = ( options ) => {
  args = [options]
  if( typeof(options) == 'object' ) {
    Object.assign(config, options)
    return
  }
  else {
    return pgdocError(`BadOptions`, args)
  }
}

/// This private function creates the error object that is returned.
const pgdocError = (label, args, wrapped=null) => {
  err = {}
  Object.assign( err, errors[label] )
  err.args = args
  if( wrapped != null ) {
    err.wrapped = wrapped
  }
  return err
}

/**
 * Provides programmatic access to the error codes as a Javascript Object indexed by label.
 */
const errors = {
  UnknownError:        { error: true, label: `UnknownError`,         code: -1,   description: `An unknown error has occurred.` },
  DatabaseUnreachable: { error: true, label: `DatabaseUnreachable`,  code: -2,   description: `When attempting to connect, the database was not found. Ensure it is online and that your connection configuration is correct.` },
  AccessDenied:        { error: true, label: `AccessDenied`,         code: -3,   description: `When attempting to connect, the database refused your connection due to failed authentication. Ensure your installation completed successfully, and check your login configuration.` },
  DatabaseNotCreated:  { error: true, label: `DatabaseNotCreated`,   code: -4,   description: `When attempting to connect, PostgreSQL connected but the specific database requested was not found. Ensure your installation completed successfully and check your login configuration.` },
  BadPermissions:      { error: true, label: `BadPermissions`,       code: -5,   description: `When attempting to interact with the database, your action was rejected due to permissions settings in the database. Please ensure your installation completed successfully.` },
  NothingChanged:      { error: true, label: `NothingChanged`,       code: -6,   description: `The action succeeded but the database is unchanged. If this is expected it can be ignored safely.` },
  NoClobber:           { error: true, label: `NoClobber`,            code: -7,   description: `The store operation was rejected because it would overwrite existing data` },
  Clobber:             { error: true, label: `Clobbered`,            code: -8,   description: `The store operation was succeeded, but overwrote existing data` },
  OnlyOne:             { error: true, label: `OnlyOne`,              code: -9,   description: `The retrieve operation returned multiple records when it shouldn't have.` },
  ConnectFailed:       { error: true, label: `ConnectFailed`,        code: -10,  description: `The connect operation failed for unknown reasons.` },
  StoreFailed:         { error: true, label: `StoreFailed`,          code: -11,  description: `The create operation failed for unknown reasons.` },
  RetrieveFailed:      { error: true, label: `RetrieveFailed`,       code: -12,  description: `The retrieve operation failed for unknown reasons.` },
  DeleteFailed:        { error: true, label: `DeleteFailed`,         code: -13,  description: `The delete operation failed for unknown reasons.` },
  RequestIDFailed:     { error: true, label: `RequestIDFailed`,      code: -14,  description: `The requestID operation failed for unknown reasons.` },
  ParseFailed:         { error: true, label: `ParseFailed`,          code: -15,  description: `The pgdoc.JSON.parse call failed. Is the argument valid JSON?` },
  BadOptions:          { error: true, label: `BadOptions`,           code: -16,  description: `The options object passed into the function was not valid. It must be an object.` },
  BadConnectionString: { error: true, label: `BadConnectionString`,  code: -17,  description: `The connectionString object passed into the function was not valid. Please check your configuration.` },
  UpdateFailed:        { error: true, label: `UpdateFailed`,         code: -18,  description: `The store operation returned an unexpected result from the database. Expected 'rowCount' from delete operation, but couldn't find it.` },
}
Object.freeze(errors)
module.exports.errors = errors
