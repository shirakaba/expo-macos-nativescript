const path = require("node:path");
const { getDefaultConfig } = require("@expo/metro-config");
const { makeMetroConfig } = require("@rnx-kit/metro-config");

const config = makeMetroConfig(getDefaultConfig(__dirname));
config.resolver.useWatchman = false;

const originalResolveRequest = config.resolver.resolveRequest;

config.resolver.resolveRequest = (context, moduleName, platform) => {
  if (moduleName === "@nativescript/macos-node-api") {
    return {
      filePath: path.resolve(
        __dirname,
        "node_modules/@nativescript/macos-node-api/index.cjs",
      ),
      type: "sourceFile",
    };
  }

  return originalResolveRequest
    ? originalResolveRequest(context, moduleName, platform)
    : context.resolveRequest(context, moduleName, platform);
};

module.exports = config;
