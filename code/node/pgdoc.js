if( require.main === module ) { console.log(
`
The pgdoc core module. This NodeJS library provides a NoSQL interface to a PostgreSQL database.

This file is intended for use by NodeJS as an imported module. Interactive testing is not yet implemented.

Source & documentation available on Github:

https://github.com/eadsjr/pgdoc/
`
) ; process.exit(1) }

const pg = require(`pg`)
const stringify = require(`fast-safe-stringify`)

/// Default configuration
let config = {
  database: `pgdoc`, /// which database to access with the connected PostgreSQL system
  schema: `pgdoc`, /// which database schema to use in the connected database
  verboseSQL: false, /// if true, causes additional output specific to SQL
  verbose: false, /// if true, causes additional output
  quiet: false, /// if true, overrides verbose options, and also suppresses uncommon error output
}

/**
 * SECTION: Core Functions
 */

/**
 * Configure connection to postgres
 * 
 * This verifies that a connection to the database is in working order.
 * 
 * You should call it when starting your application.
 * 
 * This can be passed options to configure pgdoc in the same manner as pgdoc.configure()
 * 
 * @param {object} - params - all parameters, including a PostgreSQL 'connectionString'
 * @returns {object} - A pgdoc error object or { error: false }
 */
module.exports.connect = async (params) => {
  ({connectionString, options} = params)
  if( typeof(connectionString) != `string` ) {
    return pgdocError(`BadConnectionString`, params)
  }
  if( typeof(options) == `object` ) {
    Object.assign(config, options)
  }
  else if( options != null ) {
    return pgdocError(`BadOptions`, params)
  }

  config.connectionString = connectionString

  try {
    let client = new pg.Client(connectionString);
    await client.connect()
    client.end()
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError( `ConnectFailed`, params) )
  }
  return { error: false }
}

/**
 * Store a document in the database.
 * 
 * Stores the provided object in the database filed under the given type.
 * 
 * This will create duplicate records if not further constrained.
 * 
 * Optionally, a search filter object can be provided.
 * This will delete any records found, allowing for updates to existing files.
 * This search can be constrained by a maxMatch integer.
 * If maxMatch is exceeded, instead return a MaxExceeded error.
 * You can exclude objects from the deletion event with a exclude filter object.
 * 
 * data/search/exclude objects should non-circular Javascript objects that can be stringified
 * OR strings containing valid JSON
 * 
 * Setting maxMatch to 0 effectively requires the record to not already exist in the database
 * 
 * @param {object} - params - all parameters, including the document to be stored.
 * @returns {object} - A pgdoc error object or an object indicating the number of documents deleted in an overwrite. { error: false, deleted: <Integer> }
 */
module.exports.store = async (params) => {
  ({type, doc, search, maxMatch, exclude} = params)
  if( type == null ) {
    return pgdocError(`TypeMissing`, params)
  }
  if( doc == null ) {
    return pgdocError(`StoreDocMissing`, params)
  }
  else {
    doc = str(doc)
  }
  if( search != null ) {
    search = str(search)
  }
  if( exclude != null ) {
    exclude = str(exclude)
  }
  if( maxMatch != null ) {
    if( typeof(maxMatch) != `string` && typeof(maxMatch) != `number` ) {
      return pgdocError(`MaxMatchBadType`, params)
    }
  }
  // TODO: additional error handling
  // return pgdocError(`BadJSON`, params)
  // return pgdocError(`InsecureSQL`, params)
  let schema = config.schema

  let command, commandType

  /// Determine type of command
  if( search == null ) {
    /// Simple store command. May produce duplicates.
    commandType = commands.Store
  }
  else if( exclude == null ) {
    if( maxMatch == null ) {
      /// Delete any matching records and store the document.
      commandType = commands.StoreSearch
    }
    else {
      /// If the limit is not exceeded, delete matching records and store the document.
      commandType = commands.StoreSearchMax
    }
  }
  else if( maxMatch == null ) {
    /// Delete any matching records that are not excluded and store the document.
    commandType = commands.StoreSearchExclude
  }
  else {
    /// If the limit is not exceeded, delete matching records that are not excluded.
    /// Then store the document.
    commandType = commands.StoreSearchExcludeMax
  }

  /// Now build up SQL statement. Values not needed for the given command type are ignored.
  /// TODO: THIS IS NOT SQL INJECTION SAFE
  doc      = doc      != null ? `'${doc}'`     : `NULL`
  search   = search   != null ? `'${search}'`  : `NULL`
  exclude  = exclude  != null ? `'${exclude}'` : `NULL`
  maxMatch = maxMatch != null ? maxMatch       : `NULL`
  command  = `SELECT pgdoc.store(${commandType},` +
                                `'${schema}',` +
                                `'${type}',` +
                                `${doc},` +
                                `${search},` +
                                `${maxMatch},` +
                                `${exclude}` +
                                `) AS data;`
  if(!config.quiet && (config.verbose || config.verboseSQL) ) {
    console.log(`command: ${command}`)
    console.log(`commandType: ${commandType}`)
  }

  let client
  /// Execute store command
  try {
    /// Get connection online.
    client = new pg.Client(config.connectionString)
    if(client == null) {
      return pgdocError(`UnknownError`,params)
    }
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(!config.quiet && config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      if( res.rowCount == 1 && res.rows.length > 0 && `data` in res.rows[0] ) {
        let data = res.rows[0].data
        if( data.MaxExceededError != null ) {
          err = pgdocError(`MaxExceeded`, params)
          err.description += ` Max: ${maxMatch}, Found: ${data.MaxExceededError}`
          return err
        }
        if( data.UnknownCommandError != null ) {
          err = pgdocError(`UnknownCommandError`, params)
        }
        let rv = { error: false, deleted: data.deleted }
        return rv /// Should be something like { deleted: <int>, error: false }
      }
      else {
        // return pgdocError(`NothingChanged`, params)
        if(!config.quiet) {
          console.error(unknownError)
        }
        let err = pgdocError(`BadReturnValue`, params)
        err.description += str(res)
        return err
      }
    }
    else {
      if(!config.quiet) {
        console.error(unknownError)
      }
      return pgdocError(`NoReturnValue`, params)
    }
  }
  catch (err) {
    if(!config.quiet) {
      console.error(unknownError)
    }
    return connectionErrorHandler( client, err, params, pgdocError(`StoreFailed`, params) )
  }
}

/**
 * Retrieve a list of objects built from JSON documents matching the fields of a JSON object.
 *
 * LIMITATION: Currently a top level member of a data object called 'MaxExceededError' will cause this function to fail.
 *
 * @param {object} - params - all parameters, including a search object to seek matches with.
 * @returns {list} - A list of Javascript objects parsed from the document, or an error object.
 */
module.exports.retrieve = async (params) => {
  ({type, search, maxMatch, exclude} = params)
  if( type == null ) {
    return pgdocError(`TypeMissing`, params)
  }
  if( search != null ) {
    search = str(search)
  }
  if( exclude != null ) {
    exclude = str(exclude)
  }
  if( maxMatch != null ) {
    if( typeof(maxMatch) != `string` && typeof(maxMatch) != `number` ) {
      return pgdocError(`MaxMatchBadType`, params)
    }
  }
  // TODO: additional error handling
  // return pgdocError(`BadJSON`, params)
  // return pgdocError(`InsecureSQL`, params)
  let schema = config.schema

  let command, commandType

  /// Determine type of command
  if( search == null ) {
    /// Return all records of given type.
    commandType = commands.Retrieve
  }
  else if( exclude == null ) {
    if( maxMatch == null ) {
      /// Return matching records.
      commandType = commands.RetrieveSearch
    }
    else {
      /// If the limit is not exceeded, return matching records.
      commandType = commands.RetrieveSearchMax
    }
  }
  else if( maxMatch == null ) {
    /// Return matching records that are not excluded.
    commandType = commands.RetrieveSearchExclude
  }
  else {
    /// If the limit is not exceeded, return matching records that are not excluded.
    commandType = commands.RetrieveSearchExcludeMax
  }

  /// Now build up SQL statement. Values not needed for the given command type are ignored.
  /// TODO: THIS IS NOT SQL INJECTION SAFE
  doc      = `NULL`
  search   = search   != null ? `'${search}'`  : `NULL`
  exclude  = exclude  != null ? `'${exclude}'` : `NULL`
  maxMatch = maxMatch != null ? maxMatch       : `NULL`
  command  = `SELECT pgdoc.retrieve(${commandType},` +
                                   `'${schema}',` +
                                   `'${type}',` +
                                   `${doc},` +
                                   `${search},` +
                                   `${maxMatch},` +
                                   `${exclude}` +
                                   `) AS data;`
  if(!config.quiet && (config.verbose || config.verboseSQL) ) {
    console.log(`command: ${command}`)
    console.log(`commandType: ${commandType}`)
  }

  let client
  try {
    client = new pg.Client(config.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(!config.quiet && config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      try {
        let data
        if( res.rows.length > 0 ) {
          data = res.rows[0].data
          if( data.MaxExceededError != null ) {
            err = pgdocError(`MaxExceeded`, params)
            err.description += ` Max: ${maxMatch}, Found: ${data.MaxExceededError}`
            return err
          }
          if( data.UnknownCommandError != null ) {
            return pgdocError(`UnknownCommandError`, params)
          }
        }

        /// Return a list of data items.
        let docs = []
        for( r in res.rows ) {
          docs.push(res.rows[r].data)
        }
        docs.error = false
        return docs
      }
      catch (wrappedError) {
        if(!config.quiet) {
          console.error(unknownError)
        }
        let err = pgdocError(`BadReturnValue`, params, wrappedError)
        err.description += str(res)
        return err
      }
    }
    else {
      if(!config.quiet) {
        console.error(unknownError)
      }
      return pgdocError(`NoReturnValue`, params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError(`RetrieveFailed`, params) )
  }
}

/**
 * Delete zero or more documents from the database given a type and constraints.
 * 
 * @param {object} - params - all parameters, optionally including a search to narrow down results.
 * @returns {number} - An object with the number of deleted documents under '.deleted', or a pgdoc error
 */
module.exports.delete = async (params) => {
  ({type, search, maxMatch, exclude} = params)
  if( type == null ) {
    return pgdocError(`TypeMissing`, params)
  }
  if( search != null ) {
    search = str(search)
  }
  if( exclude != null ) {
    exclude = str(exclude)
  }
  if( maxMatch != null ) {
    if( typeof(maxMatch) != `string` && typeof(maxMatch) != `number` ) {
      return pgdocError(`MaxMatchBadType`, params)
    }
  }
  // TODO: additional error handling
  // return pgdocError(`BadJSON`, params)
  // return pgdocError(`InsecureSQL`, params)
  let schema = config.schema

  let command, commandType


  /// Determine type of command
  if( search == null ) {
    /// Delete all files of given type.
    commandType = commands.Delete
  }
  else if( exclude == null ) {
    if( maxMatch == null ) {
      /// Delete any matching records.
      commandType = commands.DeleteSearch
    }
    else {
      /// If the limit is not exceeded, delete matching records.
      commandType = commands.DeleteSearchMax
    }
  }
  else if( maxMatch == null ) {
    /// Delete any matching records that are not excluded.
    commandType = commands.DeleteSearchExclude
  }
  else {
    /// If the limit is not exceeded, delete matching records that are not excluded.
    commandType = commands.DeleteSearchExcludeMax
  }

  /// Now build up SQL statement. Values not needed for the given command type are ignored.
  /// TODO: THIS IS NOT SQL INJECTION SAFE
  doc      = `NULL`
  search   = search   != null ? `'${search}'`  : `NULL`
  exclude  = exclude  != null ? `'${exclude}'` : `NULL`
  maxMatch = maxMatch != null ? maxMatch       : `NULL`
  command  = `SELECT pgdoc.delete(${commandType},` +
                                 `'${schema}',` +
                                 `'${type}',` +
                                 `${doc},` +
                                 `${search},` +
                                 `${maxMatch},` +
                                 `${exclude}` +
                                 `) AS data;`
  if(!config.quiet && (config.verbose || config.verboseSQL) ) {
    console.log(`command: ${command}`)
    console.log(`commandType: ${commandType}`)
  }

  let client
  try {
    client = new pg.Client(config.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(!config.quiet && config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      if( res.rowCount == 1 && res.rows.length > 0 && `data` in res.rows[0] ) {
        let data = res.rows[0].data
        if( data.MaxExceededError != null ) {
          err = pgdocError(`MaxExceeded`, params)
          err.description += ` Max: ${maxMatch}, Found: ${data.MaxExceededError}`
          return err
        }
        if( data.UnknownCommandError != null ) {
          err = pgdocError(`UnknownCommandError`, params)
        }
        let rv = { error: false, deleted: data.deleted }
        return rv /// Should be something like { deleted: <int>, error: false }
      }
      else {
        if(!config.quiet) {
          console.error(unknownError)
        }
        let err = pgdocError(`BadReturnValue`, params)
        err.description += str(res)
        return err
      }
    }
    else {
      if(!config.quiet) {
        console.error(unknownError)
      }
      return pgdocError(`NoReturnValue`, params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError(`DeleteFailed`, params) )
  }
}

/**
 * Get a new ID from the database, unique and unused for given document type.
 * 
 * The ID is always a string, and ID's from this function are sequential integers (in string form).
 * 
 * ID's provided by this rely on PostgreSQL sequences, which use 8 byte bigint arithmetic.
 * They will roll over to negative after 9223372036854775807.
 * The way this is handled can cause gaps in the sequence under certain conditions.
 * It has not yet been verified this case arises in pgdoc.
 * REFERENCE: https://www.postgresql.org/docs/12/sql-createsequence.html#:~:text=Sequences%20are%20based%20on%20bigint
 * 
 * No pgdoc.js code explicitly relies on the ID, nearly any string or JSON object you use will do.
 * 
 * @param {object} - params - all parameters, including the type of the document to get an ID for
 * @returns {object} - A string containing an integer value, starting at 1 or a pgdoc error
 */
module.exports.requestID = async (params) => {
  ({type} = params)

  // TODO: THIS IS NOT SQL INJECTION SAFE
  let command = `SELECT pgdoc.incrementSequence('${config.schema}', '${type}') ;`
  if(!config.quiet && (config.verbose || config.verboseSQL)) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(config.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(!config.quiet && config.verbose) {
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
        return pgdocError(`RequestIDFailed`, params)
      }
    }
    else {
      /// Null response
      return pgdocError(`RequestIDFailed`, params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError(`RequestIDFailed`, params) )
  }
}

/**
 * Changes default options for all actions starting after this change takes effect.
 *
 * Only provided fields will be updated, all others remain unchanged.
 *
 * @param {object} - params - all parameters, including 
 * @returns {object} - A pgdoc error object or { error: false }
 */
module.exports.configure = ( params ) => {
  ({options} = params)
  if( typeof(options) == `object` ) {
    Object.assign(config, options)
    return { error: false }
  }
  else {
    return pgdocError(`BadOptions`, params)
  }
}

/**
 * SECTION: Utility functions
 */

/**
 * Stringify a Javascript object, returning a string.
 * 
 * If it is already a string, it is returned unmodified.
 *
 * NOTE: The object may lose circular or complex references, such as functions.
 * 
 * @param {object} - object - A Javascript object to be stringified.
 * @returns {string} - A JSON string representation of the object passed in.
 */
const str = (object) => {
  if( typeof(object) != `string` ) {
    return stringify(object);
  }
  else return object
}

/**
 * Parse JSON string to a javascript object
 * 
 * @param {string} - string - A JSON string to be parsed into a Javascript object.
 * @returns {object} - A Javascript object represented by the string passed in.
 */
const parse = (string) => {
  params = [string]
  try {
    object = JSON.parse(string)
    /// TODO: ensure no security hole here in case of compromised database / database connection
    return object
  }
  catch (err) {
    /// Triggers on NaN, invalid JSON strings and possibly other strange input
    return pgdocError(`ParseFailed`, params)
  }
}

module.exports.JSON = { parse, stringify: str, str }


/**
 * SECTION: Error handling
 */

/// This private function creates the error object that is returned.
const pgdocError = (label, params, wrapped=null) => {
  err = {}
  Object.assign( err, errors[label] )
  err.params = params
  if( wrapped != null ) {
    err.wrapped = wrapped
  }
  return err
}

const unknownError   = `\n!!!! pgdoc unknown error! Please report any relevant details on an issue here: https://github.com/eadsjr/pgdoc/issues !!!!\n`

/// Handle common error cases
const connectionErrorHandler = ( client, err, params, fallbackError ) => {
  if(client != null) {
    client.end()
  }
  if( err.code == `ECONNREFUSED` ) {
    /// SYSTEM: net.js: TCPConnectWrap.afterConnect: ECONNREFUSED
    return pgdocError(`DatabaseUnreachable`, params, err)
  }
  else if( err.code == `28000` ) {
    /// POSTGRES: error: role {} does not exist
    /// POSTGRES: error: role {} is not permitted to log in
    return pgdocError(`AccessDenied`, params, err)
  }
  else if( err.code == `42501` ) {
    /// POSTGRES: error: permission denied for schema {}
    /// POSTGRES: error: permission denied for table docs
    return pgdocError(`BadPermissions`, params, err)
  }
  else if( err.code == `3D000` ) {
    /// POSTGRES: error: database {} does not exist
    return pgdocError(`DatabaseNotCreated`, params, err)
  }
  else {
    if(!config.quiet) {
      console.error(err)
      console.error(`\n!!!! pgdoc unhandled error! Please report the above object on an issue here: https://github.com/eadsjr/pgdoc/issues !!!!\n`)
    }
    if( fallbackError != null ) {
      return fallbackError
    }
    else {
      return pgdocError(`UnknownError`, params, err)
    }
  }
}

/**
 * Provides programmatic access to the error codes as a Javascript Object indexed by label.
 */
const errors = {
  UnknownError:        { error: true, label: `UnknownError`,         code: -1,   description: `An unknown error has occurred. Please report it.` },
  DatabaseUnreachable: { error: true, label: `DatabaseUnreachable`,  code: -2,   description: `When attempting to connect, the database was not found. Ensure it is online and that your connection configuration is correct.` },
  AccessDenied:        { error: true, label: `AccessDenied`,         code: -3,   description: `When attempting to connect, the database refused your connection due to failed authentication. Ensure your installation completed successfully, and check your login configuration.` },
  DatabaseNotCreated:  { error: true, label: `DatabaseNotCreated`,   code: -4,   description: `When attempting to connect, PostgreSQL connected but the specific database requested was not found. Ensure your installation completed successfully and check your login configuration.` },
  BadPermissions:      { error: true, label: `BadPermissions`,       code: -5,   description: `When attempting to interact with the database, your action was rejected due to permissions settings in the database. Please ensure your installation completed successfully.` },
  ConnectFailed:       { error: true, label: `ConnectFailed`,        code: -6,   description: `The connect operation failed for unknown reasons.` },
  TypeMissing:         { error: true, label: `TypeMissing`,          code: -7,   description: `Document type was not provided: all core functions require document type.` },
  MaxMatchBadType:     { error: true, label: `MaxMatchBadType`,      code: -8,   description: `MaxMatch type was not a string or number, or was not an integer. MaxMatch should be zero or a positive integer.` },
  StoreFailed:         { error: true, label: `StoreFailed`,          code: -9,   description: `The store operation failed for unknown reasons.` },
  StoreDocMissing:     { error: true, label: `StoreDocMissing`,      code: -10,  description: `A document was not provided to pgdoc.store()` },
  RetrieveFailed:      { error: true, label: `RetrieveFailed`,       code: -11,  description: `The retrieve operation failed for unknown reasons.` },
  DeleteFailed:        { error: true, label: `DeleteFailed`,         code: -12,  description: `The delete operation failed for unknown reasons.` },
  RequestIDFailed:     { error: true, label: `RequestIDFailed`,      code: -13,  description: `The requestID operation failed for unknown reasons.` },
  BadReturnValue:      { error: true, label: `BadReturnValue`,       code: -14,  description: `Returned an unexpected response from the database.\n` },
  NoReturnValue:       { error: true, label: `NoReturnValue`,        code: -15,  description: `Returned an empty response from the database.` },
  MaxExceeded:         { error: true, label: `MaxExceeded`,          code: -16,  description: `Search found more items then allowed by maxMatch.` },
  UnknownCommandError: { error: true, label: `UnknownCommandError`,  code: -17,  description: `pgdoc internal error: The command number sent to a database function was not recognized!` },
  ParseFailed:         { error: true, label: `ParseFailed`,          code: -18,  description: `The pgdoc.JSON.parse call failed. Is the argument valid JSON?` },
  BadOptions:          { error: true, label: `BadOptions`,           code: -19,  description: `The options object passed into the function was not valid. It must be an object.` },
  BadConnectionString: { error: true, label: `BadConnectionString`,  code: -20,  description: `The connectionString object passed into the function was not valid. Please check your configuration.` },
  BadJSON:             { error: true, label: `BadJSON`,              code: -21,  description: `The JSON provided was malformed` },
  InsecureSQL:         { error: true, label: `InsecureSQL`,          code: -21,  description: `The input provided appears dangerous or malicious, and was rejected.` },
}
Object.freeze(errors)
module.exports.errors = errors

const commands = {
  Store: 1,
  StoreSearch: 2,
  StoreSearchMax: 3,
  StoreSearchExclude: 4,
  StoreSearchExcludeMax: 5,
  Retrieve: 101,
  RetrieveSearch: 102,
  RetrieveSearchMax: 103,
  RetrieveSearchExclude: 104,
  RetrieveSearchExcludeMax: 105,
  Delete: 201,
  DeleteSearch: 202,
  DeleteSearchMax: 203,
  DeleteSearchExclude: 204,
  DeleteSearchExcludeMax: 205,
}

