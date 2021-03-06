# Node Hot Loader [![npm package](https://img.shields.io/npm/v/node-hot-loader.svg?style=flat-square)](https://www.npmjs.org/package/node-hot-loader)

**Node Hot Loader** is a small tool for [Hot Module Replacement](https://webpack.github.io/docs/hot-module-replacement.html) support for Node.js application development with [webpack](https://github.com/webpack/webpack).

It based on work of [webpack-dev-middleware](https://github.com/webpack/webpack-dev-middleware) and [webpack/hot/only-dev-server](https://github.com/webpack/webpack).
Under the hood it uses webpack and babel, so you can use all you need configurations in config files for babel and webpack.

**Node Hot Loader** by default run the all webpack entries in the same **single process** or in forked process, if you set corresponding option.

The most suitable use case for **Node Hot Loader** is hot-reloaded [express](http://expressjs.com/) application.
Express application can contains API and frontend together, moreover frontend can use own HMR, e.g. [React](https://facebook.github.io/react/) with [React Hot Loader](https://github.com/gaearon/react-hot-loader).
See how to setup React HMR with Express in [React Hot Loader docs](https://github.com/gaearon/react-hot-loader/tree/master/docs#starter-kit).
Thus, both the frontend and the server will be hot-reloadable.

**Node Hot Loader** also supports webpack config files written on ES2015+ (through babel).
For using ES2015+ in webpack configuration you must provide .babelrc configuration file in project root directory.

If you have suggestions or you find a bug, please, open an issue or make a PR.

## System requirements

Tested with Node.js v7, v8, but must work on previous versions.

## Installation

```
npm install --save-dev node-hot-loader webpack
```
or
```
yarn add --dev node-hot-loader webpack
```

## Usage

```
Usage: node-hot {options}

Options:
  --config      Path to the webpack config file. If not set then search webpack.config.js in root directory.
  --fork        Launch compiled assets in forked process.
```

## Usage example
```
node-hot --config webpack.config.server.js
```
Of course, you can add script into you package.json:
```json
...
"scripts": {
  "start": "node-hot --config webpack.config.server.js"
}
...
```
and then run with your favorite package manager:
```
npm run start
```
or
```
yarn run start
```

## The minimum required configuration:

**Node Hot Loader** adds all necessaries to webpack config if not present already (e.g. HotModuleReplacementPlugin),
but it's require the minimum configuration in your webpack config file:

```javascript
export default {
  output: {
    // Webpack can't find hot-update if output file is not directly in output.path.
    // For example, filename: 'js/[name].js' will not work.
    // However, I have no many tests for that.
    filename: '[name].js',
  },
};
```

## Express Hot Reload Example

```javascript
import app from './app'; // configuring express app, e.g. routes and logic
import DB from './services/DB'; // DB service

function startServer() {
  return new Promise((resolve, reject) => {
    const httpServer = app.listen(app.get('port'));

    httpServer.once('error', (err: any) => {
      if (err.code === 'EADDRINUSE') {
        reject(err);
      }
    });

    httpServer.once('listening', () => resolve(httpServer));
  }).then(httpServer => {
    const { port } = httpServer.address();
    console.info(`==> 🌎 Listening on ${port}. Open up http://localhost:${port}/ in your browser.`);

    // Hot Module Replacement API
    if (module.hot) {
      let currentApp = app;
      module.hot.accept('./app', () => {
        httpServer.removeListener('request', currentApp);
        import('./app')
          .then(({ default: nextApp }) => {
            currentApp = nextApp;
            httpServer.on('request', currentApp);
            console.log('HttpServer reloaded!');
          })
          .catch(err => console.error(err));
      });

      // For reload main module (self). It will be restart http-server.
      module.hot.accept(err => console.error(err));
      module.hot.dispose(() => {
        console.log('Disposing entry module...');
        httpServer.close();
      });
    }
  });
}

// After DB initialized start server
DB.connect()
  .then(() => {
    console.log('Successfully connected to MongoDB.');
    console.log('Starting http server...');
    return startServer();
  })
  .catch(err => {
    console.error('Error in server start script.', err);
  });
```

## License

[MIT](https://opensource.org/licenses/mit-license.php)
