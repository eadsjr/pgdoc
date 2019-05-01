![License][license-image]


# pg-doc

```diff
----- This is a work-in-progress. It is not currently ready for use. -----
```
#### A dead-simple NoSQL document store using PostgreSQL.

This project is intended to allow you to get a simple JSON document store database up and running as quickly as possible, with minimal cognitive overhead. The system is using a robust and popular database as the backend. The point is to delay having to wrangle the complexities of database management as long as possible for you own project, which for many small projects may mean never having to worry about it.

Using this you can store and search JSON documents, a generic format for data structures popular in web programming, with simple function calls (or other language specific methods). All application logic is handled server-side, in the cozy confines of your programming language of choice. If it is supported.


## Features

None


## Features (Planned)

A library that allows document storage, retrival and deletion with a function call.

An install script that creates the schema for the library for you.

Scripts to modify / update database roles / credentials.

Documents are sent and recieved as strings.

Additional functions that provide transparent object store/retrieval. (tentative)

A safe JSON parser and stringify mechanism.

Document selection via json objects.

Pass through functions for sequences. For example: `getID(type)`

Pass through functions for other useful postgresQL features.

Support for NodeJS

Support for other langauges (tentative)


## Support

Please report any bugs on our [GitHub issues page][issues]

Be sure to state your issue clearly and provide information that can help with reproducing it, such as PostgreSQL version. For details on how to do this, or if you just want to help out, [look at the contibution guidelines][contributing] for more information.


## License

The code is available at [Github][license] under the [MIT license][license].


[home]: https://github.com/eadsjr/pg-doc
[issues]: https://github.com/eadsjr/pg-doc/issues
[contributing]: https://github.com/eadsjr/pg-doc/blob/master/docs/CONTRIBUTING.md
[license]: https://github.com/eadsjr/pg-doc/blob/master/LICENSE
[license-image]: https://img.shields.io/badge/license-MIT-blue.svg
