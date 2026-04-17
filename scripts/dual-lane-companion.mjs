#!/usr/bin/env node

import fs from "node:fs";
import os from "node:os";
import path from "node:path";
import process from "node:process";
import { execFileSync } from "node:child_process";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);
const ROOT_DIR = path.resolve(__dirname, "..");
const LOG_DIR = path.join(ROOT_DIR, "logs");
const STATE_DIR = path.join(LOG_DIR, "dual-lane-companion");
const JOBS_DIR = path.join(STATE_DIR, "jobs");
const STATE_FILE = path.join(STATE_DIR, "state.json");
const STATE_VERSION = 1;
const MAX_JOBS = 80;
const AGENT_IDLE_PROMPT_START_GRACE_MS =
  Math.max(0, Number(process.env.WAR3_AGENT_IDLE_PROMPT_START_GRACE_SECONDS ?? 45)) * 1000;

const TMPDIR = process.env.TMPDIR || os.tmpdir();

const LANE_CONFIG = {
  codex: {
    label: "Codex",
    watchScript: path.join(ROOT_DIR, "scripts", "codex-watch.sh"),
    monitorScript: path.join(ROOT_DIR, "scripts", "codex-watch-monitor.sh"),
    logPattern: /^codex-watch-\d{4}-\d{2}-\d{2}-\d{6}\.log$/,
    socket: path.join(TMPDIR, "war3-re-tmux", "codex-watch.sock"),
    session: "codex-watch",
    binary: process.env.CODEX_BIN || "/Applications/Codex.app/Contents/Resources/codex",
  },
  glm: {
    label: "GLM",
    watchScript: path.join(ROOT_DIR, "scripts", "glm-watch.sh"),
    monitorScript: path.join(ROOT_DIR, "scripts", "glm-watch-monitor.sh"),
    logPattern: /^glm-watch-\d{4}-\d{2}-\d{2}-\d{6}\.log$/,
    socket: path.join(TMPDIR, "war3-re-tmux", "glm-watch.sock"),
    session: "glm-watch",
    binary: process.env.CLAUDE_BIN || "claude",
  },
};

const QUEUE_CONFIG = {
  codex: {
    queueDoc: path.join(ROOT_DIR, "docs", "CODEX_ACTIVE_QUEUE.md"),
    heading: "## Current Codex Queue State",
    completedStatuses: new Set(["accepted", "done", "completed"]),
  },
  glm: {
    queueDoc: path.join(ROOT_DIR, "docs", "GLM_READY_TASK_QUEUE.md"),
    heading: "Current queue state:",
    completedStatuses: new Set(["accepted", "completed", "done"]),
  },
};

function ensureStateDirs() {
  fs.mkdirSync(JOBS_DIR, { recursive: true });
}

function nowIso() {
  return new Date().toISOString();
}

function defaultState() {
  return {
    version: STATE_VERSION,
    jobs: [],
  };
}

function loadState() {
  ensureStateDirs();
  if (!fs.existsSync(STATE_FILE)) {
    return defaultState();
  }

  try {
    const parsed = JSON.parse(fs.readFileSync(STATE_FILE, "utf8"));
    return {
      ...defaultState(),
      ...parsed,
      jobs: Array.isArray(parsed.jobs) ? parsed.jobs : [],
    };
  } catch {
    return defaultState();
  }
}

function saveState(state) {
  ensureStateDirs();
  const jobs = [...(state.jobs ?? [])]
    .sort((left, right) => String(right.updatedAt ?? "").localeCompare(String(left.updatedAt ?? "")))
    .slice(0, MAX_JOBS);

  const nextState = {
    version: STATE_VERSION,
    jobs,
  };

  fs.writeFileSync(STATE_FILE, `${JSON.stringify(nextState, null, 2)}\n`, "utf8");
  return nextState;
}

function updateState(mutate) {
  const state = loadState();
  mutate(state);
  return saveState(state);
}

function resolveJobFile(jobId) {
  ensureStateDirs();
  return path.join(JOBS_DIR, `${jobId}.json`);
}

function readJobFile(jobId) {
  return JSON.parse(fs.readFileSync(resolveJobFile(jobId), "utf8"));
}

function tryReadJobFile(jobId) {
  try {
    return readJobFile(jobId);
  } catch {
    return null;
  }
}

function isTerminalJobStatus(status) {
  return ["blocked", "cancelled", "completed", "interrupted"].includes(String(status ?? ""));
}

function preserveTerminalJobState(existing, incoming) {
  if (!existing || existing.id !== incoming.id) return incoming;
  const existingStatus = normalizeStatus(existing.status);
  const incomingStatus = normalizeStatus(incoming.status);
  if (
    incomingStatus === "running" &&
    (
      (existingStatus === "completed" && !hasCompletionMarker(existing.resultText ?? "", existing.id)) ||
      (existingStatus === "blocked" && !hasBlockedMarker(existing.resultText ?? "", existing.id))
    )
  ) {
    return {
      ...incoming,
      completedAt: null,
      resultText: incoming.resultText ?? "",
    };
  }
  if (
    normalizeStatus(existing.status) === "interrupted" &&
    normalizeStatus(incoming.status) === "running" &&
    incoming.terminalRecovery === true
  ) {
    const { terminalRecovery, ...recovered } = incoming;
    return {
      ...recovered,
      completedAt: null,
      resultText: incoming.resultText ?? "",
    };
  }
  if (!isTerminalJobStatus(existing.status) || isTerminalJobStatus(incoming.status)) return incoming;

  return {
    ...incoming,
    status: existing.status,
    phase: existing.phase,
    completedAt: existing.completedAt ?? incoming.completedAt ?? null,
    summary: existing.summary || incoming.summary || "",
    resultText: existing.resultText || incoming.resultText || "",
  };
}

function writeJobFile(job) {
  ensureStateDirs();
  let nextJob = job;
  try {
    nextJob = preserveTerminalJobState(readJobFile(job.id), job);
  } catch {
    nextJob = job;
  }
  fs.writeFileSync(resolveJobFile(nextJob.id), `${JSON.stringify(nextJob, null, 2)}\n`, "utf8");
  return nextJob;
}

function upsertJobSummary(jobPatch) {
  return updateState((state) => {
    const timestamp = nowIso();
    const existingIndex = state.jobs.findIndex((job) => job.id === jobPatch.id);
    let nextPatch = jobPatch;
    if (existingIndex === -1) {
      state.jobs.unshift({
        createdAt: timestamp,
        updatedAt: timestamp,
        ...nextPatch,
      });
      return;
    }
    nextPatch = preserveTerminalJobState(state.jobs[existingIndex], jobPatch);
    state.jobs[existingIndex] = {
      ...state.jobs[existingIndex],
      ...nextPatch,
      updatedAt: timestamp,
    };
  });
}

function generateJobId(lane) {
  return `${lane}-${Date.now().toString(36)}-${Math.random().toString(36).slice(2, 8)}`;
}

function usage() {
  console.log(
    [
      "Usage:",
      "  node scripts/dual-lane-companion.mjs setup",
      "  node scripts/dual-lane-companion.mjs task --lane <codex|glm> [--title <title>] [prompt]",
      "  node scripts/dual-lane-companion.mjs refresh --lane <codex|glm> [--limit <n>] [--json]",
      "  node scripts/dual-lane-companion.mjs status [job-id] [--lane <codex|glm>] [--json] [--all]",
      "  node scripts/dual-lane-companion.mjs result [job-id] [--json]",
      "  node scripts/dual-lane-companion.mjs cancel [job-id] [--json]",
    ].join("\n"),
  );
}

function parseArgs(argv) {
  const positional = [];
  const options = {};

  for (let index = 0; index < argv.length; index += 1) {
    const token = argv[index];
    if (!token.startsWith("--")) {
      positional.push(token);
      continue;
    }

    const key = token.slice(2);
    const next = argv[index + 1];
    if (!next || next.startsWith("--")) {
      options[key] = true;
      continue;
    }
    options[key] = next;
    index += 1;
  }

  return { positional, options };
}

function laneConfigOrThrow(lane) {
  const config = LANE_CONFIG[lane];
  if (!config) {
    throw new Error(`Unsupported lane "${lane}". Use codex or glm.`);
  }
  return config;
}

function run(command, args, options = {}) {
  return execFileSync(command, args, {
    cwd: ROOT_DIR,
    encoding: "utf8",
    stdio: ["pipe", "pipe", "pipe"],
    ...options,
  }).trim();
}

function runBestEffort(command, args, options = {}) {
  try {
    return run(command, args, options);
  } catch (error) {
    const stdout = error.stdout?.toString?.() ?? "";
    const stderr = error.stderr?.toString?.() ?? "";
    return [stdout, stderr].filter(Boolean).join("\n").trim();
  }
}

function readStdinIfPiped() {
  if (process.stdin.isTTY) {
    return "";
  }
  return fs.readFileSync(0, "utf8");
}

function firstMeaningfulLine(text) {
  return String(text ?? "")
    .split(/\r?\n/)
    .map((line) => line.trim())
    .find(Boolean) ?? "";
}

function shorten(text, limit = 96) {
  const normalized = String(text ?? "").trim().replace(/\s+/g, " ");
  if (!normalized) return "";
  if (normalized.length <= limit) return normalized;
  return `${normalized.slice(0, limit - 3)}...`;
}

function latestLaneLogFile(lane) {
  const config = laneConfigOrThrow(lane);
  const statusOutput = runBestEffort(config.watchScript, ["status"]);
  const statusMatch = statusOutput.match(/^Log:\s+(.+)$/m);
  if (statusMatch?.[1] && fs.existsSync(statusMatch[1].trim())) {
    return statusMatch[1].trim();
  }

  const files = fs
    .readdirSync(LOG_DIR, { withFileTypes: true })
    .filter((entry) => entry.isFile() && config.logPattern.test(entry.name))
    .map((entry) => path.join(LOG_DIR, entry.name))
    .sort((left, right) => {
      const leftStat = fs.statSync(left);
      const rightStat = fs.statSync(right);
      return rightStat.mtimeMs - leftStat.mtimeMs;
    });

  return files[0] ?? null;
}

function ensureLaneSession(lane) {
  const config = laneConfigOrThrow(lane);
  const capture = runBestEffort(config.watchScript, ["capture"]);
  if (capture && !capture.includes("Session") && !capture.includes("is not running")) {
    return;
  }
  runBestEffort(config.watchScript, ["start"]);
}

function readMonitorStatus(lane) {
  const config = laneConfigOrThrow(lane);
  const checkRaw = runBestEffort(config.monitorScript, ["check"]);
  const raw = runBestEffort(config.monitorScript, ["status"]) || checkRaw;
  try {
    return JSON.parse(raw);
  } catch {
    return {
      state: "unknown",
      detail: raw || checkRaw || `${lane} monitor status unavailable`,
    };
  }
}

function readPaneCurrentCommand(lane) {
  const config = laneConfigOrThrow(lane);
  const raw = runBestEffort("tmux", ["-S", config.socket, "list-panes", "-t", `${config.session}:0.0`, "-F", "#{pane_current_command}"]);
  return firstMeaningfulLine(raw);
}

function readPaneCapture(lane) {
  const config = laneConfigOrThrow(lane);
  return runBestEffort(config.watchScript, ["capture"]);
}

function isShellCommand(command) {
  return /^(zsh|bash|sh|fish)$/i.test(String(command ?? "").trim());
}

function findNextLogOffset(job) {
  if (!job.sessionLogFile || !Number.isFinite(job.logOffsetStart)) {
    return null;
  }

  const candidates = loadState().jobs
    .filter((summary) => summary.lane === job.lane && summary.id !== job.id)
    .map((summary) => {
      try {
        return readJobFile(summary.id);
      } catch {
        return null;
      }
    })
    .filter(Boolean)
    .filter(
      (candidate) =>
        candidate.sessionLogFile === job.sessionLogFile &&
        Number.isFinite(candidate.logOffsetStart) &&
        candidate.logOffsetStart > job.logOffsetStart,
    )
    .sort((left, right) => left.logOffsetStart - right.logOffsetStart);

  return candidates[0]?.logOffsetStart ?? null;
}

function readJobOutputSlice(job) {
  if (!job.sessionLogFile || !fs.existsSync(job.sessionLogFile)) {
    return "";
  }

  const buffer = fs.readFileSync(job.sessionLogFile);
  const offset = Number.isFinite(job.logOffsetStart) ? job.logOffsetStart : 0;
  if (offset >= buffer.length) {
    return "";
  }
  const nextOffset = findNextLogOffset(job);
  const endOffset =
    Number.isFinite(nextOffset) && nextOffset > offset && nextOffset <= buffer.length ? nextOffset : buffer.length;
  return buffer.slice(offset, endOffset).toString("utf8");
}

function progressPreviewFromSlice(slice, maxLines = 6) {
  return slice
    .split(/\r?\n/)
    .map((line) => line.trimEnd())
    .filter((line) => line.trim())
    .slice(-maxLines);
}

function normalizeLogLine(value) {
  return stripAnsi(value)
    .replace(/^[\s>*•\-⏺✻✳✢✶✽·]+/, "")
    .trim();
}

function extractReadyLine(slice) {
  const line = slice
    .split(/\r?\n/)
    .map((value) => normalizeLogLine(value))
    .find((value) => value === "READY_FOR_NEXT_TASK" || value.startsWith("READY_FOR_NEXT_TASK:"));
  return line ?? "";
}

function stripAnsi(value) {
  return String(value ?? "")
    .replaceAll(/\u001b\][^\u0007]*(?:\u0007|\u001b\\)/g, "")
    .replaceAll(/\u001b\[[0-9;?]*[ -/]*[@-~]/g, "")
    .replaceAll(/\u001b[=>]/g, "");
}

function normalizeTitle(value) {
  return String(value ?? "").replaceAll("`", "").trim();
}

function normalizeStatus(value) {
  return normalizeTitle(value).toLowerCase();
}

function jobAgeMs(job) {
  const timestamp = Date.parse(String(job?.startedAt ?? job?.createdAt ?? ""));
  if (!Number.isFinite(timestamp)) return Number.POSITIVE_INFINITY;
  return Date.now() - timestamp;
}

function isWithinAgentStartGrace(job, paneCapture) {
  if (AGENT_IDLE_PROMPT_START_GRACE_MS <= 0) return false;
  if (!job?.id || !String(paneCapture ?? "").includes(String(job.id))) return false;
  return jobAgeMs(job) >= 0 && jobAgeMs(job) < AGENT_IDLE_PROMPT_START_GRACE_MS;
}

function splitTableLine(line) {
  return String(line ?? "")
    .trim()
    .split("|")
    .slice(1, -1)
    .map((cell) => cell.trim());
}

function parseQueueTaskStatusFromText(text, heading, title) {
  const lines = String(text ?? "").replaceAll("\r\n", "\n").split("\n");
  const headingIndex = lines.findIndex((line) => line.trim() === heading);
  if (headingIndex === -1) return "";

  let start = headingIndex + 1;
  while (start < lines.length && !lines[start].trim().startsWith("|")) {
    start += 1;
  }
  if (start >= lines.length) return "";

  const headers = splitTableLine(lines[start]);
  const taskIndex = headers.findIndex((header) => normalizeStatus(header) === "task");
  const statusIndex = headers.findIndex((header) => normalizeStatus(header) === "status");
  if (taskIndex === -1 || statusIndex === -1) return "";

  for (let index = start + 2; index < lines.length && lines[index].trim().startsWith("|"); index += 1) {
    const cells = splitTableLine(lines[index]);
    if (normalizeTitle(cells[taskIndex]) === normalizeTitle(title)) {
      return normalizeStatus(cells[statusIndex]);
    }
  }

  return "";
}

function readQueueTaskStatus(lane, title) {
  const config = QUEUE_CONFIG[lane];
  if (!config || !fs.existsSync(config.queueDoc)) return "";
  return parseQueueTaskStatusFromText(fs.readFileSync(config.queueDoc, "utf8"), config.heading, title);
}

function inferQueueDocumentCompletion(job, queueStatus, completedAt = nowIso()) {
  if (job.status !== "running" || job.completedAt) return null;
  const config = QUEUE_CONFIG[job.lane];
  if (!config?.completedStatuses.has(normalizeStatus(queueStatus))) return null;

  return {
    status: "completed",
    phase: "done",
    completedAt,
    summary: "Recovered completed state from queue source-of-truth.",
  };
}

function isPromptInstructionMarkerContext(lines, index) {
  const context = lines
    .slice(Math.max(0, index - 4), Math.min(lines.length, index + 5))
    .map((line) => normalizeLogLine(line).toLowerCase())
    .join("\n");

  return [
    "closeout requirements",
    "start your final closeout",
    "if the task is complete",
    "if truly blocked",
    "emit the exact line",
    "完成后必须输出",
    "必须输出",
    "输出：",
    "输出:",
  ].some((needle) => context.includes(needle));
}

function exactMarkerLineIndex(slice, marker) {
  const lines = String(slice ?? "").split(/\r?\n/);
  return lines.findIndex(
    (line, index) =>
      normalizeLogLine(line) === marker &&
      !isPromptInstructionMarkerContext(lines, index),
  );
}

function hasExactMarkerLine(slice, marker) {
  return exactMarkerLineIndex(slice, marker) !== -1;
}

function hasCompletionMarker(slice, jobId) {
  return hasExactMarkerLine(slice, `JOB_COMPLETE: ${jobId}`);
}

function hasBlockedMarker(slice, jobId) {
  return hasExactMarkerLine(slice, `JOB_BLOCKED: ${jobId}`);
}

function extractResultBlock(job, slice) {
  const marker = `JOB_COMPLETE: ${job.id}`;
  const lines = slice.split(/\r?\n/);
  const index = exactMarkerLineIndex(slice, marker);
  if (index === -1) {
    return stripAnsi(slice).trim();
  }
  return stripAnsi(lines.slice(index).join("\n")).trim();
}

function inferInterruptedState(job, slice, progressPreview, paneCommand) {
  if (job.status === "cancelled") return null;

  const normalizedSlice = stripAnsi(slice);
  const lower = normalizedSlice.toLowerCase();
  const lastLine = normalizeLogLine(progressPreview.at(-1) ?? "");
  const runtimeInShell = isShellCommand(paneCommand);
  const interrupted = lower.includes("conversation interrupted");
  const shellPromptVisible =
    /[%#$]\s*$/.test(lastLine) ||
    /(^|\n)[^\n]*[@~:/.-][^\n]*[%#$]\s*$/.test(normalizedSlice.trimEnd());

  if (!interrupted && !shellPromptVisible) return null;

  return {
    status: "interrupted",
    phase: "needs_reroute",
    completedAt: job.completedAt ?? nowIso(),
    summary: interrupted
      ? "Lane runtime was interrupted before a closeout marker was emitted."
      : runtimeInShell
        ? "Lane runtime returned to shell before a closeout marker was emitted."
        : "Lane job slice ended at a shell prompt before a closeout marker was emitted.",
    resultText: normalizedSlice.trim(),
  };
}

function hasQueuedPromptHint(text) {
  return stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => line.trim().toLowerCase().replace(/^p\s*r\s*e\s*s\s*s/, "press"))
    .some(
      (line) =>
        line === "press up to edit queued messages." ||
        line === "press up to edit queued messages" ||
        line === "press enter to send." ||
        line === "press enter to send" ||
        line === "press return to send." ||
        line === "press return to send" ||
        line === "queued prompt." ||
        line === "queued prompt" ||
        line === "message queued." ||
        line === "message queued",
    );
}

function normalizeAgentPaneLine(line) {
  return stripAnsi(line)
    .replace(/^[\s|│┃╭╰╎>⏵⏺•\-]+/u, "")
    .trim();
}

function hasBackgroundAgentWork(text) {
  const recent = stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => normalizeAgentPaneLine(line))
    .filter(Boolean)
    .slice(-120);

  const hasBackgroundTool = recent.some((line) =>
    /^(?:Explore|Task|researcher)\(/i.test(line) ||
    /ctrl\+b ctrl\+b/i.test(line),
  );
  const hasActiveBackgroundStatus = recent.some(isLiveClaudeStatusLine);

  return hasBackgroundTool && hasActiveBackgroundStatus;
}

function isLiveClaudeStatusLine(line) {
  return (
    /^[·✶✳✻✽✢⏺\s]*[A-Z][A-Za-z]+[.…]\s*\(\s*\d+\s*(?:s|m|h)(?:\s+\d+\s*(?:s|m|h))*\s*(?:·[^)]*)?\)/i.test(line) ||
    /^[·✶✳✻✽✢⏺\s]*(?:Create|Update|Run|Write|Read|Fix|Add|Implement|Build|Test|Review|Inspect)\b[^.…()]{0,80}[.…]\s*\(\s*\d+\s*(?:s|m|h)(?:\s+\d+\s*(?:s|m|h))*\s*(?:·[^)]*)?\)/i.test(line) ||
    /^[·✶✳✻✽✢]\s*[A-Z][A-Za-z]+[.…]\s*$/i.test(line)
  );
}

function hasLiveClaudeStatus(text) {
  return stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => normalizeAgentPaneLine(line))
    .filter(Boolean)
    .slice(-80)
    .some(isLiveClaudeStatusLine);
}

function hasCurrentClaudeChecklistProgress(text) {
  const recent = stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => normalizeAgentPaneLine(line))
    .filter(Boolean)
    .slice(-100);
  const taskSummaryIndex = recent.findLastIndex((line) =>
    /\b\d+\s+tasks?\s+\([^)]*\b\d+\s+in progress\b/i.test(line),
  );
  if (taskSummaryIndex === -1) return false;
  return recent.slice(taskSummaryIndex + 1).some((line) => /(?:⎿\s*)?◼\s+/.test(line));
}

function hasLiveImplementingTaskPanel(text) {
  const recent = stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => normalizeAgentPaneLine(line))
    .filter(Boolean)
    .slice(-100);
  const statusIndex = recent.findLastIndex((line) =>
    /^[·✶✳✻✽✢⏺\s]*Implementing\b[^.…()]{0,100}[.…]\s*\(\s*\d+\s*(?:s|m|h)(?:\s+\d+\s*(?:s|m|h))*\s*(?:·[^)]*)?\)/i.test(line),
  );
  if (statusIndex === -1) return false;
  return recent.slice(statusIndex + 1).some((line) => /(?:⎿\s*)?◼\s+/.test(line));
}

function titleProgressTokens(title) {
  const generic = new Set([
    "task",
    "runtime",
    "construction",
    "exposure",
    "contract",
    "proof",
    "implementation",
    "impl",
  ]);
  return Array.from(
    new Set(
      String(title ?? "")
        .replace(/^Task\s+\d+\s*[—-]\s*/i, "")
        .split(/[^A-Za-z0-9_]+/)
        .map((token) => token.trim())
        .filter((token) => token.length >= 3)
        .filter((token) => !/^\d+$/.test(token))
        .filter((token) => !generic.has(token.toLowerCase())),
    ),
  );
}

function hasLiveJobProgress(paneCapture, job) {
  if (
    !hasLiveClaudeStatus(paneCapture) &&
    !hasBackgroundAgentWork(paneCapture) &&
    !hasCurrentClaudeChecklistProgress(paneCapture) &&
    !hasLiveImplementingTaskPanel(paneCapture)
  ) return false;

  const normalizedCapture = stripAnsi(paneCapture).toLowerCase();
  if (job?.id && normalizedCapture.includes(String(job.id).toLowerCase())) return true;

  const tokens = titleProgressTokens(job?.title);
  if (!tokens.length) return false;

  const matched = tokens.filter((token) => normalizedCapture.includes(token.toLowerCase()));
  const strongMatched = matched.filter((token) => /[A-Z]/.test(token) || /_/.test(token) || /\d/.test(token));
  return matched.length >= 2 || strongMatched.length >= 1;
}

function hasAgentIdlePrompt(text) {
  return stripAnsi(text)
    .split(/\r?\n/)
    .map((line) => line.trim())
    .filter(Boolean)
    .slice(-12)
    .some((line) => /^❯(?:\s|$)/.test(line) || /^›(?:\s|$)/.test(line));
}

function inferAgentIdlePromptState(job, paneCapture, paneCommand) {
  if (job.status !== "running" || job.completedAt) return null;
  if (isShellCommand(paneCommand)) return null;
  if (!hasAgentIdlePrompt(paneCapture)) return null;
  if (isWithinAgentStartGrace(job, paneCapture)) return null;
  if (hasQueuedPromptHint(paneCapture)) return null;
  if (hasLiveJobProgress(paneCapture, job)) return null;
  if (hasLiveClaudeStatus(paneCapture)) return null;
  if (hasCurrentClaudeChecklistProgress(paneCapture)) return null;
  if (hasBackgroundAgentWork(paneCapture)) return null;

  return {
    status: "interrupted",
    phase: "needs_reroute",
    completedAt: nowIso(),
    summary: "Lane runtime is idle at the agent prompt before this job emitted a closeout marker.",
    resultText: stripAnsi(paneCapture).trim(),
  };
}

function inferRecoveredCompletion(job, monitorState, paneCommand) {
  if (job.status !== "running" || !job.completedAt) return null;
  if (!hasCompletionMarker(job.resultText ?? "", job.id)) return null;

  return {
    status: "completed",
    phase: "done",
    completedAt: job.completedAt,
    summary: job.summary || "Recovered completed state from companion history.",
  };
}

function inferTerminalTimestampWithoutMarker(job) {
  if (job.status !== "running" || !job.completedAt) return null;
  if (hasCompletionMarker(job.resultText ?? "", job.id) || hasBlockedMarker(job.resultText ?? "", job.id)) return null;

  return {
    status: "interrupted",
    phase: "needs_reroute",
    completedAt: job.completedAt,
    summary: "Retired impossible running+completedAt state without a matching closeout marker.",
  };
}

function inferRestartedSessionState(job, currentSessionLogFile) {
  if (job.status !== "running") return null;
  if (!job.sessionLogFile || !currentSessionLogFile) return null;
  if (path.resolve(job.sessionLogFile) === path.resolve(currentSessionLogFile)) return null;

  return {
    status: "interrupted",
    phase: "needs_reroute",
    completedAt: job.completedAt ?? nowIso(),
    summary: "Lane session restarted before this job emitted a closeout marker.",
  };
}

function refreshJob(job) {
  const slice = readJobOutputSlice(job);
  const progressPreview = progressPreviewFromSlice(slice);
  const monitor = readMonitorStatus(job.lane);
  const paneCommand = readPaneCurrentCommand(job.lane);
  const paneCapture = readPaneCapture(job.lane);
  const currentSessionLogFile = latestLaneLogFile(job.lane);
  const nextPatch = {
    ...job,
    progressPreview,
    monitorState: monitor.state ?? "unknown",
    monitorDetail: monitor.detail ?? "",
    monitorInactiveSeconds: monitor.inactive_seconds ?? null,
    paneCommand,
  };

  const completionVisibleInSlice = hasCompletionMarker(slice, job.id);
  const completionVisibleInPane = hasCompletionMarker(paneCapture, job.id);
  const blockedVisibleInSlice = hasBlockedMarker(slice, job.id);
  const blockedVisibleInPane = hasBlockedMarker(paneCapture, job.id);
  const resultSource = completionVisibleInPane && !completionVisibleInSlice ? paneCapture : slice;
  const terminalLiveRecovery = normalizeStatus(job.status) === "interrupted" && hasLiveJobProgress(paneCapture, job);

  if (completionVisibleInSlice || completionVisibleInPane) {
    const completedAt = job.completedAt ?? nowIso();
    const readyLine = extractReadyLine(resultSource);
    const resultBlock = extractResultBlock(job, resultSource);
    nextPatch.status = "completed";
    nextPatch.phase = "done";
    nextPatch.completedAt = completedAt;
    nextPatch.summary = readyLine || shorten(firstMeaningfulLine(resultBlock), 120);
    nextPatch.resultText = resultBlock;
  } else if (blockedVisibleInSlice || blockedVisibleInPane) {
    nextPatch.status = "blocked";
    nextPatch.phase = "blocked";
    nextPatch.summary = shorten(firstMeaningfulLine(stripAnsi(paneCapture || slice)), 120);
  } else if (job.status !== "cancelled") {
    if (terminalLiveRecovery) {
      nextPatch.status = "running";
      nextPatch.phase = monitor.state === "stalled" ? "stalled" : "running";
      nextPatch.completedAt = null;
      nextPatch.summary = "Recovered running state from live lane output.";
      nextPatch.resultText = "";
      nextPatch.terminalRecovery = true;
    } else {
      const queueCompletion = inferQueueDocumentCompletion(job, readQueueTaskStatus(job.lane, job.title));
      if (queueCompletion) {
        Object.assign(nextPatch, queueCompletion);
        nextPatch.resultText = nextPatch.resultText || stripAnsi(paneCapture || slice).trim();
      } else {
        const restarted = inferRestartedSessionState(job, currentSessionLogFile);
        if (restarted) {
          Object.assign(nextPatch, restarted);
          nextPatch.resultText = nextPatch.resultText || stripAnsi(slice).trim();
        } else {
          const recovered = inferRecoveredCompletion(job, monitor.state, paneCommand);
          if (recovered) {
            Object.assign(nextPatch, recovered);
            nextPatch.resultText = nextPatch.resultText || stripAnsi(paneCapture || slice).trim();
          } else {
            const invalidTerminalState = inferTerminalTimestampWithoutMarker(job);
            if (invalidTerminalState) {
              Object.assign(nextPatch, invalidTerminalState);
              nextPatch.resultText = nextPatch.resultText || stripAnsi(paneCapture || slice).trim();
            } else {
              const interrupted =
                inferInterruptedState(job, slice, progressPreview, paneCommand) ||
                inferAgentIdlePromptState(job, paneCapture, paneCommand);
              if (interrupted) {
                Object.assign(nextPatch, interrupted);
              } else {
                nextPatch.status = "running";
                nextPatch.phase = monitor.state === "stalled" ? "stalled" : "running";
                nextPatch.summary = shorten(stripAnsi(progressPreview.at(-1) ?? job.summary ?? ""), 120);
              }
            }
          }
        }
      }
    }
  }

  const persistedJob = writeJobFile(nextPatch);
  upsertJobSummary({
    id: persistedJob.id,
    lane: persistedJob.lane,
    title: persistedJob.title,
    status: persistedJob.status,
    phase: persistedJob.phase,
    summary: persistedJob.summary,
    createdAt: persistedJob.createdAt,
    startedAt: persistedJob.startedAt,
    completedAt: persistedJob.completedAt ?? null,
    updatedAt: nowIso(),
  });

  return persistedJob;
}

function refreshAllJobs() {
  const state = loadState();
  return state.jobs
    .map((summary) => tryReadJobFile(summary.id))
    .filter(Boolean)
    .map((job) => (shouldRefreshJobInList(job) ? refreshJob(job) : job));
}

function shouldRefreshJobInList(job, { refreshTerminal = false } = {}) {
  if (refreshTerminal) return true;
  return !isTerminalJobStatus(job.status);
}

function resolveJob(reference, { refresh = false } = {}) {
  const summaries = loadState().jobs.sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  if (!reference) {
    if (!summaries[0]) return null;
    const job = readJobFile(summaries[0].id);
    return refresh ? refreshJob(job) : job;
  }

  const exact = summaries.find((job) => job.id === reference);
  if (exact) {
    const job = readJobFile(exact.id);
    return refresh ? refreshJob(job) : job;
  }

  const prefixMatches = summaries.filter((job) => job.id.startsWith(reference));
  if (prefixMatches.length === 1) {
    const job = readJobFile(prefixMatches[0].id);
    return refresh ? refreshJob(job) : job;
  }
  if (prefixMatches.length > 1) {
    throw new Error(`Job reference "${reference}" is ambiguous.`);
  }
  throw new Error(`No job found for "${reference}".`);
}

function buildTaskPrompt(job, userPrompt) {
  return [
    "[DUAL_LANE_JOB]",
    `JOB_ID: ${job.id}`,
    `LANE: ${job.lane}`,
    `TITLE: ${job.title}`,
    "",
    "Task:",
    userPrompt.trim(),
    "",
    "Runtime command safety:",
    "- If runtime or Playwright verification is required, use `./scripts/run-runtime-tests.sh ... --reporter=list`; do not run `npx playwright test`, `npm exec playwright`, `vite preview`, or browser processes directly.",
    "- If this task forbids Playwright/runtime, do not start Playwright, Vite, or browser processes at all.",
    "",
    "Closeout requirements:",
    `- Start your final closeout with the exact line: JOB_COMPLETE: ${job.id}`,
    `- If truly blocked, emit the exact line: JOB_BLOCKED: ${job.id}`,
    "- Include sections for files changed, verification run, and remaining unknowns.",
    "- End with an exact line that begins with READY_FOR_NEXT_TASK: followed by the next safe continuation.",
    "- Keep the work within the requested scope; do not widen ownership on your own.",
  ].join("\n");
}

function renderJson(value) {
  process.stdout.write(`${JSON.stringify(value, null, 2)}\n`);
}

function toLeanJob(job) {
  return {
    id: job.id,
    lane: job.lane,
    title: job.title,
    status: job.status,
    phase: job.phase,
    createdAt: job.createdAt,
    startedAt: job.startedAt,
    updatedAt: job.updatedAt,
    completedAt: job.completedAt ?? null,
    summary: job.summary ?? "",
    monitorState: job.monitorState ?? "",
    monitorDetail: job.monitorDetail ?? "",
    monitorInactiveSeconds: job.monitorInactiveSeconds ?? null,
  };
}

function renderSetupReport() {
  const lanes = Object.entries(LANE_CONFIG).map(([lane, config]) => ({
    lane,
    label: config.label,
    binary: config.binary,
    watchScript: path.relative(ROOT_DIR, config.watchScript),
    monitorScript: path.relative(ROOT_DIR, config.monitorScript),
    monitor: readMonitorStatus(lane),
  }));

  return {
    workspaceRoot: ROOT_DIR,
    stateFile: STATE_FILE,
    jobsDir: JOBS_DIR,
    lanes,
  };
}

function renderStatusReport(jobs, single = null) {
  const targetJobs = single ? [single] : jobs;
  const lines = [];

  if (single) {
    lines.push(`# ${single.id}`);
  } else {
    lines.push("# Dual-Lane Companion Status");
  }
  lines.push("");

  for (const job of targetJobs) {
    lines.push(`- ${job.id} | ${job.lane} | ${job.status} | ${job.title}`);
    if (job.phase) {
      lines.push(`  Phase: ${job.phase}`);
    }
    if (job.summary) {
      lines.push(`  Summary: ${job.summary}`);
    }
    if (job.sessionLogFile) {
      lines.push(`  Log: ${job.sessionLogFile}`);
    }
    if (job.progressPreview?.length) {
      lines.push("  Progress:");
      for (const line of job.progressPreview) {
        lines.push(`    ${line}`);
      }
    }
  }

  return `${lines.join("\n").trimEnd()}\n`;
}

function interruptLane(lane) {
  const config = laneConfigOrThrow(lane);
  run("tmux", ["-S", config.socket, "send-keys", "-t", `${config.session}:0.0`, "C-c"]);
}

async function handleSetup(args) {
  const report = renderSetupReport();
  if (args.options.json) {
    renderJson(report);
    return;
  }

  const lines = [
    "# Dual-Lane Companion Setup",
    "",
    `Workspace: ${report.workspaceRoot}`,
    `State file: ${report.stateFile}`,
    `Jobs dir: ${report.jobsDir}`,
    "",
    "Lanes:",
  ];

  for (const lane of report.lanes) {
    lines.push(`- ${lane.label} (${lane.lane})`);
    lines.push(`  Binary: ${lane.binary}`);
    lines.push(`  Watch: ${lane.watchScript}`);
    lines.push(`  Monitor: ${lane.monitorScript}`);
    lines.push(`  Session state: ${lane.monitor.state}`);
    lines.push(`  Detail: ${lane.monitor.detail}`);
  }

  process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
}

async function handleTask(args) {
  const lane = args.options.lane;
  if (!lane) {
    throw new Error("task requires --lane <codex|glm>.");
  }
  laneConfigOrThrow(lane);

  const inputPrompt = [args.positional.slice(1).join(" "), readStdinIfPiped()].filter(Boolean).join("\n").trim();
  if (!inputPrompt) {
    throw new Error("task requires prompt text.");
  }

  ensureLaneSession(lane);
  const sessionLogFile = latestLaneLogFile(lane);
  const logOffsetStart = sessionLogFile && fs.existsSync(sessionLogFile) ? fs.statSync(sessionLogFile).size : 0;

  const title = args.options.title || shorten(firstMeaningfulLine(inputPrompt), 72) || `${lane} task`;
  const jobId = generateJobId(lane);
  const createdAt = nowIso();

  const job = {
    id: jobId,
    lane,
    title,
    status: "running",
    phase: "starting",
    createdAt,
    startedAt: createdAt,
    updatedAt: createdAt,
    sessionLogFile,
    logOffsetStart,
    promptPreview: shorten(firstMeaningfulLine(inputPrompt), 160),
    summary: "Dispatched to lane runtime.",
    resultText: "",
    progressPreview: [],
  };

  writeJobFile(job);
  upsertJobSummary(job);

  const wrappedPrompt = buildTaskPrompt(job, inputPrompt);
  run(laneConfigOrThrow(lane).watchScript, ["send"], { input: wrappedPrompt });

  const payload = {
    jobId,
    lane,
    title,
    status: "running",
    statusCommand: `node scripts/dual-lane-companion.mjs status ${jobId}`,
    resultCommand: `node scripts/dual-lane-companion.mjs result ${jobId}`,
    cancelCommand: `node scripts/dual-lane-companion.mjs cancel ${jobId}`,
  };

  if (args.options.json) {
    renderJson(payload);
    return;
  }

  const lines = [
    `Dispatched ${lane.toUpperCase()} job ${jobId}.`,
    `Title: ${title}`,
    `Status: running`,
    "",
    `Status: ${payload.statusCommand}`,
    `Result: ${payload.resultCommand}`,
    `Cancel: ${payload.cancelCommand}`,
  ];
  process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
}

async function handleStatus(args) {
  const reference = args.positional[1] ?? null;
  const single = reference ? resolveJob(reference, { refresh: true }) : null;
  const jobs = single
    ? [single]
    : refreshAllJobs()
        .filter((job) => (args.options.lane ? job.lane === args.options.lane : true))
        .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)));
  const filtered = single ? [single] : args.options.all ? jobs : jobs.slice(0, 10);

  if (args.options.json) {
    renderJson(single ?? filtered.map(toLeanJob));
    return;
  }
  process.stdout.write(renderStatusReport(filtered, single));
}

async function handleRefresh(args) {
  const limit = Number.parseInt(String(args.options.limit ?? "8"), 10);
  const lane = args.options.lane ?? null;
  const state = loadState();
  const refreshed = state.jobs
    .filter((job) => (lane ? job.lane === lane : true))
    .sort((left, right) => String(right.createdAt).localeCompare(String(left.createdAt)))
    .slice(0, Number.isFinite(limit) && limit > 0 ? limit : 8)
    .map((summary) => tryReadJobFile(summary.id))
    .filter(Boolean)
    .map((job) => refreshJob(job));
  const lean = refreshed.map(toLeanJob);

  if (args.options.json) {
    renderJson(lean);
    return;
  }

  process.stdout.write(renderStatusReport(refreshed));
}

async function handleResult(args) {
  const job = resolveJob(args.positional[1] ?? null, { refresh: true });
  if (!job) {
    throw new Error("No jobs tracked yet.");
  }
  const payload = {
    id: job.id,
    lane: job.lane,
    title: job.title,
    status: job.status,
    phase: job.phase,
    summary: job.summary,
    resultText: job.resultText || readJobOutputSlice(job).trim(),
  };

  if (args.options.json) {
    renderJson(payload);
    return;
  }

  const lines = [
    `# ${payload.id}`,
    "",
    `Lane: ${payload.lane}`,
    `Title: ${payload.title}`,
    `Status: ${payload.status}`,
    payload.phase ? `Phase: ${payload.phase}` : "",
    payload.summary ? `Summary: ${payload.summary}` : "",
    "",
    payload.resultText || "No final result captured yet.",
  ].filter(Boolean);
  process.stdout.write(`${lines.join("\n").trimEnd()}\n`);
}

async function handleCancel(args) {
  const job = resolveJob(args.positional[1] ?? null, { refresh: true });
  if (!job) {
    throw new Error("No jobs tracked yet.");
  }
  const refreshed = job;
  if (["completed", "cancelled"].includes(refreshed.status)) {
    if (args.options.json) {
      renderJson(toLeanJob(refreshed));
      return;
    }
    process.stdout.write(`Job ${refreshed.id} is already ${refreshed.status}.\n`);
    return;
  }

  try {
    interruptLane(refreshed.lane);
  } catch {
    // best effort only
  }

  const cancelledAt = nowIso();
  const cancelled = {
    ...refreshed,
    status: "cancelled",
    phase: "cancelled",
    completedAt: cancelledAt,
    summary: refreshed.summary || "Cancelled by operator.",
  };
  writeJobFile(cancelled);
  upsertJobSummary({
    id: cancelled.id,
    lane: cancelled.lane,
    title: cancelled.title,
    status: cancelled.status,
    phase: cancelled.phase,
    summary: cancelled.summary,
    completedAt: cancelled.completedAt,
  });

  if (args.options.json) {
    renderJson(toLeanJob(cancelled));
    return;
  }
  process.stdout.write(`Cancelled ${cancelled.id} on lane ${cancelled.lane}.\n`);
}

async function main() {
  const args = parseArgs(process.argv.slice(2));
  const command = args.positional[0];

  switch (command) {
    case "setup":
      await handleSetup(args);
      return;
    case "task":
      await handleTask(args);
      return;
    case "refresh":
      await handleRefresh(args);
      return;
    case "status":
      await handleStatus(args);
      return;
    case "result":
      await handleResult(args);
      return;
    case "cancel":
      await handleCancel(args);
      return;
    case "help":
    case "--help":
    case "-h":
    case undefined:
      usage();
      return;
    default:
      throw new Error(`Unknown command "${command}".`);
  }
}

if (process.argv[1] && path.resolve(process.argv[1]) === __filename) {
  main().catch((error) => {
    process.stderr.write(`${error instanceof Error ? error.message : String(error)}\n`);
    process.exit(1);
  });
}

export {
  inferQueueDocumentCompletion,
  inferRecoveredCompletion,
  inferRestartedSessionState,
  inferTerminalTimestampWithoutMarker,
  inferAgentIdlePromptState,
  inferInterruptedState,
  buildTaskPrompt,
  hasLiveJobProgress,
  isShellCommand,
  normalizeLogLine,
  parseQueueTaskStatusFromText,
  preserveTerminalJobState,
  shouldRefreshJobInList,
  toLeanJob,
}
