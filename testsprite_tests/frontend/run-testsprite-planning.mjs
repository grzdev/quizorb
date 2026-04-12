import { spawn } from 'node:child_process';
import { promises as fs } from 'node:fs';
import path from 'node:path';

const root = process.cwd();
const testspriteDir = path.join(root, '.testsprite');
const tmpDir = path.join(testspriteDir, 'tmp');
const outputDir = path.join(root, 'testsprite_tests');
const logPath = path.join(outputDir, 'logs', 'testsprite-mcp-planning.log');

async function ensureDirs() {
  await fs.mkdir(path.dirname(logPath), { recursive: true });
  await fs.mkdir(outputDir, { recursive: true });
}

function createLogger() {
  const lines = [];
  return {
    push(message) {
      const line = `[${new Date().toISOString()}] ${message}`;
      lines.push(line);
      console.log(line);
    },
    async flush() {
      await fs.writeFile(logPath, `${lines.join('\n')}\n`, 'utf8');
    },
  };
}

function safeJsonParse(line) {
  try {
    return JSON.parse(line);
  } catch {
    return null;
  }
}

async function main() {
  await ensureDirs();
  const logger = createLogger();
  const mcpConfig = JSON.parse(await fs.readFile(path.join(root, '.mcp.json'), 'utf8'));
  const apiKey = mcpConfig?.mcpServers?.testsprite?.env?.API_KEY;

  if (!apiKey) {
    throw new Error('Missing TestSprite API key in .mcp.json');
  }

  const command = process.platform === 'win32'
    ? 'npx @testsprite/testsprite-mcp@latest server'
    : 'npx @testsprite/testsprite-mcp@latest server';

  logger.push('Starting TestSprite MCP server for planning-only run');

  const child = spawn(command, {
    cwd: root,
    env: { ...process.env, API_KEY: apiKey },
    shell: true,
    stdio: ['pipe', 'pipe', 'pipe'],
  });

  const stderrLines = [];
  child.stderr.setEncoding('utf8');
  child.stderr.on('data', (chunk) => {
    stderrLines.push(chunk);
  });

  let stdoutBuffer = '';
  const pending = new Map();

  child.stdout.setEncoding('utf8');
  child.stdout.on('data', (chunk) => {
    stdoutBuffer += chunk;
    while (stdoutBuffer.includes('\n')) {
      const index = stdoutBuffer.indexOf('\n');
      const raw = stdoutBuffer.slice(0, index).trim();
      stdoutBuffer = stdoutBuffer.slice(index + 1);
      if (!raw) continue;
      const message = safeJsonParse(raw);
      if (!message) {
        logger.push(`Non-JSON stdout: ${raw}`);
        continue;
      }
      if (typeof message.id !== 'undefined' && pending.has(message.id)) {
        pending.get(message.id)(message);
        pending.delete(message.id);
      } else {
        logger.push(`Notification: ${JSON.stringify(message)}`);
      }
    }
  });

  let nextId = 1;
  function send(method, params, { expectResponse = true, timeoutMs = 300000 } = {}) {
    const id = expectResponse ? nextId++ : undefined;
    const payload = { jsonrpc: '2.0', method, ...(typeof id !== 'undefined' ? { id } : {}), ...(params ? { params } : {}) };
    child.stdin.write(`${JSON.stringify(payload)}\n`);
    logger.push(`Sent ${method}${typeof id !== 'undefined' ? ` (id=${id})` : ''}`);
    if (!expectResponse) return Promise.resolve(null);
    return new Promise((resolve, reject) => {
      const timer = setTimeout(() => {
        pending.delete(id);
        reject(new Error(`Timed out waiting for ${method} response`));
      }, timeoutMs);
      pending.set(id, (message) => {
        clearTimeout(timer);
        if (message.error) {
          reject(new Error(`${method} failed: ${message.error.message}`));
        } else {
          resolve(message.result);
        }
      });
    });
  }

  async function callTool(name, args) {
    logger.push(`Calling tool ${name}`);
    const result = await send('tools/call', { name, arguments: args }, { timeoutMs: 900000 });
    logger.push(`Tool ${name} completed`);
    return result;
  }

  try {
    await send('initialize', {
      protocolVersion: '2024-11-05',
      capabilities: {},
      clientInfo: { name: 'codex-testsprite-runner', version: '1.0.0' },
    });
    await send('notifications/initialized', {}, { expectResponse: false });
    await send('tools/list', {}, { timeoutMs: 120000 });

    const configPath = path.join(tmpDir, 'config.json');
    const currentConfig = JSON.parse(await fs.readFile(configPath, 'utf8'));
    const frontendConfig = {
      ...currentConfig,
      type: 'frontend',
      scope: 'codebase',
      localEndpoint: 'http://127.0.0.1:5173',
    };
    await fs.writeFile(configPath, `${JSON.stringify(frontendConfig, null, 2)}\n`, 'utf8');
    logger.push('Confirmed frontend TestSprite config');

    await callTool('testsprite_check_account_info', {});
    await callTool('testsprite_generate_standardized_prd', { projectPath: root });
    await callTool('testsprite_generate_frontend_test_plan', { projectPath: root, needLogin: false });

    const artifactMap = [
      [path.join(testspriteDir, 'standard_prd.json'), path.join(outputDir, 'standard_prd.json')],
      [path.join(testspriteDir, 'testsprite_frontend_test_plan.json'), path.join(outputDir, 'frontend_test_plan.json')],
      [path.join(tmpDir, 'code_summary.yaml'), path.join(outputDir, 'code_summary.yaml')],
      [path.join(tmpDir, 'config.json'), path.join(outputDir, 'frontend_config_snapshot.json')],
    ];

    for (const [from, to] of artifactMap) {
      await fs.copyFile(from, to);
      logger.push(`Copied ${path.relative(root, from)} -> ${path.relative(root, to)}`);
    }

    const summary = {
      generatedAt: new Date().toISOString(),
      projectRoot: root,
      mode: 'frontend-planning-only',
      localFrontend: 'http://127.0.0.1:5173',
      localBackend: 'http://127.0.0.1:4000',
      artifacts: [
        'testsprite_tests/standard_prd.json',
        'testsprite_tests/frontend_test_plan.json',
        'testsprite_tests/code_summary.yaml',
        'testsprite_tests/frontend_config_snapshot.json',
      ],
    };
    await fs.writeFile(path.join(outputDir, 'planning_summary.json'), `${JSON.stringify(summary, null, 2)}\n`, 'utf8');
    logger.push('Planning summary written');
  } finally {
    child.kill();
    const stderr = stderrLines.join('');
    if (stderr.trim()) {
      logger.push(`Server stderr:\n${stderr.trim()}`);
    }
    await logger.flush();
  }
}

main().catch(async (error) => {
  console.error(error.stack || String(error));
  process.exitCode = 1;
});
