ERRORS.md

All of the exposed functions of pg-doc can return an error object. If the error object is null, then the action completed successfully. Otherwise, it fits the following pattern:

``` js
err.code          // An error code that should be unique for this kind of pg-doc error.
err.label         // A brief label that indicates the kind of error.
err.description   // A detailed description of the error.
err.args        // The parameters passed into the function call that failed.

err = {
  code: -8,
  label: `NoClobber`,
  description: `The store operation was rejected because it would overwrite existing data`,
  args: { type, data, tid, options }
}
```

The types of errors can be seen in the object pgdoc.errors or in code/node/pgdoc.js