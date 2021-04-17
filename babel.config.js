module.exports = {
    presets: [
        [
            '@babel/preset-env',
            {
                modules: false,
                loose: true,
                targets: undefined,
            },
        ],
    ],
    plugins: [
        [
            '@babel/plugin-proposal-object-rest-spread',
            {
                loose: true,
            },
        ],
    ],
}