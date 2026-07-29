#!/usr/bin/env node

"use strict";

const assert = require("assert");
const fs = require("fs");
const os = require("os");
const path = require("path");
const { spawn } = require("child_process");

const PLATFORM_PACKAGES = {
  "darwin-arm64": "@anycap/cli-darwin-arm64",
  "darwin-x64": "@anycap/cli-darwin-x64",
  "linux-arm64": "@anycap/cli-linux-arm64",
  "linux-x64": "@anycap/cli-linux-x64",
  "win32-arm64": "@anycap/cli-win32-arm64",
  "win32-x64": "@anycap/cli-win32-x64",
};

function waitFor(predicate, description, timeoutMs = 5000) {
  const deadline = Date.now() + timeoutMs;

  return new Promise((resolve, reject) => {
    const check = () => {
      if (predicate()) {
        resolve();
        return;
      }
      if (Date.now() >= deadline) {
        reject(new Error(`Timed out waiting for ${description}`));
        return;
      }
      setTimeout(check, 25);
    };
    check();
  });
}

function waitForExit(child, timeoutMs = 5000) {
  return new Promise((resolve, reject) => {
    if (child.exitCode !== null || child.signalCode !== null) {
      resolve({ code: child.exitCode, signal: child.signalCode });
      return;
    }

    const timer = setTimeout(() => {
      reject(new Error("Timed out waiting for wrapper to exit"));
    }, timeoutMs);
    child.once("exit", (code, signal) => {
      clearTimeout(timer);
      resolve({ code, signal });
    });
  });
}

function isProcessAlive(pid) {
  try {
    process.kill(pid, 0);
    return true;
  } catch (error) {
    if (error.code === "ESRCH") {
      return false;
    }
    throw error;
  }
}

async function main() {
  if (process.platform === "win32") {
    process.stdout.write("wrapper lifecycle test skipped on Windows\n");
    return;
  }

  const packageName = PLATFORM_PACKAGES[`${process.platform}-${process.arch}`];
  assert(packageName, "test platform must be supported by the wrapper");

  const fixtureRoot = fs.mkdtempSync(path.join(os.tmpdir(), "anycap-wrapper-"));
  const wrapperDir = path.join(fixtureRoot, "bin");
  const packageDir = path.join(fixtureRoot, "node_modules", ...packageName.split("/"), "bin");
  const wrapperPath = path.join(wrapperDir, "anycap");
  const binaryPath = path.join(packageDir, "anycap");
  const argsPath = path.join(fixtureRoot, "args.json");
  const pidPath = path.join(fixtureRoot, "pid");
  const signalPath = path.join(fixtureRoot, "signal");
  let wrapper;
  let binaryPID;

  try {
    fs.mkdirSync(wrapperDir, { recursive: true });
    fs.mkdirSync(packageDir, { recursive: true });
    fs.copyFileSync(path.resolve(__dirname, "../bin/anycap"), wrapperPath);
    fs.writeFileSync(
      binaryPath,
      `#!/usr/bin/env node
"use strict";
const fs = require("fs");
fs.writeFileSync(process.env.ANYCAP_TEST_ARGS_PATH, JSON.stringify(process.argv.slice(2)));
fs.writeFileSync(process.env.ANYCAP_TEST_PID_PATH, String(process.pid));
process.stdout.write("fixture-ready\\n");
const timer = setInterval(() => {}, 1000);
for (const signal of ["SIGINT", "SIGTERM", "SIGHUP"]) {
  process.on(signal, () => {
    fs.writeFileSync(process.env.ANYCAP_TEST_SIGNAL_PATH, signal);
    clearInterval(timer);
    process.exit(23);
  });
}
`
    );
    fs.chmodSync(binaryPath, 0o755);

    let stdout = "";
    let stderr = "";
    wrapper = spawn(
      process.execPath,
      [wrapperPath, "mcp", "--allow-root", path.join(fixtureRoot, "media")],
      {
        env: {
          ...process.env,
          ANYCAP_TEST_ARGS_PATH: argsPath,
          ANYCAP_TEST_PID_PATH: pidPath,
          ANYCAP_TEST_SIGNAL_PATH: signalPath,
        },
        stdio: ["ignore", "pipe", "pipe"],
      }
    );
    wrapper.stdout.on("data", (chunk) => {
      stdout += chunk;
    });
    wrapper.stderr.on("data", (chunk) => {
      stderr += chunk;
    });

    await waitFor(() => stdout.includes("fixture-ready"), "fixture startup");
    await waitFor(() => fs.existsSync(pidPath), "fixture PID");
    binaryPID = Number(fs.readFileSync(pidPath, "utf8"));

    assert.strictEqual(wrapper.exitCode, null, "wrapper must stay alive with the MCP child");
    assert.deepStrictEqual(JSON.parse(fs.readFileSync(argsPath, "utf8")), [
      "mcp",
      "--allow-root",
      path.join(fixtureRoot, "media"),
    ]);

    wrapper.kill("SIGTERM");
    const exit = await waitForExit(wrapper);
    await waitFor(() => !isProcessAlive(binaryPID), "fixture shutdown");

    assert.strictEqual(fs.readFileSync(signalPath, "utf8"), "SIGTERM");
    assert.deepStrictEqual(exit, { code: 23, signal: null });
    assert.strictEqual(stderr, "");
    process.stdout.write("wrapper lifecycle test passed\n");
  } finally {
    if (wrapper && wrapper.exitCode === null && wrapper.signalCode === null) {
      wrapper.kill("SIGKILL");
    }
    if (binaryPID && isProcessAlive(binaryPID)) {
      process.kill(binaryPID, "SIGKILL");
    }
    fs.rmSync(fixtureRoot, { recursive: true, force: true });
  }
}

main().catch((error) => {
  console.error(error.stack || error.message);
  process.exitCode = 1;
});
