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

Write your ESLint configuration. For example:

```js
module.exports = {
  extends: ["eslint:recommended", "plugin:dprint/recommended"],
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

### Available Rules

| Rule            | Description                |
| :-------------- | :------------------------- |
| [dprint/dprint] | Format code with [dprint]. |

### Available Configs

| Config                                 | Description                                                                                   |
| :------------------------------------- | :-------------------------------------------------------------------------------------------- |
| [plugin:dprint/disable-conflict-rules] | Disable rules where are conflicted with the [dprint/dprint] rule.                             |
| [plugin:dprint/recommended]            | Enable the [dprint/dprint] rule along with the [plugin:dprint/disable-conflict-rules] preset. |

- Put the [plugin:dprint/recommended] or [plugin:dprint/disable-conflict-rules] config into the last of your `extends` list in order to ensure disabling conflict rules where came from other base configurations.

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
[plugin:dprint/disable-conflict-rules]: https://github.com/mysticatea/eslint-plugin-dprint/blob/master/lib/configs/disable-conflict-rules.ts
[plugin:dprint/recommended]: https://github.com/mysticatea/eslint-plugin-dprint/blob/master/lib/configs/recommended.ts
