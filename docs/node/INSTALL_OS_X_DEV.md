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

Barring any unforeseen circumstances, you should now be able to run the [CRUD Examples][crud]

### 


[homebrew]: https://brew.sh/
[postgresql]: https://www.postgresql.org/
[crud]: CRUD_Examples.md