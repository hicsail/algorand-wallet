let mix = require('laravel-mix');
const NodePolyfillPlugin = require("node-polyfill-webpack-plugin") 

mix.setPublicPath('./')
   .ts('src/main.ts', 'dist/')
   .js('src/background.js', 'dist/')
   .copy('manifest.json', 'dist/')
   .copy('popup.html', 'dist/')
   .copy('src/assets', 'dist/').vue();

mix.webpackConfig({
   plugins: [
      new NodePolyfillPlugin(),
  ],
   optimization: {
      providedExports: false,
      sideEffects: false,
      usedExports: false
   },
   resolve:{
      extensions: ['.ts'],
      fallback: { 
         "stream": require.resolve("stream-browserify"),
         fs: require.resolve('browserify-fs'),
         "vm": require.resolve("vm-browserify")
      }
   }
});