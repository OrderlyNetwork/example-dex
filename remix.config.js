/** @type {import('@remix-run/dev').AppConfig} */
export default {
  ignoredRouteFiles: ['**/*.css'],
  browserNodeBuiltinsPolyfill: { modules: { events: true } },
  serverDependenciesToBundle: 'all',
  serverMainFields: ['browser', 'module', 'main'],
  serverMinify: true,
  serverPlatform: 'node'
};
