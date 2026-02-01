import fs from "node:fs";
import path from "node:path";
import { resolveAgentWorkspaceDir, resolveDefaultAgentId } from "../../agents/agent-scope.js";
import type { ChannelPluginCatalogEntry } from "../../channels/plugins/catalog.js";
import type { ClawdbotConfig } from "../../config/config.js";
import { createSubsystemLogger } from "../../logging/subsystem.js";
import { recordPluginInstall } from "../../plugins/installs.js";
import { enablePluginInConfig } from "../../plugins/enable.js";
import { loadClawdbotPlugins } from "../../plugins/loader.js";
import { installPluginFromNpmSpec } from "../../plugins/install.js";
import { resolveBundledPluginsDir } from "../../plugins/bundled-dir.js";
import type { RuntimeEnv } from "../../runtime.js";
import type { WizardPrompter } from "../../wizard/prompts.js";

type InstallChoice = "npm" | "local" | "skip";

type InstallResult = {
  cfg: ClawdbotConfig;
  installed: boolean;
};

function hasGitWorkspace(workspaceDir?: string): boolean {
  const candidates = new Set<string>();
  candidates.add(path.join(process.cwd(), ".git"));
  if (workspaceDir && workspaceDir !== process.cwd()) {
    candidates.add(path.join(workspaceDir, ".git"));
  }
  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return true;
  }
  return false;
}

function resolveLocalPath(
  entry: ChannelPluginCatalogEntry,
  workspaceDir: string | undefined,
  allowLocal: boolean,
): string | null {
  const raw = entry.install.localPath?.trim();
  if (!raw) return null;
  const candidates = new Set<string>();

  // 1. Check bundled plugins (always allowed)
  const bundledDir = resolveBundledPluginsDir();
  if (bundledDir) {
    // raw is like "extensions/feishu", bundledDir is ".../extensions"
    // So we resolve from bundledDir's parent.
    candidates.add(path.resolve(bundledDir, "..", raw));
  }

  // 2. Check local workspace (if allowed)
  if (allowLocal) {
    candidates.add(path.resolve(process.cwd(), raw));
    if (workspaceDir && workspaceDir !== process.cwd()) {
      candidates.add(path.resolve(workspaceDir, raw));
    }
  }

  for (const candidate of candidates) {
    if (fs.existsSync(candidate)) return candidate;
  }
  return null;
}

function addPluginLoadPath(cfg: ClawdbotConfig, pluginPath: string): ClawdbotConfig {
  const existing = cfg.plugins?.load?.paths ?? [];
  const merged = Array.from(new Set([...existing, pluginPath]));
  return {
    ...cfg,
    plugins: {
      ...cfg.plugins,
      load: {
        ...cfg.plugins?.load,
        paths: merged,
      },
    },
  };
}

async function promptInstallChoice(params: {
  entry: ChannelPluginCatalogEntry;
  localPath?: string | null;
  defaultChoice: InstallChoice;
  prompter: WizardPrompter;
}): Promise<InstallChoice> {
  const { entry, localPath, prompter, defaultChoice } = params;
  const localOptions: Array<{ value: InstallChoice; label: string; hint?: string }> = localPath
    ? [
        {
          value: "local",
          label: "使用本地插件路径",
          hint: localPath,
        },
      ]
    : [];
  const options: Array<{ value: InstallChoice; label: string; hint?: string }> = [
    { value: "npm", label: `从 npm 下载 (${entry.install.npmSpec})` },
    ...localOptions,
    { value: "skip", label: "暂时跳过" },
  ];
  const initialValue: InstallChoice =
    defaultChoice === "local" && !localPath ? "npm" : defaultChoice;
  return await prompter.select<InstallChoice>({
    message: `安装 ${entry.meta.label} 插件?`,
    options,
    initialValue,
  });
}

function resolveInstallDefaultChoice(params: {
  cfg: ClawdbotConfig;
  entry: ChannelPluginCatalogEntry;
  localPath?: string | null;
}): InstallChoice {
  const { cfg, entry, localPath } = params;
  const updateChannel = cfg.update?.channel;
  if (updateChannel === "dev") {
    return localPath ? "local" : "npm";
  }
  if (updateChannel === "stable" || updateChannel === "beta") {
    return "npm";
  }
  const entryDefault = entry.install.defaultChoice;
  if (entryDefault === "local") return localPath ? "local" : "npm";
  if (entryDefault === "npm") return "npm";
  return localPath ? "local" : "npm";
}

export async function ensureOnboardingPluginInstalled(params: {
  cfg: ClawdbotConfig;
  entry: ChannelPluginCatalogEntry;
  prompter: WizardPrompter;
  runtime: RuntimeEnv;
  workspaceDir?: string;
}): Promise<InstallResult> {
  const { entry, prompter, runtime, workspaceDir } = params;
  let next = params.cfg;
  const allowLocal = hasGitWorkspace(workspaceDir);
  const localPath = resolveLocalPath(entry, workspaceDir, allowLocal);
  const defaultChoice = resolveInstallDefaultChoice({
    cfg: next,
    entry,
    localPath,
  });
  const choice = await promptInstallChoice({
    entry,
    localPath,
    defaultChoice,
    prompter,
  });

  if (choice === "skip") {
    return { cfg: next, installed: false };
  }

  if (choice === "local" && localPath) {
    next = addPluginLoadPath(next, localPath);
    next = enablePluginInConfig(next, entry.id).config;
    // We must write the config file here so that re-loading works if it reads from disk,
    // although reloadOnboardingPluginRegistry takes cfg object.
    // However, loadClawdbotPlugins might rely on some disk state or the cfg object passed is enough.
    // But let's verify if `loadClawdbotPlugins` properly uses the passed config for paths.
    // Yes it does: loadClawdbotPlugins({ config: params.cfg ... })

    // BUT: resolveLocalPath returns an absolute path in 'candidate'.
    // addPluginLoadPath adds it to cfg.plugins.load.paths.

    return { cfg: next, installed: true };
  }

  const result = await installPluginFromNpmSpec({
    spec: entry.install.npmSpec,
    logger: {
      info: (msg) => runtime.log?.(msg),
      warn: (msg) => runtime.log?.(msg),
    },
  });

  if (result.ok) {
    next = enablePluginInConfig(next, result.pluginId).config;
    next = recordPluginInstall(next, {
      pluginId: result.pluginId,
      source: "npm",
      spec: entry.install.npmSpec,
      installPath: result.targetDir,
      version: result.version,
    });
    return { cfg: next, installed: true };
  }

  await prompter.note(`安装 ${entry.install.npmSpec} 失败: ${result.error}`, "插件安装");

  if (localPath) {
    const fallback = await prompter.confirm({
      message: `改用本地插件路径？(${localPath})`,
      initialValue: true,
    });
    if (fallback) {
      next = addPluginLoadPath(next, localPath);
      next = enablePluginInConfig(next, entry.id).config;
      return { cfg: next, installed: true };
    }
  }

  runtime.error?.(`插件安装失败: ${result.error}`);
  return { cfg: next, installed: false };
}

export function reloadOnboardingPluginRegistry(params: {
  cfg: ClawdbotConfig;
  runtime: RuntimeEnv;
  workspaceDir?: string;
}): void {
  const workspaceDir =
    params.workspaceDir ?? resolveAgentWorkspaceDir(params.cfg, resolveDefaultAgentId(params.cfg));
  const log = createSubsystemLogger("plugins");
  loadClawdbotPlugins({
    config: params.cfg,
    workspaceDir,
    cache: false,
    logger: {
      info: (msg) => log.info(msg),
      warn: (msg) => log.warn(msg),
      error: (msg) => log.error(msg),
      debug: (msg) => log.debug(msg),
    },
  });
}
