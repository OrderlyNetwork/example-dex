/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/*.css'],
  browserNodeBuiltinsPolyfill: { modules: { events: true } },
  serverDependenciesToBundle: ['@radix-ui/themes']
  // appDirectory: "app",
  // assetsBuildDirectory: "public/build",
  // publicPath: "/build/",
  // serverBuildPath: "build/index.js",
};
