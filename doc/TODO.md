TODO.md

# TODO List

implement protection as per [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.md)
Use stored procs with EXECUTE...USING to prevent injection. SEE: [PostgresQL Docs](https://www.postgresql.org/docs/11/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN)
<pre>

implement the noClobber option to enhance the store / update function
implement the maxMatch option for select/delete
print errors to console given the verbose option

retrieveField(type, search, field)
  let command = `SELECT data->>'${field}' FROM ${docs} WHERE name = '${name}' AND meta = '${meta}';`;
storeField(type, search, field) ??

code/node/pgdoc.js: better error message for bad search JSON object, missing quotes on field name
code/node/pgdoc.js: pass in transaction IDs to allow async polling for return values / error codes
code/node/pgdoc.js: prune old stored results
code/node/pgdoc.js: prune old stored results, option: set time to keep alive
code/node/pgdoc.js: prune old stored results, option: delete on successful read
code/node/pgdoc.js: implement basic functions with asyncronous execution using async/await
code/node/pgdoc.js: ensure basic functions with strings provided instead
code/node/pgdoc.js: ensure basic functions work for objects
code/node/pgdoc.js: ensure basic functions work for strings
code/node/pgdoc.js: ensure basic functions work for classes
code/node/pgdoc.js: @todo TODO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
code/node/pgdoc.js: warn people that undo() may have side effects if other servers have already relied on the data

code/sql/install_pgdoc.sql: Add functions to pgdoc schema?
code/sql/install_pgdoc.sql: Update to current postgresql

SECURITY: Ensure that anything that would break postgres fails with an error code. Validate everything that would be passed through.

docs/: add tutorial on installing postgresql

docs/CRUD_Examples.md: add an example with an option noClobber to prevent overwrites
docs/CRUD_Examples.md: add a select example using maxMatch option
docs/CRUD_Examples.md: Update to not use deprecated connectionString
docs/CRUD_Examples.md: everything in all markdown should not require horizontal scrolling on a normal sized window
docs/CRUD_Examples.md: add hyperlink to install script reference
docs/CRUD_Examples.md: convert entire interface to return an object, and previous values stored in a standard member of that object, like .doc.
docs/CRUD_examples.md: use this file as spec for implemention (once finalized and an async method is decided)

docs/CONTRIBUTING.md: Add links to GitHub's instructions on how to submit a pull request

README.md: Note possibility of errors being throw due to running out of memory, call stack depth, etc.
README.md: Add compatibility notes with various postgres versions
README.md: Add compatibility notes with other libraries and modules such as pg-connect
README.md: Add limitations section concerning sequences breaking at scale
README.md: Add limitations section concerning accessing data store in db by other means
README.md: Add limitations section concerning lossy stringification around ES 6+ classes
README.md: Add limitations section concerning lossy stringification around circle references
README.md: Add limitations section concerning thread safety of undo() in languages other then javascript
README.md: Add limitations section concerning thread safety of errorCode() in languages other then javascript
README.md: Add 'See Also' section concerning other relevant projects and modules
README.md: Mention postgresql more clearly in README

SEE ALSO: README.md Planned features
</pre>

# DONE List

<pre>
removing retrieveString(), because 'pg' module returns stored JSONB as an object
docs/CRUD_Examples.md: add a maxMatch option for select/delete
docs/CRUD_Examples.md: Change undo() example to instead use options
docs/CRUD_Examples.md: Rewrite all examples to be asyncrounous!
docs/CRUD_examples.md: configure connection to database
docs/CRUD_examples.md: wrote out example cases (syncronous)
code/node/pgdoc.js: determine async method
move pgdoc relations to pgdoc SCHEMA
default to pgdoc SCHEMA, but allow custom via configuration
Major cleanup on error handling
  Use something more familiar, like an err object that has .id, .message, etc.
  {err, docs} = await pgdoc.retrieve(...)
</pre>

# CONSDIER List

<pre>
Add an "exclude" as well as "search"

docs/Async_Examples.md: write examples including use of tids

log a warning if parse object has a function
option to disable this warning

drop undo function entirely
require tid in undo function
integrate undo rollback with postgres features

To reduce confusion about what needs await vs not:
  Add a handler object to pgdoc and attach all the syncronous error handling related functions to it.
  Separately include this handler as an alias/varible in the examples
  Also consider making tid() async just to avoid the unnessesary error on await
    but only if this doesn't allow for a race condition

code/node/pgdoc.js: implement undo as a short-lived delay in execution that is flushed immediately if flush() is called or another db call is made.
code/node/pgdoc.js: allow disabling of undo via config option

code/node/pgdoc.js: implement alternate basic functions with catchable exceptions?

docs/CRUD_Examples.md: split this into five documents or more, with next/previous/up hyperlink buttons
docs/CRUD_Examples.md: add examples using tids

Add a JSON primer? Links?
</pre>

# REJECT List

<pre>
code/node/pgdoc.js: implement basic functions with asynchronous execution using callbacks
code/node/pgdoc.js: implement basic functions with asynchronous execution using (only) promises
print errors to console by default, option to disable
</pre>

# FUTURE List

<pre>
README.md: add a releases notes with link per language
docs/CRUD_Examples.md: Update CREATE section if it is clear that we have validated everything they might pass us.
</pre>
