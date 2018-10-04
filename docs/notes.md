# immutable-js

## 2018-09-27

Cannot upgrade to rc10 due to [breaking bug](https://github.com/facebook/immutable-js/issues/1604).
This breaks e.g. the `PROJECT_DELETE_SELECTED_ANNOTATIONS` reducer.
Wait until [PR](https://github.com/facebook/immutable-js/pull/1606) is merged.

This has the following implications:

- TypeScript ~2.9.2 cannot be used since a type error is shown for immutable-js.
- Therefore TypeScript is locked to ~2.7.2 again.
- TypeScript ~2.7.2 yields a type error for rxjs ^6.3.3.
- Therefore rxjs is locked to ~6.2.2 again.
