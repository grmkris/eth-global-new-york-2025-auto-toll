import { getMessage, formatMessage } from "@eth-global/shared";

const server = Bun.serve({
  port: 3001,
  fetch(req) {
    const message = getMessage("Web App");
    const formatted = formatMessage(message);
    
    return new Response(`
      <!DOCTYPE html>
      <html>
        <head>
          <title>ETH Global Web App</title>
        </head>
        <body>
          <h1>${formatted}</h1>
        </body>
      </html>
    `, { 
      headers: { "Content-Type": "text/html" } 
    });
  },
});

console.log(`Web app running at http://localhost:${server.port}`);