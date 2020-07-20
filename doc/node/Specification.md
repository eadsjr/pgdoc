
# pgdoc

## NodeJS Behavior Specification

### Design Rules

RULE: With external facing core functions, non-degenerate cases should never return null.

RULE: With external facing core functions, default to returning objects, and document what to expect from them clearly.

RULE: With external facing core functions, the returned object always has a boolean .error, including lists

### Design Reasoning

See '[Development Goals in the contribution guidelines][contrib]'

In the NodeJS implementation, try-catch interactions are avoided by default in an attempt to simplify use of pgdoc for it's core purpose: rapid prototyping. Edge case proliferation is a quick route to a not-so-rapid prototype. I believe try-catch blocks tend to make code harder to read as well. [Input welcome.][trycatch]

### Expected return value ( assuming no error )

pgdoc.connect(...) returns { error: false }

pgdoc.store(...) returns { error: false, deleted: <Integer> }

pgdoc.retrieve(...) returns [ ... , error: false ]

pgdoc.delete(...) returns { error: false, deleted: <Integer> }

pgdoc.requestID(...) returns "<Integer>"

pgdoc.configure(...) returns { error: false }

[contrib]: ../CONTRIBUTING.md
[trycatch]: https://github.com/eadsjr/pgdoc/issues/2