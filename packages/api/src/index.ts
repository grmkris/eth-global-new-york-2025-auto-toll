import { getMessage } from "@eth-global/shared";

const server = Bun.serve({
  port: 3000,
  fetch(req) {
    return new Response(getMessage("API Server"));
  },
});

console.log(`Server running at http://localhost:${server.port}`);