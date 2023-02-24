module.exports = {
  apps: [
    {
      name: "Server",
      script: "tsx --inspect ./index.js",
      watch: ["./index.js", "./server/**/*.ts", "./.env"],
      env: {
        MOCKS: "true",
        NODE_ENV: process.env.NODE_ENV ?? "development",
        FORCE_COLOR: "1",
      },
    },
    {
      name: "Remix",
      script: "remix watch",
      ignore_watch: ["."],
      env: {
        NODE_ENV: process.env.NODE_ENV ?? "development",
        FORCE_COLOR: "1",
      },
    },
  ],
};
