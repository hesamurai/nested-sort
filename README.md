# Nested Sort

Nested Sort is a vanilla JavaScript library, without any dependencies, which helps you to sort a nested list of items via drag and drop. Unfortunately, it does not support touch screens yet.

## Download

 * [CDN copies](https://www.jsdelivr.com/package/npm/nested-sort) [![](https://data.jsdelivr.com/v1/package/npm/nested-sort/badge)](https://www.jsdelivr.com/package/npm/nested-sort)


## Installation

Using npm:
```shell
$ npm i nested-sort
```

## Developer environment requirements

To run this project, you will need:

- Node.js >= v10.5.0, use nvm - [install instructions](https://github.com/creationix/nvm#install-script)
- Yarn >= v1.7.0 - [install instructions ("Alternatives" tab)](https://yarnpkg.com/en/docs/install#alternatives-rc)

## Running tests

```sh
yarn
yarn test
yarn test --watch
yarn test:coverage
```

## Dev mode

When developing you can run:

```
yarn watch
```

This will regenerate the build files each time a source file is changed and serve on http://127.0.0.1:5000.

### Previewing umd build in the browser

If your package works in the browser, you can open `dev/index.html` to try it out.

## Demo

There are some samples in the `dev` folder. In order to see them in action, first run `yarn watch` and then navigate to: `http://127.0.0.1:5000/dev/`
