
# pgdoc

## NodeJS Behavior Specification

### Design Rules

RULE: With external facing core functions, non-degenerate cases should never return null.

RULE: With external facing core functions, default to returning objects, and document what to expect from them clearly.

RULE: With external facing core functions, the returned object always has a boolean .error, including lists

### Expected return value ( assuming no error )

pgdoc.connect(...) returns { error: false }

pgdoc.store(...) returns { error: false, deleted: <Integer> }

pgdoc.retrieve(...) returns [ ... , error: false ]

pgdoc.delete(...) returns { error: false, deleted: <Integer> }

pgdoc.requestID(...) returns "<Integer>"

pgdoc.configure(...) returns { error: false }
