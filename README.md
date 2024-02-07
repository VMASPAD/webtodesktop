# webtodesktop

Convert your favorite pages into portable windows executables! With node

## API Reference

#### How to use

In your paths always use double ("\\") since JS omits it, only in the folder path in the url's not

te paht: <YOUR-DIR>/source/dist/win-unpacked

```JS

const { webtodesktop } = require("webtodesktop");

webtodesktop("https://www.npmjs.com/", "<ANYDIR>", "<IS-DEV>")

```

# Windows

| Parameter | Type | Description |
| :-------- | :------- | :------ |
| `useUrl` | `string` | Your favorite url |
| `outputDir` | `string` | Generation folder |
| `isDev` | `boolean` | Disable F12 or devTools (default is disabled: false). |
| `myIcon` | `string` | Use your favorite icon. |

# Linux (Beta)

| Parameter | Type | Description |
| :-------- | :------- | :---------- |
| `useUrl` | `string` | Your favorite url |
| `outputDir` | `string` | Generation folder |
| `isDev` | `boolean` | Disable F12 or devTools (default is disabled: false). |

```JS

const { webtodesktopLinux } = require("webtodesktop");

webtodesktopLinux("<WEBPAGE>", "<ANYDIR>", "<IS-DEV>","<TYPE>")

```
# Mac (Beta) (DMG)

| Parameter | Type | Description |
| :-------- | :------- | :------------------------- |
| `useUrl` | `string` | Your favorite url |
| `outputDir` | `string` | Generation folder |
| `isDev` | `boolean` | Disable F12 or devTools (default is disabled: false). |

```JS

const { webtodesktopMac } = require("webtodesktop");

webtodesktopMac("<WEBPAGE>", "<ANYDIR>", "<IS-DEV>")
```