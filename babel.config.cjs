module.exports = (api) => {
  api.cache(true);

  const presets = [
    [
      '@babel/preset-env',
      {
        targets: {
          node: 'current',
        },
        modules: false,
      },
    ],
  ];
  const plugins = [];

  return {
    presets,
    plugins,
  };
};
