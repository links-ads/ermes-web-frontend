# State

This directory and its subdirectory contain all the files for redux state definition

- See https://react-redux.js.org/next/api/provider
- See https://react-redux.js.org/next/api/hooks

## Add Modules

Create folder with module name (reducer name) `<module>` and add

- `<module>.state.ts`: Default redux state
- `<module>.actions.ts`: Actions (object-type)
- `<module>.reducer.ts`: Reducer for this module
- `<module>.actions-creators.ts`: Actions Creators (pure functions returning actions [optional])
- `<module>.effects.ts`: Effects ([async] functions dispatching actions [optional])
- `<module>.types.ts`: Types and Interfaces definitions
- `<module>.selectors.ts`: memoized selectors (use reselect)
- `<module>.hooks.ts`: hooks

See `auth` for an example
