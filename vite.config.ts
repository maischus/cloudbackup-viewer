import { defineConfig, PluginOption, PreviewServer, ViteDevServer } from "vite";
import { resolve } from "path";
import express from "express";
import { testServer } from "./test-server/server";
import * as child from "child_process";
import packageConfig from "./package.json";

//const commitHash = child.execSync("git rev-parse --short HEAD").toString();
const commitHash = "TODO";

function expressPlugin(): PluginOption {
  return {
    name: "express-plugin",
    configureServer(server: ViteDevServer) {
      server.middlewares.use(express.json());
      server.middlewares.use(testServer);
    },
    configurePreviewServer(server: PreviewServer) {
      server.middlewares.use(express.json());
      server.middlewares.use(testServer);
    }
  };
}

export default defineConfig({
  build: {
    rollupOptions: {
      input: {
        main: resolve(__dirname, 'index.html'),
        app: resolve(__dirname, 'app/index.html'),
      },
    },
  },
  define: {
    __APP_VERSION__: JSON.stringify(packageConfig.version),
    __COMMIT_HASH__: JSON.stringify(commitHash),
  },
  plugins: [expressPlugin()],
});