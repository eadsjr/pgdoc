TODO.md

# KEY

'TODO:' - An unfinished task, searchable tag
'TO DO:' - A task that no longer needs attention
'NOPE: TO DO:' - A task that was not performed as stated for any reason
'TODO: .... PS: ...' - "Post script" details added after to prevent breaking search.

# TODO List

<pre>

IMPORTANT
TO DO: Add an "exclude" as well as "search"
TODO: Need a wildcard for matching... so like a search for documents that have ANY value under 'id'.
TODO: Write a spec document
TODO: Link specification once fleshed out PS: doc/node/Start.md
.
TODO: clean up and finalize the install script
TODO: Store(): more specific success validation
TODO: document sequence integer limits of postgres here PS: store()
TODO: Determine the state of non-first level searches like this { o: 1, j:{ x: 1 } }... does { o: 1, j:{ x: 1, y:2 } } match?

CRUD:
TODO: Update the CRUD Examples to use the new version of the library
TODO: Update CRUD examples to allow for terminal only test. async commands might confuse people.
TODO: Seprate CRUD examples versions for node REPL and async use in program.
TODO: Rewrite CRUD Examples if( rv != 0 ) to instead explicitly check rv.error in a safe way.
TODO: REPL example can't handle if/else multiline
TODO: Make note of record duplication in CRUD Examples
TODO: clean up terse CRUD Examples
TODO: Make note of record duplication during unlimited store() in CRUD Examples
TODO: Finish writing CRUD examples
TO DO: redo the CRUD store() example data so that if each is run in order, the database examples work out nicely. Multiple players on the team, etc.

ERROR HANDLING
TODO: Sort and clean up error codes.
TODO: ERR: test err on noclobber clobber
TODO: ERR: test err on onlyone multi return
TODO: ERR: test err on failed create
TODO: ERR: test err on failed update
TODO: ERR: test err on failed retrieve
TODO: ERR: test err on failed delete
TODO: ERR: test err on failed configure
TODO: ERR: test err on nothing changed
TODO: ERR: test err on requestID
TODO: flesh out error code in pgdoc.js and in a file in docs/
TODO: test NothingChanged
TODO: test StoreFailed
TODO: DeleteFailed error case
TODO: Clobber error case
TODO: List all errors that are returned by function in Errors.md

TESTING:
TODO: Clean up tests
TODO: migrate tests to code/
TODO: better test coverage
TODO: test for delete() all of type case
TODO: unit tests?
TODO: TEST: ensure basic functions with strings provided instead
TODO: TEST: ensure basic functions work for objects, strings
.
TODO: interactive terminal test thing, selection options via numbers
TODO: hook into pgdoc.js for direct run case
TODO: Option to change default config options, manually
TODO: Option to change default config options, import from file
TODO: Change examples/tests to a template application example.
TODO: write unit tests for every error case and code path in pgdoc, put them in testPgdoc.js

STUFF:
TODO: quiet option - supress all pgdoc output to console (this should only happen in strange edge cases that you might want an error message for)
TODO: better error message for bad search JSON object, missing quotes on field name
TODO: INSTALL doc: Add 'node ./examples/' after the "Download dependencies"
TODO: VERIFY: else if(res.rowCount > 0) No search performed, so returned rowCount indicates operations performed. : store()
TODO: VERIFY: /// Nothing was stored : store()
TODO: Make sure unknownError and unhandledError are used consistently


SQL SCRIPT
TODO: Script to generate schema specific config.js and install_*.sql
TODO: create the custom install generator script

ROBUST:
TODO: for each function, defensive programming for bad input. null data or search for instance.
TODO: type must match for ids... convert to str if not already! And make note of this in tutorials.

GRIDDUNGEON EXAMPLE:
TODO: Example Game: Rouge-like Simple
TODO: make use of the incrementor for ids in griddungeon.

SECURITY:
TODO: implement protection as per [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.md)
TODO: Use stored procs with EXECUTE...USING to prevent injection. SEE: [PostgresQL Docs](https://www.postgresql.org/docs/11/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN)
TODO: ensure no security hole here in case of compromised database / database connection
TODO: SEC: THIS IS NOT SQL INJECTION SAFE
TODO: SECURITY: SANITIZATION: Ensure that anything that would break postgres fails with an error code. Validate everything that would be passed through.
TODO: implement protection as per [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.md)
TODO: Use stored procs with EXECUTE...USING to prevent injection. SEE: [PostgresQL Docs](https://www.postgresql.org/docs/11/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN)

DOCUMENTATION:
TODO: Windows 10 install instructions ( npm / node / pgdoc )
TODO: OS X install instructions ( npm / node / pgdoc )
TODO: Ubuntu/Debian install instructions ( npm / node / pgdoc )
TODO: Need NodeJS beginner's primer
TODO: Markdown: Make explanatory test distinct from actual instructions via formatting in all INSTALL documents.
TODO: Document: How to set the password for pgdoc
TODO: everything in all markdown should not require horizontal scrolling on a normal sized window
TODO: Note possibility of errors being throw due to running out of memory, call stack depth, etc.
TODO: Add limitations section concerning sequences breaking at scale
TODO: Add limitations section concerning accessing data store in db by other means
TODO: Add limitations section concerning lossy stringification around ES 6+ classes
TODO: Add limitations section concerning lossy stringification around circle references
TODO: Add a JSON primer? Links?
TODO: explain reasoning about dev branch separation and deliberate storage in regards to github and small downloads and easily understood commits in CONTRIBUTING.md


IMPORTANT LATER:
TODO: releases for stable versions of pgdoc
TODO: Later: update the windows install to use a release and verify it isn't prevented from loading via Chrome or Windows security

FINALIZING:
TODO: github - hide old projects and dead forks
TODO: npm repo publication
TODO: update personal site with a link to pgdoc
TODO: YouTube tutorial on getting up and running with pgdoc
TODO: Get pgdoc on the npm repo ASAP
WORK: TODO: Fix up pg-doc for use as code sample.

SEE ALSO: README.md Planned features
</pre>

# CONSDIER List

<pre>

HARD BUT GOOD
TODO: Python support
TODO: connect(): verify back-end configuration with a query / sever proc
TODO: CONSIDER: update to use non-connection string method?
TODO: when pgdoc is run directly, instead run a standalone terminal that can execute tests via interactive interface
TODO: CONSIDER: Interactive testing via different module?
TODO: pass in transaction IDs to allow async polling for return values / error codes
TODO: implement alternate basic functions with catchable exceptions?

HARD BUT MAYBE
TODO: MAJOR: option to throw errors instead of returning them.

STUFF MAYBE
TODO: Example Game: Tic-Tac-Toe
TODO: Update to current postgresql
TODO: add config option to print errors to provided stream ( such as console.err )
TODO: Memoization with timeout, prune old stored results, option: set time to keep alive, option: delete on successful read
TODO: print errors to console given the verbose option
TODO: Add compatibility notes with various postgres versions
TODO: Add compatibility notes with other libraries and modules such as pg-connect
TODO: Add 'See Also' section concerning other relevant projects and modules

</pre>


# DONE List

<pre>
DOCUMENTATION QUICK STUFF
TO DO: in CONTRIBUTING.md, specify use of a dev branch in more detail
TO DO: Mention postgresql more clearly in README
TO DO: ...THIS IS NOT TRUE FOR VALUES RETURNED: "If you are using a node REPL session you can drop the await keyword from the following examples."
TO DO: Make documentation link more prominent
TO DO: make sure not to mislead advanced users... they need to run the psql script! PS: in Start.md
TO DO: Verify and rewrite near this: Your username may default to your windows username.
TO DO: Verify and flesh out: Once you are logged in you should see a prompt that looks something like this:
TO DO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
TO DO: docs/CONTRIBUTING.md: Add links to GitHub's instructions on how to submit a pull request

IMPORTANT
TO DO: Add type check prior to stringifying strings?
TO DO: function specific Options implementation
TO DO: update function header comments
NOPE: TO DO: Store should have consistent behavior. Always return list or error.
TO DO: Store should have consistent behavior. Always return an object or error.
TO DO: Retrieve should have consistent behavior. Always return a list or error.
TO DO: Delete() updated to return object
TO DO: convert entire interface to return an object, and previous values stored in a standard member of that object, like .doc. PS: Not including requestID()
TO DO: Make sure { error: false } gets passed whenever needed.
TO DO: Make sure rv.error = false is set whenever needed.
TO DO: MaxExceeded Error

OPTIONS:
TO DO: need to respect options!
TO DO: function specific Options implementation

</pre>

# REJECT List

<pre>
IMPORTANT
NOPE: TO DO: CONSIDER: convert to more extensible object destructuring method of invocation? No... that makes it more complex to use...

DOCUMENTATION QUICK STUFF
NOPE: TO DO: Make more instances of the documentation link
</pre>

# FUTURE List

<pre>
TODO: add a releases notes with link per language

</pre>
