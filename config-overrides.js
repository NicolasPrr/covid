const { override, fixBabelImports, addLessLoader } = require("customize-cra");

// Variables: https://github.com/ant-design/ant-design/blob/master/components/style/themes/default.less
module.exports = override(
  fixBabelImports("import", {
    libraryName: "antd",
    libraryDirectory: "es",
    style: "css",
    style: true
  }),
  addLessLoader({
    javascriptEnabled: true,
    modifyVars: {
      "@primary-color": "#5C8787",
      "@layout-header-background": "#5B5C5E",
      "@text-color-secondary-dark": "fade(@white, 95%)",
      "@text-color-dark": "fade(@white, 95%)",
      "@layout-trigger-background": "#5B5C5E",
      // "@layout-sider-background": "fade(@white, 95%)",
      "@layout-sider-background": "#FFF",
    }
  })
);
