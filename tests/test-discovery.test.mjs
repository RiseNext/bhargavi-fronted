/**
 * 🔴 THE TEST COMMAND MUST ACTUALLY FIND THE TESTS.
 *
 * `npm test` was `node --test --test-reporter=spec tests/`. Node no longer
 * expands a bare directory argument, so it resolved `tests` as a module
 * specifier, threw MODULE_NOT_FOUND, and exited 1 — with all 59 real tests
 * unrun. Every symptom pointed at a broken test rather than at a broken
 * command, and this repository had no CI to make even that much visible.
 *
 * The failure mode worth guarding is not "the script is wrong today" but "a
 * test file exists that the script's pattern does not reach". A suite that
 * silently covers a subset of itself is the same class of defect as the
 * orphaned-content gate in the backend: green, and not measuring what it
 * claims to measure.
 *
 * So this reconciles two independently-derived sets — what the configured
 * pattern matches, and what is actually on disk — and fails on any difference.
 */
import { test } from "node:test";
import assert from "node:assert/strict";
import { globSync, readdirSync, readFileSync } from "node:fs";
import { join, relative, resolve } from "node:path";

const ROOT = resolve(import.meta.dirname, "..");

/** Every `*.test.mjs` under `tests/`, found without consulting the pattern. */
function walk(dir) {
  const out = [];
  for (const entry of readdirSync(dir, { withFileTypes: true })) {
    const path = join(dir, entry.name);
    if (entry.isDirectory()) out.push(...walk(path));
    else if (entry.name.endsWith(".test.mjs")) out.push(path);
  }
  return out;
}

const onDisk = walk(resolve(ROOT, "tests"))
  .map((f) => relative(ROOT, f).split("\\").join("/"))
  .sort();

/** The positional glob(s) the `test` script passes to `node --test`. */
function patternsFromPackageJson() {
  const { scripts } = JSON.parse(readFileSync(resolve(ROOT, "package.json"), "utf8"));
  const script = scripts.test;
  assert.ok(script, "package.json must define a `test` script");

  // Everything that is not the runner, a flag, or a flag's value.
  return script
    .split(/\s+/)
    .slice(1)
    .filter((token) => !token.startsWith("--"))
    .map((token) => token.replace(/^["']|["']$/g, ""));
}

test("the test script passes a glob, not a bare directory", () => {
  const patterns = patternsFromPackageJson();

  assert.ok(patterns.length > 0, "`node --test` needs at least one path pattern");

  // 🔴 The exact shape of the original defect. A trailing-slash directory is
  // not a glob and Node will try to load it as a module.
  for (const pattern of patterns) {
    assert.ok(
      pattern.includes("*"),
      `"${pattern}" is a bare path, not a glob — Node resolves it as a module specifier`,
    );
  }
});

test("🔴 every test file on disk is reached by the configured pattern", () => {
  const matched = patternsFromPackageJson()
    .flatMap((pattern) => globSync(pattern, { cwd: ROOT }))
    .map((f) => f.split("\\").join("/"))
    .sort();

  assert.ok(onDisk.length > 0, "the walk found no test files at all");

  // Reported as a difference rather than a count, so the message names the
  // file that would have gone unrun.
  const missed = onDisk.filter((f) => !matched.includes(f));
  assert.deepEqual(missed, [], `these test files would never run: ${missed.join(", ")}`);

  // And nothing matched that is not a test file, which would mean the pattern
  // is loading production modules as tests.
  const extra = matched.filter((f) => !onDisk.includes(f));
  assert.deepEqual(extra, [], `the pattern matches non-test files: ${extra.join(", ")}`);
});
