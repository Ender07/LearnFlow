#!/usr/bin/env node
const readline = require('readline');
const http = require('http');
const { spawn } = require('child_process');
const path = require('path');

const PORT = 5173; // Default Vite port

const TOOLS = [
  {
    name: "learnflow_health_check",
    description: "Check health and lifecycle status of the LearnFlow Vite development server",
    inputSchema: { type: "object", properties: {} }
  }
];

let isSpawningServer = false;

// Auto-spawn self-healing loop for Vite dev server
async function ensureServerRunning() {
  const online = await checkViteOnline();
  if (online) return true;

  if (!isSpawningServer) {
    isSpawningServer = true;
    console.error("[MCP SELF-HEAL]: LearnFlow Vite dev server offline. Auto-spawning 'npm run dev' on port 5173...");
    
    const projectRoot = path.join(__dirname, '..');
    const nodeDir = path.dirname(process.execPath);
    
    // Inject node path into child process environment so cmd can resolve npm/node
    const env = { ...process.env };
    env.PATH = `${nodeDir};${env.PATH || ''}`;
    
    // Spawn npm run dev in background (runs shell cmd in windows)
    const child = spawn('cmd.exe', ['/c', 'npm run dev'], {
      cwd: projectRoot,
      detached: true,
      stdio: 'ignore',
      env: env
    });
    child.unref();

    // Poll port 5173
    for (let attempt = 0; attempt < 12; attempt++) {
      await new Promise(resolve => setTimeout(resolve, 500));
      const currentOnline = await checkViteOnline();
      if (currentOnline) {
        isSpawningServer = false;
        console.error("[MCP SELF-HEAL]: LearnFlow Vite server is online!");
        return true;
      }
    }
    isSpawningServer = false;
  }
  return false;
}

function checkViteOnline() {
  return new Promise((resolve) => {
    const options = {
      hostname: 'localhost', // Automatically resolves to loopback IPv4/IPv6
      port: PORT,
      path: '/',
      method: 'GET',
      timeout: 1000
    };
    const req = http.request(options, res => {
      resolve(res.statusCode === 200 || res.statusCode === 404 || res.statusCode === 302);
    });
    req.on('error', () => resolve(false));
    req.end();
  });
}

// JSON-RPC Router
const rl = readline.createInterface({
  input: process.stdin,
  output: process.stdout
});

function sendResponse(response) {
  process.stdout.write(JSON.stringify(response) + '\n');
}

rl.on('line', async (line) => {
  if (!line.trim()) return;
  try {
    const req = JSON.parse(line);
    if (req.method === 'tools/list') {
      sendResponse({
        jsonrpc: "2.0",
        id: req.id,
        result: { tools: TOOLS }
      });
    } else if (req.method === 'tools/call') {
      const { name } = req.params || {};
      try {
        if (name === "learnflow_health_check") {
          await ensureServerRunning();
          const finalStatus = await checkViteOnline();
          sendResponse({
            jsonrpc: "2.0",
            id: req.id,
            result: {
              content: [{
                type: "text",
                text: JSON.stringify({
                  status: finalStatus ? "online" : "offline",
                  app: "LearnFlow",
                  port: PORT,
                  timestamp: new Date().toISOString()
                }, null, 2)
              }]
            }
          });
        } else {
          sendResponse({
            jsonrpc: "2.0",
            id: req.id,
            error: { code: -32601, message: `Tool '${name}' not found` }
          });
        }
      } catch (execErr) {
        sendResponse({
          jsonrpc: "2.0",
          id: req.id,
          result: {
            content: [{ type: "text", text: `Error executing LearnFlow tool '${name}': ${execErr.message}` }],
            isError: true
          }
        });
      }
    } else {
      sendResponse({
        jsonrpc: "2.0",
        id: req.id,
        error: { code: -32600, message: "Invalid Request" }
      });
    }
  } catch (err) {
    sendResponse({
      jsonrpc: "2.0",
      id: null,
      error: { code: -32700, message: "Parse error" }
    });
  }
});
