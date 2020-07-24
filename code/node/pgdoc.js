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
  quiet: false,
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
 * @param {object} - params - all parameters, including a PostgreSQL 'connectionString'
 * @returns {object} - A pgdoc error object or { error: false }
 */
module.exports.connect = async (params) => {
  ({connectionString, options} = params)
  if( typeof(connectionString) != `string` ) {
    return pgdocError(`BadConnectionString`, params)
  }
  if( typeof(options) == 'object' ) {
    Object.assign(config, options)
  }
  config.connectionString = connectionString

  try {
    let client = new pg.Client(connectionString);
    await client.connect()
    client.end()
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError( "ConnectFailed", params) )
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
 * Setting maxMatch to 0 effectively requires the record to not already exist in the database, and stores only in that case.
 * 
 * @todo document sequence integer limits of postgres here
 * @param {object} - params - all parameters, including the document to be stored.
 * @returns {object} - A pgdoc error object or an object indicating the number of documents deleted in an overwrite. { error: false, deleted: <Integer> }
 */
module.exports.store = async (params) => {
  ({type, doc, search, maxMatch, exclude} = params)
  doc = str(doc)
  if( search != null ) {
    search = str(search)
  }
  let schema = config.schema

  /// TODO: THIS IS NOT SQL INJECTION SAFE
  let command
  if( search == null ) {
    /// Simple store command. May produce duplicates.
    command = `INSERT INTO ${schema}.docs VALUES ('${type}', '${doc}') ;`
    /// ex: INSERT INTO docs VALUES ('test','{"a":"a", "b":"b", "c":{"test":1}}') ;
  }
  else {
    /// Store command with search. May clobber or fail.
    if( maxMatch == null || maxMatch < 0 ) {
      /// Delete any matching records and store the value. Reports number of records deleted.
      command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}'; ` +
                `INSERT INTO ${schema}.docs VALUES ('${type}', '${doc}') ;`
    }
    else if ( exclude != null ) {
      if( maxMatch == null || maxMatch < 0 ) {
        /// Delete any matching records that are not excluded and store the value. Reports number of records deleted.
        command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}' ` +
                  `AND NOT data @> '${exclude}'; ` +
                  `INSERT INTO ${schema}.docs VALUES ('${type}', '${doc}') ;`
      }
      else {
        /// If the limit is not exceeded, delete matching records that are not excluded and store the value. Reports number of records deleted.
        command = `SELECT pgdoc.overwriteUnderMaxExcluding('${schema}', '${type}', '${doc}', '${search}', ${maxMatch}, ${exclude}) ;`
      }
    }
    else {
      /// If the limit is not exceeded, delete matching records and store the value. Reports number of records deleted.
      command = `SELECT pgdoc.overwriteUnderMax('${schema}', '${type}', '${doc}', '${search}', ${maxMatch}) ;`
    }
  }
  if(!config.quiet && config.verbose) {
    console.log(command)
  }

  let client
  /// Execute store command
  try {
    /// Get connection online.
    client = new pg.Client(config.connectionString)
    if(client == null) {
      return pgdocError('UnknownError',params)
    }
    await client.connect()
    let res = await client.query(command)
    client.end()
    if(res != null) {
      if(!config.quiet && config.verbose) {
        console.log(`received response: ${str(res)}`)
        console.log(res)
      }
      /// TODO: more specific success validation
      if( search != null ) {
        /// Update case: expecting at least one result with a rowCount
        if( `length` in res && res.length > 0 && `rowCount` in res[1] ) {
          if( res[1].rowCount < 0 ) {
            err = pgdocError('MaxExceeded', params)
            err.description += ` Max: ${maxMatch}, Found: ${-res[1].rowCount}`
            return err
          }
          /// Deleted 0 or more rows based on search.
          return { error: false, deleted: res[1].rowCount }
        }
        else {
          return pgdocError('UpdateFailed', params)
        }
      }
      else if(res.rowCount > 0) {
        /// No search performed
        return { error: false, deleted: 0 }
      }
      else {
        /// Nothing was stored
        return pgdocError('NothingChanged', params)
      }
    }
    else {
      if(!config.quiet) {
        console.error(unknownError)
      }
      return pgdocError('StoreFailed', params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError('StoreFailed', params) )
  }
}

/**
 * Retrieve a list of objects built from JSON documents matching the fields of a JSON object.
 *
 * @param {object} - params - all parameters, including a search object to seek matches with.
 * @returns {list} - A list of Javascript objects parsed from the document, or an error object.
 */
module.exports.retrieve = async (params) => {
  ({type, search, maxMatch, exclude} = params)
  search = str(search)
  let schema = config.schema

  let command
  if( exclude == null ) {
    command = `SELECT data FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  }
  else {
    command = `SELECT data FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}' ` +
              `AND NOT data @> '${exclude}';`
  }
  if(!config.quiet && config.verbose) {
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
      if(res.rowCount > 0) {
        /// Return a list of data items.
        let docs = []
        for( r in res.rows ) {
          docs.push(res.rows[r].data)
        }
        docs.error = false
        return docs
      }
      else {
        // Nothing was found
        let docs = []
        docs.error = false
        return docs
      }
    }
    else {
      if(!config.quiet) {
        console.error(unknownError)
      }
      return pgdocError('RetrieveFailed', params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError('RetrieveFailed', params) )
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
  search = str(search)
  let schema = config.schema

  let command
  if(search == null) {
    command = `DELETE FROM ${schema}.docs WHERE type = '${type}';`
  }
  else {
    command = `DELETE FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  }
  /// DELETE FROM pgdocs.docs WHERE type = 'test' AND data @> '{"id":0}' ;
  if( !config.quiet && config.verbose ) {
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
      return { error: false, deleted: res.rowCount }
    }
    else {
      if(!config.quiet) {
        console.error(unknownError)
      }
      return pgdocError('DeleteFailed', params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError('DeleteFailed', params) )
  }
}

/**
 * Get a new ID from the database, unique and unused for given document type.
 * 
 * The ID is always a string, and ID's from this function are sequential integers (in string form).
 * 
 * @param {object} - params - all parameters, including the type of the document to get an ID for
 * @returns {object} - A string containing an integer value, starting at 1 or a pgdoc error
 */
module.exports.requestID = async (params) => {
  ({type} = params)
  let schema = config.schema

  // TODO: THIS IS NOT SQL INJECTION SAFE
  let command = `SELECT pgdoc.incrementSequence('${schema}', '${type}') ;`
  if(!config.quiet && config.verbose) {
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
        return pgdocError('RequestIDFailed', params)
      }
    }
    else {
      /// Null response
      return pgdocError('RequestIDFailed', params)
    }
  }
  catch (err) {
    return connectionErrorHandler( client, err, params, pgdocError('RequestIDFailed', params) )
  }
}

/**
 * Changes default options for all actions starting after this change takes effect.
 *
 * They can also be overridden on a per-function-call basis.
 *
 * @param {object} - params - all parameters, including 
 * @returns {object} - A pgdoc error object or { error: false }
 */
module.exports.configure = ( params ) => {
  ({options} = params)
  if( typeof(options) == 'object' ) {
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
