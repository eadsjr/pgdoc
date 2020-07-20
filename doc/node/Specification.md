
# pgdoc

## NodeJS Behavior Specification

### Design Rules

RULE: Non-degenerate cases should never return null in this library.

RULE: Default to returning objects, and document what to expect from them clearly.

RULE: The returned object always has a boolean .error, including lists

### Expected return value ( assuming no error )

pgdoc.connect(...) returns { error: false }

pgdoc.store(...) returns { error: false, deleted: <Integer> }

pgdoc.retrieve(...) returns [ ... , error: false ]

pgdoc.delete(...) returns { error: false, deleted: <Integer> }

pgdoc.requestID(...) returns "<Integer>"

pgdoc.configure(...) returns { error: false }
