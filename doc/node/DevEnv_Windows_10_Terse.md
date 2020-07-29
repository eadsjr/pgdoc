
# pgdoc

[Click here for a more verbose version of this document.][terse]

<details>
<summary><h2> Quickstart on Windows 10 ( For use in existing NodeJS applications ) </h2></summary>

<br/>

### The npm module

If you are simply using pgdoc for an existing NodeJS project, you should be able to access the module by installing it via npm in your local project directory.

``` bash
npm install --save pgdoc
```

<br/>

### Installing PostgreSQL

Go to [the PostgreSQL homepage][postgresql] and download the most current version for your computer.

Install it after the download finishes. Don't forget to record your password.

Once the install is done, searching "sql" in Windows should show a new program "SQL shell (psql)".


<br/>

### Configuring PostgreSQL


Open the "SQL shell (psql)" application from Windows search, and log in to the shell.

From here you need to import pgdoc's SQL install file. Give it the full path to the install script. For Example:

``` sql
\i C:/Users/<USERNAME>/Projects/myProject/node_modules/pgdoc/code/sql/install_pgdoc
```

Note that the slashes required by psql are backslashes, unlike the forward slashes windows commandline normally uses.


<br/>

### Now What?

The [CRUD Examples][crud] should now work. Open up a "Node.js" application window and get try them out.

<br/>


</details>
<details>

<summary><h2> Setting up a pgdoc Dev Environment on Windows 10 ( For learning to modify pgdoc ) </h2></summary>


<br/>

### Installing PostgreSQL

Go to [the PostgreSQL homepage][postgresql] and download the most current version for your computer.

Install it after the download finishes. Don't forget to record your password.

Once the install is done, searching "sql" in Windows should show a new program "SQL shell (psql)".


<br/>

### Installing NodeJS

Go to [the NodeJS homepage][node] and download the LTS version of NodeJS. Install it after the download finishes.

Once the install has completed, when you search the windows bar for "node" you should now see a "Node.js" app and a "Node.js command prompt" app.

<br/>

### Installing the git version control system

Download [the git version control system][https://git-scm.com/download/win] and install it. If you aren't sure about the install options the defaults should be fine for our purposes here.

Once the install has completed successfully, when you search Windows for "git" you should see a new program "Git CMD".

<br/>

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

<br/>

### Download dependencies

Open the "Node.js command prompt" program.

Navigate to the folder containing the pgdoc Project.

``` bat
cd Projects\pgdoc
```

Now download the dependencies for the project using the NodeJS Package Manager (npm).

``` bat
npm install
```

<br/>

### Configuring PostgreSQL


Open the "SQL shell (psql)" application from Windows search, and go through the process of logging in to the shell.

Unless you are using a remote database or custom port, the default options (localhost/postgres/5432/postgres) for items up until the password are acceptable. Give it the password you chose for your PostgreSQL database.

Once you are logged in you should see a prompt that looks something like this:

``` sql
postgres=# _
```

From here you need to import pgdoc's SQL install file. Type the following into the prompt, replacing <USERNAME> with your own Window's username. This is the exact same name as your home folder.

``` sql
\i C:/Users/<USERNAME>/Projects/pgdoc/code/sql/install_pgdoc
```

Note that the slashes required by psql are backslashes, unlike the forward slashes windows commandline normally uses.

<br/>

### Now What?

The [CRUD Examples][crud] should now work. Open up a "Node.js" application window and get try them out.

<br/>

</details>


[pgdoc]: https://github.com/eadsjr/pgdoc
[git]: https://git-scm.com/download/win
[node]: https://nodejs.org/en/
[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/
[crud]: CRUD_Examples_Terse.md
[verbose]: DevEnv_Windows_10.md
