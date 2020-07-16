OPTIONS.md


# pgdoc

## Options that can passed into the interface

``` js
options.noclobber = true
```

When calling store, if 'noclobber' is true then it refuses to overwrite existing records with new data.

``` js
options.onlyone = true
```

When calling retrieve, if 'onlyone' is true then it multiple record matches counts as an error.

