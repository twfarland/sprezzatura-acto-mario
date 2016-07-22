const common = {

    entry: {
        "es5/app.js": './src/es6/app.js'
    },

    output: {
        path: 'www/',
        filename: '[name]'
    },

    module: {
        loaders: [
            {
              test: /\.js?$/,
              exclude: /node_modules/,
              loader: 'babel'
            }
        ]
    }
};


module.exports = common;
