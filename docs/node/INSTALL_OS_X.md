INSTALL_OS_X.md

# pgdoc

## Installation on Mac OS X ( For pgdoc Users )

### The npm module

If you are simply using pgdoc for an existing NodeJS project, you should be able to access the module by installing it via npm in your local project directory.

``` bash
npm install --save pgdoc
```

If you are still not sure what to do, check below.


### The PostgreSQL database

Now install [PostgreSQL][postgresql] on your system and get it running on the default port.

Once it is running, configure the database for use with pgdoc using psql.

``` bash
psql -f ./code/sql/install_pgdoc.sql
```


## Installation on Mac OS X ( For pgdoc Developers )

### Homebrew, git, node and npm

For this you need to have git, node and npm installed.

If you have [homebrew][homebrew], this is very easy.

``` bash
brew update
brew install node
brew install git
```

This should give you both the node terminal application and the npm package manager, as well as the git source control application.


### Downloading the pgdoc project

Open the terminal and navigate to the directory you will download the project into.

``` bash
mkdir -p ~/github/eadsjr/
cd ~/github/eadsjr/
git clone https://github.com/eadsjr/pgdoc.git
```

### Installing NodeJS dependencies

Now, in the project directory where the package.json is, run this command to install the dependencies.

```bash
npm install
```

That should be

### 


[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/
