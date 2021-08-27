module.exports = {
  webpack: {
    configure: (webpackConfig, { env, paths }) => {
      paths.publicUrlOrPath = webpackConfig.output.publicPath =  "/"; //"https://cdn.explorug.com/explorugentry/roomview/"; //"/" ;
      return webpackConfig;
    },
  },
};
