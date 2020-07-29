
# pgdoc

## Quickstart on Windows 10 ( For use in existing NodeJS applications )

If you have a NodeJS project and want to get started right away keep reading. Otherwise skip ahead to the "Installation on Windows 10" section.

### The npm module

If you are simply using pgdoc for an existing NodeJS project, you should be able to access the module by installing it via npm in your local project directory.

``` bash
npm install --save pgdoc
```

### The PostgreSQL database

Now install [PostgreSQL][postgresql] on your system and get it running on the default port.

Once it is running, configure the database for use with pgdoc using psql.

``` bash
psql -f ./node_modules/pgdoc/code/sql/install_pgdoc
```

This should configure the default pgdoc user and enable you to run the examples included in this project.

If you still don't know what to do, [try out this install method][verbose].

[postgresql]: https://www.postgresql.org/
[verbose]: DevEnv_Windows_10.md
