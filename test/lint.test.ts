import { describe, it } from "vitest";
import { fileURLToPath } from "node:url";
import spawnAsync from "@expo/spawn-async";

const repoRoot = fileURLToPath(new URL("..", import.meta.url));

describe.concurrent("quality gates", () => {
  it("prettier --check .", async () => {
    await spawnAsync("prettier", ["--check", "."], {
      cwd: repoRoot,
      env: process.env,
    });
  });

  it("tsc -p tsconfig.json", async () => {
    await spawnAsync("tsc", ["-p", "tsconfig.json"], {
      cwd: repoRoot,
      env: process.env,
    });
  });
});
