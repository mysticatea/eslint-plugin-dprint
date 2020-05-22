# eslint-plugin-dprint

The plugin that runs [dprint] to format code in ESLint.

## 💿 Installation

Use [npm] or a compatible tool.

```
$ npm install -D eslint eslint-plugin-dprint
```

If you want to use [dprint] of own version, install `@dprint/core` and `dprint-plugin-typescript` as well. This is optional.

```
$ npm install -D @dprint/core dprint-plugin-typescript
```

## 📖 Usage

Write your ESLint configuration:

```js
module.exports = {
  plugins: ["dprint"],
  rules: {
    "dprint/dprint": [
      "error",
      {
        config: {
          // The TypeScript configuration of dprint
          // See also https://github.com/dprint/dprint/blob/457cbb5a2a8ded959e8185bf8528ba2b7241b7dd/packages/dprint-plugin-typescript/lib/dprint-plugin-typescript.d.ts
        },
      },
    ],
  },
};
```

Then run ESLint!

### Rules

| Rule            | Description               |
| :-------------- | :------------------------ |
| [dprint/dprint] | Check code with [dprint]. |

### Configs

TBD.

## 📰 Changelog

See [GitHub Releases](https://github.com/mysticatea/eslint-plugin-dprint/releases).

## ❤️ Contributing

Welcome contributing!

Please use GitHub's Issues/PRs.

### Development Tools

- `npm test` ... Run tests. It generates code coverage into `coverage` directory.
- `npm run watch` ... Run tests when files are edited.
- `npm version <patch|minor|major>` ... Bump a new version.

[dprint]: https://github.com/dprint/dprint
[npm]: https://www.npmjs.com/
[dprint/dprint]: docs/rules/dprint.md
