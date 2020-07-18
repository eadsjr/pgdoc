
# pgdoc

[Click here for a less verbose version of this document.][terse]

## Quickstart on Windows 10 ( For use in existing NodeJS applications )

If you have a NodeJS project and want to get started right away keep reading. Otherwise skip ahead to the "Installation on Windows 10" section.

### The npm module

If you are simply using pgdoc for an existing NodeJS project, you should be able to access the module by installing it via npm in your local project directory.

``` bash
npm install --save pgdoc
```

### The PostgreSQL database

> [The PostgreSQL database][postgresql] stores persistent data for your application, like user accounts, purchases and other application state. 

Go to [the PostgreSQL homepage][postgresql] and click the download button. Once the next page loads, there will be a red "Download the installer" link at the top of the page.

Clicking that red link takes you to a page with a grid of downloads. If your computer is 64 bit (modern ones will be), download the "Windows x86-64" installer for the most current version of PostgreSQL (version 12.3 as of this writing).

Install it after the download finishes. During the install you will be asked to set a password. Chose something you will remember and write the credentials down somewhere safe, or you will lose access to the database.

When asked use the default port for your install (5432) or you will need to update all examples and configs you use to your custom port number. If your database is on a public server instead of a personal machine you will want to use a custom port number for security reasons.

The installer may try to install additional software after the PostgreSQL install completes. You only need PostgreSQL itself to make use this library.

Once the install has completed successfully, when you search Windows for "sql" you should see a new program "SQL shell (psql)".

> This program psql is an interactive shell that allows you to directly control the database. Using pgdoc allows your Javascript code to interact with the database in a very similar way.


### Configuring PostgreSQL

> Both pgdoc and PostgreSQL should be working on your computer now. For pgdoc to interact with the database, you must be configure it to allow your program to log in and accept the commands that make it work.

Open the "SQL shell (psql)" application from Windows search, and go through the process of logging in to the shell.

Unless you are using a remote database or custom port, the default options (localhost/postgres/5432/postgres) for items up until the password are acceptable. Give it the password you chose for your PostgreSQL database.

Once you are logged in you should see a prompt that looks something like this:

``` sql
postgres=# _
```

From here you need to import pgdoc's SQL install file.

Note that the slashes required by psql are backslashes, unlike the forward slashes windows command prompt normally uses.

Type the path to the installer into the prompt, replacing everything before "node_modules" in the path to your NodeJS application's path.

``` sql
\i C:/Users/<USERNAME>/Projects/myProject/node_modules/pgdoc/code/sql/install_pgdoc.sql
```

This should result in a series of all caps statements about what the install is doing. As long as there are are no errors, your database configuration is is complete.


### Now What?

The [CRUD Examples][crud] should now work. Open up a "Node.js" application window and get try them out.


## Setting up a pgdoc Dev Environment on Windows 10 ( For learning to modify pgdoc )


### Installing NodeJS

> NodeJS is a Javascript runtime. It is an application that runs programs made in the Javascript programming language. You can make applications in NodeJS that make use of the pgdoc library to store information in a database.

Go to [the NodeJS homepage][node] and download the LTS version of NodeJS. Install it after the download finishes.

Once the install has completed, when you search the windows bar for "node" you should now see a "Node.js" app and a "Node.js command prompt" app.

> The "Node.js" app runs an instance of the NodeJS REPL ( Read-Evaluate-Print Loop ) that provides an interactive session. You can type or paste code into this window to run commands in the language one at a time. This is useful for testing out code and experimenting with Javascript.

> The "Node.js command prompt" is a specially configured version of the Windows command prompt customized for use with NodeJS. You can use this to download Javascript library modules from the npm repository. It can also be used run scripts on NodeJS. To create a script, you save your Javascript code in a file with the .js extension.


### Installing PostgreSQL

Perform the steps outlined above in "The PostgreSQL database" to install PostgreSQL.



### Installing the git version control system

> You need to get pgdoc itself downloaded on to your computer. Your browser on windows may prevent you from downloading the zip file directly. Using git will allow you to get the pgdoc project onto your computer using the same source control system that developers use to build their projects.

Download [the git version control system][https://git-scm.com/download/win] and install it. If you aren't sure about the install options the defaults should be fine for our purposes here.

Once the install has completed successfully, when you search Windows for "git" you should see a new program "Git CMD".


### Downloading pgdoc

Run the "Git CMD" application.

Now we need to get to the directory where your pgdoc will live on your computer. Create a "Projects" folder in your home directory "C:\Users\<UserName>\", then change to that directory.

``` bat
mkdir Projects
cd Projects
```

Now you need to download pgdoc to your computer.

``` bat
git clone https://github.com/eadsjr/pgdoc
```

Now pgdoc should be situated at this path "C:\Users\<UserName>\Projects\pgdoc"

You can close the "Git CMD" window once this step is finished.


### Download dependencies

> Now you need to get the programs that pgdoc relies on downloaded to your computer. There aren't many of them, but they are necessary.

Open the "Node.js command prompt" program.

Navigate to the folder containing the pgdoc Project.

``` bat
cd Projects\pgdoc
```

Now download the dependencies for the project using the NodeJS Package Manager (npm).

``` bat
npm install
```

This window will be useful for running the examples, so leave it open for now.


### Configuring PostgreSQL

> Both pgdoc and PostgreSQL should be working on your computer now. For pgdoc to interact with the database, you must be configure it to allow your program to log in and accept the commands that make it work.

Open the "SQL shell (psql)" application from Windows search, and go through the process of logging in to the shell.

Unless you are using a remote database or custom port, the default options (localhost/postgres/5432/postgres) for items up until the password are acceptable. Give it the password you chose for your PostgreSQL database.

Once you are logged in you should see a prompt that looks something like this:

``` sql
postgres=# _
```

From here you need to import pgdoc's SQL install file. Type the following into the prompt, replacing <USERNAME> with your own Window's username. This is the exact same name as your home folder.

``` sql
\i C:/Users/<USERNAME>/Projects/pgdoc/code/sql/install_pgdoc.sql
```

Note that the slashes required by psql are backslashes, unlike the forward slashes windows commandline normally uses.

This should result in a series of all caps statements about what the install is doing. As long as there are are no errors, your database configuration is is complete.


### Now What?

The [CRUD Examples][crud] should now work. Open up a "Node.js" application window and get try them out.


[pgdoc]: https://github.com/eadsjr/pgdoc
[git]: https://git-scm.com/download/win
[node]: https://nodejs.org/en/
[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/
[crud]: CRUD_Examples.md
[terse]: DevEnv_Windows_10_Terse.md
