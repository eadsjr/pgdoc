# pgdoc

## Installation on Mac OS X ( For pgdoc Users )

### The npm module

If you are simply using pgdoc for an existing NodeJS project, you should be able to access the module by installing it via npm in your local project directory.

``` bash
npm install --save pgdoc
```

### The PostgreSQL database

Now install [PostgreSQL][postgresql] on your system and get it running on the default port.

Once it is running, configure the database for use with pgdoc using psql.

``` bash
psql -f ./code/sql/install_pgdoc
```

This should configure the default pgdoc user and enable you to run the examples included in this project.

If you still don't know what to do, keep reading.


## Installation on Mac OS X ( For pgdoc Developers )

### Homebrew, git, node and npm

For this you need to have git, node and npm installed.

First open the Terminal (CMD+Space, type terminal) and check if you have [homebrew][homebrew] installed with this command `which brew`. If it prints out a path then it should be installed and ready to go. Other wise [install it now.][homebrew]

You need to make sure it is up to date, then run the following commands to update brew and download some other programs.

``` bash
brew update
brew install node
brew install git
```

This should give you both the node terminal application and the npm package manager, as well as the git source control application.


### Downloading the pgdoc project

Now you need to get the pgdoc project downloaded on to your system.

Open the terminal and navigate to the directory you will download the project into.

``` bash
mkdir -p ~/github/eadsjr/
cd ~/github/eadsjr/
git clone https://github.com/eadsjr/pgdoc.git
```

### Installing NodeJS dependencies

Now, in the project directory where the package.json is, run this command to install the dependencies.

```bash
cd pgdoc
npm install
```

Barring any unforeseen circumstances, you should now be able to run the [CRUD Examples][crud]


[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/
[crud]: CRUD_Examples.md
