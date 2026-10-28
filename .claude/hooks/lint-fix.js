// PostToolUse hook: run eslint --fix on a JS file Claude just edited or wrote.
const { execFileSync } = require("child_process");
const fs = require("fs");
const path = require("path");

const projectDir = process.env.CLAUDE_PROJECT_DIR || process.cwd();
// Run the repo's own eslint through node, so it never downloads a different
// version and works the same on every platform.
const eslintBin = path.join(projectDir, "node_modules/eslint/bin/eslint.js");

let input = "";
process.stdin.on("data", (chunk) => {
  input += chunk;
});
process.stdin.on("end", () => {
  let filePath;
  try {
    filePath = JSON.parse(input).tool_input?.file_path;
  } catch {
    return;
  }
  if (!filePath || !/\.(c|m)?js$/.test(filePath)) return;
  if (/(^|[\\/])node_modules[\\/]/.test(filePath)) return;
  // ESLint ignores files outside the repo with a warning, which --max-warnings 0 turns into a failure.
  const relativePath = path.relative(
    projectDir,
    path.resolve(projectDir, filePath),
  );
  if (relativePath.startsWith("..") || path.isAbsolute(relativePath)) return;
  if (!fs.existsSync(eslintBin)) {
    process.stderr.write("lint-fix hook skipped: run `npm install` first.\n");
    return;
  }

  try {
    execFileSync(
      process.execPath,
      [
        eslintBin,
        "--fix",
        // Same as eslint.config.mjs, but as an error so console.log reaches Claude.
        "--rule",
        "no-console: [error, {allow: [warn, error]}]",
        filePath,
      ],
      {
        cwd: projectDir,
        stdio: "pipe",
      },
    );
  } catch (error) {
    // Exit code 2 feeds the remaining lint errors back to Claude.
    const output = [error.stdout, error.stderr]
      .map((stream) => String(stream || "").trim())
      .filter(Boolean)
      .join("\n");
    process.stderr.write(`${output || error.message}\n`);
    process.exit(2);
  }
});
