TODO.md

# TODO List

<pre>

TODO: implement protection as per [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.md)

TODO: Use stored procs with EXECUTE...USING to prevent injection. SEE: [PostgresQL Docs](https://www.postgresql.org/docs/11/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN)


DOCUMENTATION QUICK STUFF
TO DO: PGDOC: in CONTRIBUTING.md, specify use of a dev branch in more detail
TO DO: Mention postgresql more clearly in README
TO DO: PGDOC: ...THIS IS NOT TRUE FOR VALUES RETURNED: "If you are using a node REPL session you can drop the await keyword from the following examples."
TO DO: PGDOC: Make documentation link more prominent
TODO: PGDOC: Make more instances of the documentation link
TODO: make sure not to mislead advanced users... they need to run the psql script!
TODO: Verify and rewrite near this: Your username may default to your windows username.
TODO: Verify and flesh out: Once you are logged in you should see a prompt that looks something like this:
TODO: INSTALL doc: Add 'node ./examples/' after the "Download dependencies"
TODO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
TODO: docs/CONTRIBUTING.md: Add links to GitHub's instructions on how to submit a pull request

IMPORTANT
TODO: Write a spec document
.
TODO: PGDOC: Add type check prior to stringifying strings?
TODO: PGDOC: function specific Options implementation
TODO: PGDOC: update function header comments
TODO: PGDOC: clean up and finalize the install script
TODO: Store should have consistent behavior. Always return list or error.
TODO: PGDOC: Store(): more specific success validation

OPTIONS:
TODO: PGDOC: need to respect options!
TODO: PGDOC: function specific Options implementation


CRUD:
TODO: PGDOC: Update the CRUD Examples to use the new version of the library
TODO: Update CRUD examples to allow for terminal only test. async commands might confuse people.
TODO: PGDOC: Seprate CRUD examples versions for node REPL and async use in program.
TODO: Rewrite CRUD Examples if( rv != 0 ) to instead explicitly check rv.error in a safe way.
TODO: PGDOC: REPL example can't handle if/else multiline
TODO: Make note of record duplication in CRUD Examples
TODO: clean up terse CRUD Examples
TODO: Make note of record duplication during unlimited store() in CRUD Examples

ERROR HANDLING
TODO: Sort and clean up error codes.
TODO: PGDOC: ERR: test err on noclobber clobber
TODO: PGDOC: ERR: test err on onlyone multi return
TODO: PGDOC: ERR: test err on failed create
TODO: PGDOC: ERR: test err on failed update
TODO: PGDOC: ERR: test err on failed retrieve
TODO: PGDOC: ERR: test err on failed delete
TODO: PGDOC: ERR: test err on failed configure
TODO: PGDOC: ERR: test err on nothing changed
TODO: PGDOC: ERR: test err on requestID
TODO: PGDOC: flesh out error code in pgdoc.js and in a file in docs/
TODO: PGDOC: test NothingChanged
TODO: PGDOC: test StoreFailed
TODO: PGDOC: DeleteFailed error case
TODO: PGDOC: Clobber error case

TESTING:
TODO: PGDOC: better test coverage
TODO: PGDOC: test for delete() all of type case
TODO: PGDOC: unit tests?
TODO: TEST: ensure basic functions with strings provided instead
TODO: TEST: ensure basic functions work for objects, strings

STUFF:
TODO: PGDOC: quiet option - supress all pgdoc output to console (this should only happen in strange edge cases that you might want an error message for)
TODO: better error message for bad search JSON object, missing quotes on field name

SQL SCRIPT
TODO: PGDOC: Script to generate schema specific config.js and install_*.sql
TODO: PGDOC: create the custom install generator script

ROBUST:
TODO: PGDOC: for each function, defensive programming for bad input. null data or search for instance.
TODO: PGDOC: type must match for ids... convert to str if not already! And make note of this in tutorials.

GRIDDUNGEON EXAMPLE:
TODO: PGDOC: Example Game: Rouge-like Simple
TODO: make use of the incrementor for ids in griddungeon.

SECURITY:
TODO: PGDOC: ensure no security hole here in case of compromised database / database connection
TODO: PGDOC: SEC: THIS IS NOT SQL INJECTION SAFE
TODO: SECURITY: SANITIZATION: Ensure that anything that would break postgres fails with an error code. Validate everything that would be passed through.
TODO: implement protection as per [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.md)
TODO: Use stored procs with EXECUTE...USING to prevent injection. SEE: [PostgresQL Docs](https://www.postgresql.org/docs/11/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN)


DOCUMENTATION:
TODO: Windows 10 install instructions ( npm / node / pgdoc )
TODO: OS X install instructions ( npm / node / pgdoc )
TODO: Ubuntu/Debian install instructions ( npm / node / pgdoc )
TODO: PGDOC: Need NodeJS beginner's primer
TODO: PGDOC: Markdown: Make explanatory test distinct from actual instructions via formatting in all INSTALL documents.
TODO: Document: How to set the password for pgdoc
TODO: everything in all markdown should not require horizontal scrolling on a normal sized window
TODO: Note possibility of errors being throw due to running out of memory, call stack depth, etc.
TODO: Add limitations section concerning sequences breaking at scale
TODO: Add limitations section concerning accessing data store in db by other means
TODO: Add limitations section concerning lossy stringification around ES 6+ classes
TODO: Add limitations section concerning lossy stringification around circle references
TODO: Add a JSON primer? Links?

IMPORTANT LATER:
TODO: releases for stable versions of pgdoc
TODO: Later: update the windows install to use a release and verify it isn't prevented from loading via Chrome or Windows security

FINALIZING:
TODO: github - hide old projects and dead forks
TODO: PGDOC: npm repo publication
TODO: update personal site with a link to pgdoc
TODO: YouTube tutorial on getting up and running with pgdoc
TODO: Get pgdoc on the npm repo ASAP
WORK: TODO: Fix up pg-doc for use as code sample.

SEE ALSO: README.md Planned features
</pre>

# DONE List

<pre>
</pre>

# CONSDIER List

<pre>
TODO: convert entire interface to return an object, and previous values stored in a standard member of that object, like .doc.

HARD BUT GOOD
TODO: PGDOC: Python support
TODO: PGDOC: connect(): verify back-end configuration with a query / sever proc
TODO: PGDOC: CONSIDER: update to use non-connection string method?
TODO: when pgdoc is run directly, instead run a standalone terminal that can execute tests via interactive interface
TODO: pass in transaction IDs to allow async polling for return values / error codes
TODO: Add an "exclude" as well as "search"
TODO: implement alternate basic functions with catchable exceptions?

STUFF MAYBE
TODO: PGDOC: Example Game: Tic-Tac-Toe
TODO: Update to current postgresql
TODO: PGDOC: add config option to print errors to provided stream ( such as console.err )
TODO: Memoization with timeout, prune old stored results, option: set time to keep alive, option: delete on successful read
TODO: print errors to console given the verbose option
TODO: Add compatibility notes with various postgres versions
TODO: Add compatibility notes with other libraries and modules such as pg-connect
TODO: Add 'See Also' section concerning other relevant projects and modules

</pre>

# REJECT List

<pre>
</pre>

# FUTURE List

<pre>
TODO: add a releases notes with link per language

</pre>
