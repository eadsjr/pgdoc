![License][license-image]


# pgdoc

#### A dead-simple NoSQL document store using PostgreSQL.

This project is intended to allow you to get a simple JSON document store database up and running as quickly as possible, with minimal cognitive overhead. The system is using a robust and popular database called PostgreSQL as the database. The point is to delay having to wrangle the complexities of database management as long as possible for you own project, which for many small projects may mean never having to worry about it.

Using this you can store and search JSON documents, a generic format for data structures popular in web programming, with simple function calls (or other language specific methods). All application logic is handled server-side, in the cozy confines of your programming language of choice. If it is supported.


## Features

A library that allows document storage, retrieval and deletion with a function call.

Document selection via json object subsets. This can be on any part of the data, including an id.

Incomplete error handling system, that will reduce but not eliminate the need for try-catch blocks everywhere.

An install script that creates the schema for the library for you.

A means of requesting unused sequential IDs from the database. `pgdoc.requestID(docType)`

Partial support for NodeJS


## Features (Planned)

Complete error handling system, which will capture errors so consistently that an external try-catch is largely redundant OR Pass through and wrap Error subtypes in standard manner.

Specific errors for all known cases.

An script to generate install scripts for custom projects.

Pass through functions for other useful postgresQL features.

Full support for NodeJS.

Support for additional programming languages (tentative)

A means of requesting unused non-sequential IDs from the database. `pgdoc.requestUUID(docType)`


## Support

Please report any bugs on our [GitHub issues page][issues]

Be sure to state your issue clearly and provide information that can help with reproducing it, such as PostgreSQL version. For details on how to do this, or if you just want to help out, [look at the contribution guidelines][contributing] for more information.


## License

The code is available at [Github][license] under the [MIT license][license].


[home]: https://github.com/eadsjr/pgdoc
[issues]: https://github.com/eadsjr/pgdoc/issues
[contributing]: https://github.com/eadsjr/pgdoc/blob/master/docs/CONTRIBUTING.md
[license]: https://github.com/eadsjr/pgdoc/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
