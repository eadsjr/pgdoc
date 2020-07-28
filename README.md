![License][license-image]


# pgdoc

#### A dead-simple NoSQL document store using PostgreSQL.

This project is intended to allow you to get a simple JSON document store database up and running as quickly as possible, with minimal cognitive overhead. The system is using a robust and popular database called PostgreSQL as the database. The point is to delay having to wrangle the complexities of database management as long as possible for you own project, which for many small projects may mean never having to worry about it.

Using this you can store and search JSON documents, a generic format for data structures popular in web programming, with simple function calls (or other language specific methods). All application logic is handled server-side, in the cozy confines of your programming language of choice. If it is supported.

# To get started, [check out the documentation][start].

</break>

## Features

A library that allows document storage, retrieval and deletion with a function call.

Document selection via JSON object subset of the top level of a document. This allows selection via group tags, IDs and shared simple values, but not select elements of complex sub-object hierarchies.

Incomplete error handling system, that will reduce but not yet eliminate the need for try-catch blocks everywhere.

An install script that configures PostgreSQL for pgdoc.

A means of requesting unused sequential IDs from the database. `pgdoc.requestID(docType)`

Partial support for NodeJS


## Features (Planned)

Complete error handling system, which will capture errors so consistently that an external try-catch is largely redundant OR Pass through and wrap Error subtypes in a more standard manner.

Specific errors for all known cases.

A script to generate install scripts for custom projects.

Pass through functions for other useful postgresQL features.

Full support for NodeJS.

Support for additional programming languages (tentative)

A means of generating or requesting unused non-sequential IDs. `pgdoc.requestUUID(docType)` or similar.

Document Selection via JSON object subsets at any level of the object hierarchy.

Additional asyncronous testing and support.


## Support

Please report any bugs on our [GitHub issues page][issues]

Be sure to state your issue clearly and provide information that can help with reproducing it, such as PostgreSQL version. For details on how to do this, or if you just want to help out, [look at the contribution guidelines][contributing] for more information.


## License

The code is available at [Github][license] under the [MIT license][license].


[home]: https://github.com/eadsjr/pgdoc
[issues]: https://github.com/eadsjr/pgdoc/issues
[contributing]: docs/CONTRIBUTING.md
[license]: LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
<!-- [start]: doc/LANGUAGE.md     <- FOR WHEN MULTILANGUGE SUPPORT IS AVAILABLE -->
[start]: doc/node/Start.md
