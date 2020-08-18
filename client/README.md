## How to install

`npx @vkontakte/create-vk-app <folder name>`

## How to start

Go to created folder and run:
`yarn start` || `npm start` — this will start dev server with hot reload on `localhost:10888`.

`yarn run build` || `npm run build` — this will build production bundle, with treeshaking, uglify and all this modern fancy stuff

## for https dev mode 

### Windows (cmd.exe)

```
set HTTPS=true&&npm start
```
(Note: the lack of whitespace is intentional.)

### Windows (Powershell)
```
($env:HTTPS = "true") -and (npm start)
```

### Linux, macOS (Bash)

```
HTTPS=true npm start
```