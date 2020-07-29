TODO.md

# KEY

'TODO:' - An unfinished task, searchable tag
'CONSIDER: TODO:' - An unfinished task, searchable tag. The author is not confident that it should be done.
'TO DO:' - A task that no longer needs attention
'NOPE: message TO DO:' - A task that was not performed as stated for any reason, message optional
'DONE: message TO DO:' - A task was completed, message optional
'TODO: .... PS: ...' - "Post script" details added after to prevent breaking search.

# TODO List

<pre>

IMPORTANT
TODO: Need a wildcard for matching... so like a search for documents that have ANY value under 'id'.
TODO: in addition to wildcards for matching, math logic for things like age <, > given #
TODO: clean up and finalize the install script
TODO: Determine complexity of non-first level searches like this { o: 1, j:{ x: 1, y:2 } } @> { o: 1, j:{ x: 1 } }

CRUD:
TODO: CRUD RETRIEVE case for maxMatch (to avoid flood of data)
TODO: Adjust CRUD examples so they are not dependent on each other... each should work fine in isolation
TODO: Add a quickstart that is less thorough and more to the point then the CRUD examples. It uses final case type stuff only, rather then building up. Making use of IDs, maxMatch 0/1.

ERROR HANDLING
TODO: ERR: test err on failed store
TODO: ERR: test err on failed retrieve
TODO: ERR: test err on failed delete
TODO: ERR: test err on failed configure
TODO: ERR: test err on requestID
TODO: flesh out error code in pgdoc.js and in a file in docs/
TODO: List all errors that are returned by function in Errors.md
TODO: Make sure unknownError and unhandledError are used consistently

TESTING:
TODO: better test coverage
TODO: TEST: ensure basic functions with strings provided instead
TODO: TEST: ensure basic functions work for objects, strings
TODO: interactive terminal test thing, selection options via numbers
TODO: hook into pgdoc.js for direct run case
TODO: Option to change default config options, manually
TODO: Option to change default config options, import from file
TODO: Change examples/tests to a template application example.
TODO: write unit tests for every error case and code path in pgdoc, put them in testPgdoc.js

SQL SCRIPT
TODO: Script to generate schema specific config.js and install_*.sql
TODO: create the custom install generator script

ROBUST:
TODO: for each function, defensive programming for bad input. null data or search for instance.
TODO: type must match for ids... convert to str if not already! And make note of this in tutorials.

SECURITY:
TODO: implement protection as per [OWASP SQL Injection Prevention Cheat Sheet](https://github.com/OWASP/CheatSheetSeries/blob/master/cheatsheets/SQL_Injection_Prevention_Cheat_Sheet.md)
TODO: Use stored procs with EXECUTE...USING to prevent injection. SEE: [PostgresQL Docs](https://www.postgresql.org/docs/11/plpgsql-statements.html#PLPGSQL-STATEMENTS-EXECUTING-DYN)
TODO: ensure no security hole here in case of compromised database / database connection
TODO: SEC: THIS IS NOT SQL INJECTION SAFE
TODO: SECURITY: SANITIZATION: Ensure that anything that would break postgres fails with an error code. Validate everything that would be passed through.

DOCUMENTATION:
TODO: Add link to examples to end of install documents
TODO: Windows 10 install instructions ( npm / node / pgdoc )
TODO: OS X install instructions ( npm / node / pgdoc )
TODO: Ubuntu/Debian install instructions ( npm / node / pgdoc )
TODO: Need NodeJS beginner's primer
TODO: Markdown: Make explanatory test distinct from actual instructions via formatting in all INSTALL documents.
TODO: Document: How to set the password for pgdoc
TODO: Document: How to 'reset' the database
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
TODO: commandType stuff can be simplified, it's getting repetitive
TODO: LATER: single runCommand() in DB that operates all the functions, eliminating client side SQL and streamlining return value handling.
TODO: CONSIDER: Reduce all variants of SQL functions to one, which detects which path to take based on a code. pgdoc.runCommand()
TODO: CONSIDER: A loop/recursive search in PLpgSQL that checks each step of the object looking for a match. Where, if it branches, all branch heads need to match. If it does not branch, a match is a hit.
TODO: search ( multi level objects )
TODO: TEST: complex object subtree interactions with search

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

CHALLENGING BUT DESIRABLE
TODO: Python support
TODO: connect(): verify back-end configuration with a query / sever proc
TODO: CONSIDER: update to use non-connection string method?
TODO: when pgdoc is run directly, instead run a standalone terminal that can execute tests via interactive interface
TODO: CONSIDER: Interactive testing via different module?
TODO: CONSIDER: pass in transaction IDs to allow async polling for return values / error codes
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

TO DO: Example Game: Rouge-like Simple

</pre>

# REJECT List

<pre>
</pre>

# FUTURE List

<pre>
TODO: add a releases notes with link per language

</pre>
