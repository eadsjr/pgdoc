/**
 * The pg-doc core module
 *
 * This file is intended for use by NodeJS as an imported module.
 *
 * @todo TODO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
 */ 

const pg = require('pg')
const stringify = require('fast-safe-stringify')

let config = {
  database: 'pgdoc',
  schema: 'pgdoc'
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
  try {
    //console.log(`parsing`)
    //console.log(typeof(string))
    object = JSON.parse(string)
    // TODO: ensure no security hole here in case of compromised database / database connection
    return object;
  }
  catch (err) {
    // parse error?
    //console.error(err)
    return -3
  }
}

module.exports.JSON = { parse, stringify: str, str }


/**
 * Configure connection to postgres
*
 * @param {string} - connectionString - a URL path to connect to postgres with
 * @param {object} - options - a list of configuration options for pg-doc
 * @returns {number} - an error code. 0 if no error.
 */
module.exports.connect = async (connectionString, options) => {
  if( typeof(options) == 'object' ) {
    Object.assign(config, options)
  }
  config.connString = connectionString

  // TODO: verify back-end configuration with a query / sever proc
  let client = new pg.Client(connectionString);
  await client.connect()
  client.end()

  return 0
}

/**
 * Store a document in the database.
 *
 * @todo document sequence integer limits of postgres here
 * @param {string} - type - The type of document. AKA - The name of the document collection
 * @param {string} - data - A javascript object that can be stringified into proper JSON
 * @param {number} - [tid]     - OPTIONAL integer for identifying pg-doc transactions
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {number} - A sequential integer representing this request uniquely, or an error code
 */
module.exports.store = async (type, data, tid, options) => {

  data = str(data)
  let schema = config.schema

  // TODO: THIS IS NOT SQL INJECTION SAFE
  let command = `INSERT INTO ${schema}.docs VALUES ('${type}', '${data}') ;`
  //console.log(command)
  // INSERT INTO docs VALUES ('test','{"a":"a", "b":"b", "c":{"test":1}}') ;

  let client = new pg.Client(config.connString);
  await client.connect();
  try {
    let res = await client.query(command)
    client.end()
    if(res != null) {
      //console.log(res)
      //console.log(str(res))
      // TODO: more specific success validation
      if(res.rowCount > 0) {
        return 0 // SUCCESS CODE REF HERE
      }
      else {
        // Nothing was stored
        return -2 // ERROR CODE REF HERE
      }
    }
    else {
      return -1 // ERROR CODE REF HERE
    }
  }
  catch (err) {
    //console.error(err)
    client.end()
    return -1 // ERROR CODE REF HERE
  }
}

/**
 * Retrieve a list of objects built from JSON documents matching the fields of a JSON object.
 *
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @param {string} - search - An object with key-value pairs that must be matched to be returned.
 * @param {number} - [tid]     - OPTIONAL integer for identifying pg-doc transactions
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {list} - A list of javascript objects parsed from the document, or NULL
 */
module.exports.retrieve = async (type, search, tid, options) => {

  // let result = await module.exports.retrieveString(type, search, tid, options)
  // if( typeof result == 'number' ) {
  //   return result
  // }
  // else {
  //   //console.error(result)
  //   return parse(result)
  // }

  let schema = config.schema

  search = str(search)

  let command = `SELECT data FROM ${schema}.docs WHERE type = '${type}' AND data @> '${search}';`
  // console.log(command)

  let client = new pg.Client(config.connString);
  await client.connect();
  try {
    let res = await client.query(command)
    client.end()
    if(res != null) {
      // TODO: more specific success validation
      if(res.rowCount > 0) {
        // console.log(res)
        if(res.rowCount == 1) {
          let data = res.rows[0].data
          return data // SUCCESS CODE REF HERE
        }
        else {
          let data = res.rows
          return data // SUCCESS CODE REF HERE
        }
      }
      else {
        // Nothing was found
        return []
      }
    }
    else {
      return -1 // ERROR CODE REF HERE
    }
  }
  catch (err) {
    console.error(err)
    client.end()
    return -4 // ERROR CODE REF HERE
  }


  // let command = `SELECT docs VALUES ('${type}', '${data}') ;`
  // stringResponse = await retrieveString(type, search, tid, options)
  // return parse(stringResponse)
}

/**
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @param {string} - search - An object with key-value pairs that must be matched to be returned.
 * @param {number} - [tid]     - OPTIONAL integer for identifying pg-doc transactions
 * @param {object} - [options] - OPTIONAL object containing options to alter this function call
 * @returns {number} - The number of deleted documents, or a negative integer error code
 */
module.exports.delete = async (type, search, tid, options) => {
  // TODO

  // let command = `DELETE FROM docs WHERE type = '${type}' AND data @> '${search}';`
  // DELETE FROM docs WHERE type = 'test' AND data @> '{"a":"a"}' ;
}

/**
 * Get a new ID from the database, unique and unused for given document type
 *
 * @param {string} - type - The type of document. AKA - The name of the collection
 * @returns {object} - A javascript object parsed from the document, or null
 */
module.exports.requestID = async (type) => {

  let schema = config.schema

  // TODO: THIS IS NOT SQL INJECTION SAFE
  let command = `SELECT incrementSequence('${schema}', '${type}') ;`
  //console.log(command)
  // INSERT INTO docs VALUES ('test','{"a":"a", "b":"b", "c":{"test":1}}') ;

  let client = new pg.Client(config.connString);
  await client.connect();
  try {
    let res = await client.query(command)
    client.end()
    if(res != null) {
      //console.log(res)
      //console.log(str(res))
      // TODO: more specific success validation
      if(res.rowCount > 0) {
        //console.log(res)
        let data = res.rows[0].incrementsequence
        return data // SUCCESS CODE REF HERE
      }
      else {
        // Nothing was stored
        return -2 // ERROR CODE REF HERE
      }
    }
    else {
      return -1 // ERROR CODE REF HERE
    }
  }
  catch (err) {
    //console.error(err)
    client.end()
    return -1 // ERROR CODE REF HERE
  }
}

/**
 * Rollback the changes of the last action, or an action specified by id.
 *
 * WARNING: This may have side effects if multiple databases are using the database, and have already relied on the data you changed.
 * WARNING: This will have side effects if no tid is provided, and another executing function has performed a pg-doc action
 *
 * @todo document clearly the err object in this header
 *
 * @param {number} - [tid]     - OPTIONAL integer for identifying pg-doc transactions
 *
 * @returns {number} - errorCode - negative integer representing the kind of pg-doc error
 */
module.exports.undo = async (tid) => {
  // TODO
}

/**
 * Creates a fresh transaction identifier for use with pg-doc functions.
 *
 * These are simple sequential integers that provide you a means to reference a given action while several are in progress.
 *
 * They are not relevant outside of a given runtime, and are not stored in the database directly.
 *
 * @returns {number} - tid - integer for identifying pg-doc transactions
 */
let tid_count = 0
module.exports.tid = () => {
  return tid_count++
}

/**
 * Changes default options for all actions starting after this change takes effect.
 *
 * They can be overridden on a per-method-call basis
 *
 * @param {object} - options - object containing options to alter default function behavior
 *
 * @returns {number} - errorCode -  negative integer representing the kind of pg-doc error
 */
module.exports.configure = () => {
  // TODO
}

/// This private function creates the error object that is returned.
const error = (label, args) => {
  err = {}
  Object.assign( err, errors[label] )
  err.args = args
  return err
}

/**
 * Provides programmatic access to the error codes as a javascript Object indexed by label.
 */
const errors = {
  UnknownError:        { label: `UnknownError`,         code: -1,   description: `An unknown error has occurred.` },
  InvalidErrorCode:    { label: `InvalidErrorCode`,     code: -2,   description: `Invalid Error Code: Error code not found. Was it from a newer version of pgdoc?` },
  DatabaseUnreachable: { label: `DatabaseUnreachable`,  code: -3,   description: `When attempting to connect, the database was not found. Ensure it is online and that your connection configuration is correct.` },
  AccessDenied:        { label: `AccessDenied`,         code: -4,   description: `When attempting to connect, the database refused your connection due to failed authentication` },
  DatabaseNotCreated:  { label: `DatabaseNotCreated`,   code: -5,   description: `When attempting to connect, PostgreSQL connected but the specific database was not found. Ensure your installation completed successfully.` },
  BadPermissions:      { label: `BadPermissions`,       code: -6,   description: `When attempting to interact with the database, your action was rejected due to permissions settings in the database. Please ensure your installation completed successfully.` },
  NothingChanged:      { label: `NothingChanged`,       code: -7,   description: `The action succeeded but the database is unchanged. If this is expected it can be ignored safely.` },
  NoClobber:           { label: `NoClobber`,            code: -8,   description: `The store operation was rejected because it would overwrite existing data` },
  OnlyOne:             { label: `OnlyOne`,              code: -9,   description: `The retrieve operation returned multiple records when it shouldn't have.` },
  CreateFailed:        { label: `CreateFailed`,         code: -10,  description: `The create operation failed for unknown reasons.` },
  UpdateFailed:        { label: `UpdateFailed`,         code: -11,  description: `The update operation failed for unknown reasons.` },
  RetrieveFailed:      { label: `RetrieveFailed`,       code: -12,  description: `The retrieve operation failed for unknown reasons.` },
  DeleteFailed:        { label: `DeleteFailed`,         code: -12,  description: `The delete operation failed for unknown reasons.` },
  ConfigureFailed:     { label: `ConfigureFailed`,      code: -13,  description: `The configure operation failed for unknown reasons.` },
  RequestIDFailed:     { label: `RequestIDFailed`,      code: -14,  description: `The requestID operation failed for unknown reasons.` },
}
Object.freeze(errors)
module.exports.errors = errors
