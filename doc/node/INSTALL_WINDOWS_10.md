
# pgdoc

## Installation on Windows 10 ( For pgdoc Users )

### The npm module

If you are simply using pgdoc for an existing NodeJS project, you should be able to access the module by installing it via npm in your local project directory.

``` bash
npm install --save pgdoc
```

### The PostgreSQL database

Now install [PostgreSQL][postgresql] on your system and get it running on the default port.

Once it is running, configure the database for use with pgdoc using psql.

``` bash
psql -f ./code/sql/install_pgdoc.sql
```

This should configure the default pgdoc user and enable you to run the examples included in this project.

If you still don't know what to do, keep reading.





[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/
[crud]: CRUD_Examples.md
