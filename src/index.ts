import Server from "./Server";

const server = new Server();
(async () => {
  await server.start();
})();
