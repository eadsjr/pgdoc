/**
 * The pg-doc core module
 *
 * This file is intended for use by NodeJS as an imported module.
 *
 * @todo TODO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
 */ 

const pg = require('pg');
const str = require('fast-safe-stringify')

let config = {
  database: 'pgdoc',
  schema: 'pgdoc'
}

/**
 * Stringify a javascript object, returning a string
 */
module.exports.stringify = (object) => {
  return str(object);
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
module.exports.parse = parse


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


/**
 * Provide an error code for the last action.
 *
 * @returns {number} - errorCode -  negative integer representing the kind of pg-doc error
 */
module.exports.errorCode = () => {
  // TODO
}

/**
 * Provide an error code based on a short string description.
 * Intended to make code more readable.
 *
 * @param {string} - errorLabel - descriptive string naming error
 * @returns {number} - errorCode -  negative integer representing the kind of pg-doc error
 */
module.exports.errorCodeFor = (errorLabel) => {
  if( errorLabel == "CLOBBERED" ) { return -2 } // TODO: change this to match spec
  // TODO
}

/**
 * Provide an error message given an errorCode.
 * 
 * @todo TODO: finish implementing error code spec
 * @todo TODO: update errorMessage() to conform to error code spec
 * 
 * @returns {string} - A human-readable error description ready for logging
 */
module.exports.errorMessage = (string) => {
  if( errorCode >    0 ) { return `Invalid Error Code: Positive number.` }
  if( errorCode ==   0 ) { return `Action complete successfully` }
  if( errorCode ==  -1 ) { return `Unknown Error` }
  if( errorCode ==  -2 ) { return `Query completed, but nothing changed` }
  if( errorCode ==  -3 ) { return `Error Parsing value` } // TODO: change this to match spec
  if( errorCode <   -3 ) { return `Invalid Error Code: Error code not found. Was it from a newer version?` } // TODO: update as error codes are added
}
