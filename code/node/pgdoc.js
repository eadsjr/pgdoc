if( require.main === module ) { console.log(
`
The pgdoc core module. This NodeJS library provides a NoSQL interface to a PostgreSQL database.

This file is intended for use by NodeJS as an imported module. Interactive testing is not yet implemented.

Source & documentation available on Github:

https://github.com/eadsjr/pgdoc/
`
) ; process.exit(1) }

const pg = require('pg')
const stringify = require('fast-safe-stringify')

/// Default configuration
let config = {
  database: 'pgdoc',
  schema: 'pgdoc',
  verbose: false,
}

/**
 * SECTION: Core Functions
 */

/**
 * Configure connection to postgres
 *
 * @param {string} - connectionString - a URL path to connect to PostgreSQL with
 * @param {object} - options - a list of configuration options for pgdoc, made persistent with this call
 * @returns {object} - A pgdoc error object or { error: false }
 */
module.exports.connect = async (connectionString, options) => {
  let args = [connectionString, options]
  options = optionsOverride(options)
  if( options == null ) {
    return pgdocError(`BadOptions`, args)
  }
  if( connectionString == null ) {
    return pgdocError(`BadConnectionString`, args)
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
  return { error: false }
}

/**
 * Store a document in the database.
 * 
 * Stores the provided object in the database filed under the given type.
 * 
 * This will create duplicate records if not further constrained.
 * 
 * Optionally, a search filter object can be provided. This will delete any records found, allowing for updates to existing files.
 * 
 * This search can be constrained by a maxMatch integer, which if exceeded instead returns a MaxExceeded error.
 * 
 * You can exclude objects from the deletion event with an additional filter object.
 * 
 * Objects passed in as data/search/exclude will be in the form of non-circular javascript objects that can be stringified OR strings containing valid JSON
 * 
 * Setting maxMatch to 0 effectively requires the record to not already exist, and stores only in that case.
 * 
 * @todo document sequence integer limits of postgres here
 * @param {string} - type - The type of document. AKA - The name of the document collection
 * @param {object, string} - data - Object to be stored.
 * @param {object, string} - search - Object to filter results by, for which matches will be deleted.
 * @param {number} - maxMatch - An integer. If the search finds more then this many records, error out with MaxExceeded.
 * @param {object, string} - exclude - Object to filter results by, for which matches will be saved from deletion.
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {object, number} - A pgdoc error object or an object indicating the number of documents deleted in an overwrite. { error: false, deleted: <Integer> }
 */
module.exports.store = async (type, data, search, maxMatch, exclude, options) => {
  let args = [type, data, options]
  options = optionsOverride(options)
  if( options == null ) {
    return pgdocError(`BadOptions`, args)
  }
  data = str(data)
  if( search != null ) {
    search = str(search)
  }
  let schema = options.schema

  /// TODO: THIS IS NOT SQL INJECTION SAFE
  let command
  if( search == null ) {
    /// Simple store command. May produce duplicates.
    command = `INSERT INTO ${schema}.docs VALUES ('${type}', '${data}') ;`
    /// ex: INSERT INTO docs VALUES ('test','{"a":"a", "b":"b", "c":{"test":1}}') ;
  }
  else {
    /// Store command with search. May clobber or fail.
    if( maxMatch == null || maxMatch < 0 ) {
      /// Delete any matching records and store the value. Reports number of records deleted.
      command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}'; ` +
                `INSERT INTO ${schema}.docs VALUES ('${type}', '${data}') ;`
    }
    else if ( exclude != null ) {
      if( maxMatch == null || maxMatch < 0 ) {
        /// Delete any matching records that are not excluded and store the value. Reports number of records deleted.
        command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}' ` +
                  `AND NOT data @> '${exclude}'; ` +
                  `INSERT INTO ${schema}.docs VALUES ('${type}', '${data}') ;`
      }
      else {
        /// If the limit is not exceeded, delete matching records that are not excluded and store the value. Reports number of records deleted.
        command = `SELECT pgdoc.overwriteUnderMaxExcluding('${schema}', '${type}', '${data}', '${search}', ${maxMatch}, ${exclude}) ;`
      }
    }
    else {
      /// If the limit is not exceeded, delete matching records and store the value. Reports number of records deleted.
      command = `SELECT pgdoc.overwriteUnderMax('${schema}', '${type}', '${data}', '${search}', ${maxMatch}) ;`
    }
  }
  if(options.verbose) {
    console.log(command)
  }

  let client
  /// Execute store command
  try {
    /// Get connection online.
    client = new pg.Client(options.connectionString)
    if(client == null) {
      return pgdocError('UnknownError',args)
    }
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(options.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      /// TODO: more specific success validation
      if( search != null ) {
        /// Update case: expecting at least one result with a rowCount
        if( `length` in res && res.length > 0 && `rowCount` in res[1] ) {
          if( res[1].rowCount < 0 ) {
            err = pgdocError('MaxExceeded', args)
            err.description += ` Max: ${maxMatch}, Found: ${-res[1].rowCount}`
            return err
          }
          /// Deleted 0 or more rows based on search.
          return { error: false, deleted: res[1].rowCount }
        }
        else {
          return pgdocError('UpdateFailed', args)
        }
      }
      else if(res.rowCount > 0) {
        /// No search performed
        return { error: false, deleted: 0 }
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
 * @param {object, string} - search - An object with key-value pairs that must be matched to be returned.
 * @param {object, string} - exclude - An object with key-value pairs that must NOT be matched to be returned.
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {list} - A list of Javascript objects parsed from the document, or an error object.
 */
module.exports.retrieve = async (type, search, exclude, options) => {
  let args = [type, search, options]
  options = optionsOverride(options)
  if( options == null ) {
    return pgdocError(`BadOptions`, args)
  }
  search = str(search)
  let schema = options.schema

  let command
  if( exclude == null ) {
    command = `SELECT data FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  }
  else {
    command = `SELECT data FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}' ` +
              `AND NOT data @> '${exclude}';`
  }
  if(options.verbose) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(options.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(options.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      if(res.rowCount > 0) {
        /// Return a list of data items.
        let data = res.rows
        data.error = false
        return data
      }
      else {
        // Nothing was found
        let data = []
        data.error = false
        return data
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
  options = optionsOverride(options)
  if( options == null ) {
    return pgdocError(`BadOptions`, args)
  }
  search = str(search)
  let schema = options.schema

  let command
  if(search == null) {
    command = `DELETE FROM ${schema}.docs WHERE type = '${type}';`
  }
  else {
    command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  }
  /// DELETE FROM pgdocs.docs WHERE type = 'test' AND data @> '{"id":0}' ;
  if( options.verbose ) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(options.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(options.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      return { error: false, deleted: res.rowCount }
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
 * Get a new ID from the database, unique and unused for given document type.
 * 
 * The ID is always a string, and ID's from this function are sequential integers (in string form).
 * 
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {object} - A javascript object parsed from the document, or null
 */
module.exports.requestID = async (type, options) => {
  let args = [type]
  options = optionsOverride(options)
  if( options == null ) {
    return pgdocError(`BadOptions`, args)
  }
  let schema = options.schema

  // TODO: THIS IS NOT SQL INJECTION SAFE
  let command = `SELECT pgdoc.incrementSequence('${schema}', '${type}') ;`
  if(options.verbose) {
    console.log(command)
  }

  let client
  try {
    client = new pg.Client(options.connectionString)
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(options.verbose) {
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
 * They can also be overridden on a per-function-call basis.
 *
 * @param {object} - options - a list of configuration options for pgdoc, made persistent with this call
 * @returns {object} - A pgdoc error object or { error: false }
 */
module.exports.configure = ( options ) => {
  args = [options]
  if( typeof(options) == 'object' ) {
    Object.assign(config, options)
    return { error: false }
  }
  else {
    return pgdocError(`BadOptions`, args)
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
  if( typeof(object) != 'string' ) {
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

/// A code snippet useful for most core functions. Allows one-time config override.
const optionsOverride = ( options ) => {
  /// Explicit options override existing config
  if( options == null ) {
    options = {}
  }
  else if ( typeof(options) != 'object' ) {
    return null
  }
  let o = {}
  Object.assign( o, config )
  Object.assign( options, o )
  return options
}

/**
 * SECTION: Error handling
 */

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

const unhandledError = `\n!!!! pgdoc unhandled error! Please report the above object on an issue here: https://github.com/eadsjr/pgdoc/issues !!!!\n`
const unknownError   = `\n!!!! pgdoc unknown error! Please report any relevant details on an issue here: https://github.com/eadsjr/pgdoc/issues !!!!\n`

/// Handle common error cases
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
  MaxExceeded:         { error: true, label: `MaxExceeded`,          code: -19,  description: `The store operation failed due to the search filter finding more items then allowed by maxMatch.` },
}
Object.freeze(errors)
module.exports.errors = errors
