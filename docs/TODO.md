TODO.md

# TODO List

index.js: pass in transaction IDs to allow async polling for return values / error codes
index.js: prune old stored results
index.js: prune old stored results, option: set time to keep alive
index.js: prune old stored results, option: delete on successful read
index.js: implement basic functions with asyncronous execution using async/await
index.js: ensure basic functions with strings provided instead
index.js: ensure basic functions work for objects
index.js: ensure basic functions work for strings
index.js: ensure basic functions work for classes
index.js: @todo TODO: Console.log("") the above message, instructions and then exit only when script is run directly in node.
index.js: warn people that undo() may have side effects if other servers have already relied on the data

SECURITY: Ensure that anything that would break postgres fails with an error code. Validate everything that would be passed through.

docs/CRUD_Examples.md: Rewrite all examples to be asyncrounous!
docs/CRUD_Examples.md: Update to not use deprecated connectionString
docs/CRUD_Examples.md: everything in all markdown should not require horizontal scrolling on a normal sized window
docs/CRUD_Examples.md: add hyperlink to install script reference
docs/CRUD_Examples.md: convert entire interface to return an object, and previous values stored in a standard member of that object, like .doc.
docs/CRUD_examples.md: use this file as spec for implemention (once finalized and an async method is decided)

docs/CONTRIBUTING.md: Add links to GitHub's instructions on how to submit a pull request

README.md: Add compatibility notes with various postgres versions
README.md: Add compatibility notes with other libraries and modules such as pg-connect
README.md: Add limitations section concerning sequences breaking at scale
README.md: Add limitations section concerning accessing data store in db by other means
README.md: Add limitations section concerning lossy stringification around ES 6+ classes
README.md: Add limitations section concerning lossy stringification around circle references
README.md: Add limitations section concerning thread safety of undo() in languages other then javascript
README.md: Add limitations section concerning thread safety of errorCode() in languages other then javascript
README.md: Add 'See Also' section concerning other relevant projects and modules

SEE ALSO: README.md Planned features


# DONE List

docs/CRUD_examples.md: configure connection to database
docs/CRUD_examples.md: wrote out example cases (syncronous)
index.js: determine async method


# CONSDIER List

drop undo function
require tid in undo function
integrate undo rollback with postgres features

index.js: implement undo as a short-lived delay in execution that is flushed immediately if flush() is called or another db call is made.
index.js: allow disabling of undo via config option

index.js: implement alternate basic functions with catchable exceptions?

docs/CRUD_Examples.md: split this into five documents or more, with next/previous/up hyperlink buttons

Add a JSON primer? Links?


# REJECT List

index.js: implement basic functions with asyncronous execution using callbacks
index.js: implement basic functions with asyncronous execution using (only) promises


# FUTURE List

README.md: add a releases notes with link per language
docs/CRUD_Examples.md: Update CREATE section if it is clear that we have validated everything they might pass us.
