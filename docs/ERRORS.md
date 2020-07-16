ERRORS.md

All of the exposed functions of pgdoc can return an error object. If the error object is null, then the action completed successfully. Otherwise, it fits the following pattern:

``` js
err.error         // This is true for all error objects. Allows a quick check for functions that don't return separate objects.
err.code          // An error code that should be unique for this kind of pgdoc error.
err.label         // A brief label that indicates the kind of error.
err.description   // A detailed description of the error.
err.args          // The parameters passed into the function call that failed.
err.wrapped       // This is null, or contains a wrapped error object from another source.

err = {
  error: true,
  code: -8,
  label: `NoClobber`,
  description: `The store operation was rejected because it would overwrite existing data`,
  args: { type, data, tid, options }
}
```

The types of errors can be seen in the object pgdoc.errors or in code/node/pgdoc.js