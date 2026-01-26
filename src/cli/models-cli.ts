import type { Command } from "commander";

import {
  githubCopilotLoginCommand,
  modelsAliasesAddCommand,
  modelsAliasesListCommand,
  modelsAliasesRemoveCommand,
  modelsAuthAddCommand,
  modelsAuthLoginCommand,
  modelsAuthOrderClearCommand,
  modelsAuthOrderGetCommand,
  modelsAuthOrderSetCommand,
  modelsAuthPasteTokenCommand,
  modelsAuthSetupTokenCommand,
  modelsFallbacksAddCommand,
  modelsFallbacksClearCommand,
  modelsFallbacksListCommand,
  modelsFallbacksRemoveCommand,
  modelsImageFallbacksAddCommand,
  modelsImageFallbacksClearCommand,
  modelsImageFallbacksListCommand,
  modelsImageFallbacksRemoveCommand,
  modelsListCommand,
  modelsScanCommand,
  modelsSetCommand,
  modelsSetImageCommand,
  modelsStatusCommand,
} from "../commands/models.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { runCommandWithRuntime } from "./cli-utils.js";

function runModelsCommand(action: () => Promise<void>) {
  return runCommandWithRuntime(defaultRuntime, action);
}

export function registerModelsCli(program: Command) {
  const models = program
    .command("models")
    .description("模型发现、扫描和配置")
    .option("--status-json", "输出 JSON（`models status --json` 的别名）", false)
    .option("--status-plain", "纯文本输出（`models status --plain` 的别名）", false)
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("文档：")} ${formatDocsLink("/cli/models", "docs.clawd.bot/cli/models")}\n`,
    );

  models
    .command("list")
    .description("列出模型（默认显示已配置的）")
    .option("--all", "显示完整模型目录", false)
    .option("--local", "筛选本地模型", false)
    .option("--provider <name>", "按提供商筛选")
    .option("--json", "输出 JSON", false)
    .option("--plain", "纯文本输出", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsListCommand(opts, defaultRuntime);
      });
    });

  models
    .command("status")
    .description("显示已配置的模型状态")
    .option("--json", "输出 JSON", false)
    .option("--plain", "纯文本输出", false)
    .option("--check", "如果认证即将/已过期则退出非零（1=过期/缺失，2=即将过期）", false)
    .option("--probe", "探测已配置的提供商认证（实时）", false)
    .option("--probe-provider <name>", "仅探测单个提供商")
    .option(
      "--probe-profile <id>",
      "仅探测特定的认证配置文件 ID（可重复或逗号分隔）",
      (value, previous) => {
        const next = Array.isArray(previous) ? previous : previous ? [previous] : [];
        next.push(value);
        return next;
      },
    )
    .option("--probe-timeout <ms>", "每次探测超时（毫秒）")
    .option("--probe-concurrency <n>", "并发探测数")
    .option("--probe-max-tokens <n>", "探测最大 token 数（尽力而为）")
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsStatusCommand(
          {
            json: Boolean(opts.json),
            plain: Boolean(opts.plain),
            check: Boolean(opts.check),
            probe: Boolean(opts.probe),
            probeProvider: opts.probeProvider as string | undefined,
            probeProfile: opts.probeProfile as string | string[] | undefined,
            probeTimeout: opts.probeTimeout as string | undefined,
            probeConcurrency: opts.probeConcurrency as string | undefined,
            probeMaxTokens: opts.probeMaxTokens as string | undefined,
          },
          defaultRuntime,
        );
      });
    });

  models
    .command("set")
    .description("设置默认模型")
    .argument("<model>", "模型 ID 或别名")
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsSetCommand(model, defaultRuntime);
      });
    });

  models
    .command("set-image")
    .description("设置图像模型")
    .argument("<model>", "模型 ID 或别名")
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsSetImageCommand(model, defaultRuntime);
      });
    });

  const aliases = models.command("aliases").description("管理模型别名");

  aliases
    .command("list")
    .description("列出模型别名")
    .option("--json", "输出 JSON", false)
    .option("--plain", "纯文本输出", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAliasesListCommand(opts, defaultRuntime);
      });
    });

  aliases
    .command("add")
    .description("添加或更新模型别名")
    .argument("<alias>", "别名")
    .argument("<model>", "模型 ID 或别名")
    .action(async (alias: string, model: string) => {
      await runModelsCommand(async () => {
        await modelsAliasesAddCommand(alias, model, defaultRuntime);
      });
    });

  aliases
    .command("remove")
    .description("删除模型别名")
    .argument("<alias>", "别名")
    .action(async (alias: string) => {
      await runModelsCommand(async () => {
        await modelsAliasesRemoveCommand(alias, defaultRuntime);
      });
    });

  const fallbacks = models.command("fallbacks").description("管理模型备选列表");

  fallbacks
    .command("list")
    .description("列出备选模型")
    .option("--json", "输出 JSON", false)
    .option("--plain", "纯文本输出", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsFallbacksListCommand(opts, defaultRuntime);
      });
    });

  fallbacks
    .command("add")
    .description("添加备选模型")
    .argument("<model>", "模型 ID 或别名")
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsFallbacksAddCommand(model, defaultRuntime);
      });
    });

  fallbacks
    .command("remove")
    .description("删除备选模型")
    .argument("<model>", "模型 ID 或别名")
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsFallbacksRemoveCommand(model, defaultRuntime);
      });
    });

  fallbacks
    .command("clear")
    .description("清除所有备选模型")
    .action(async () => {
      await runModelsCommand(async () => {
        await modelsFallbacksClearCommand(defaultRuntime);
      });
    });

  const imageFallbacks = models.command("image-fallbacks").description("管理图像模型备选列表");

  imageFallbacks
    .command("list")
    .description("列出图像备选模型")
    .option("--json", "输出 JSON", false)
    .option("--plain", "纯文本输出", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksListCommand(opts, defaultRuntime);
      });
    });

  imageFallbacks
    .command("add")
    .description("添加图像备选模型")
    .argument("<model>", "模型 ID 或别名")
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksAddCommand(model, defaultRuntime);
      });
    });

  imageFallbacks
    .command("remove")
    .description("删除图像备选模型")
    .argument("<model>", "模型 ID 或别名")
    .action(async (model: string) => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksRemoveCommand(model, defaultRuntime);
      });
    });

  imageFallbacks
    .command("clear")
    .description("清除所有图像备选模型")
    .action(async () => {
      await runModelsCommand(async () => {
        await modelsImageFallbacksClearCommand(defaultRuntime);
      });
    });

  models
    .command("scan")
    .description("扫描 OpenRouter 免费模型的工具 + 图像支持")
    .option("--min-params <b>", "最小参数量（十亿）")
    .option("--max-age-days <days>", "跳过超过 N 天的模型")
    .option("--provider <name>", "按提供商前缀筛选")
    .option("--max-candidates <n>", "最大备选数量", "6")
    .option("--timeout <ms>", "每次探测超时（毫秒）")
    .option("--concurrency <n>", "探测并发数")
    .option("--no-probe", "跳过实时探测；仅列出免费候选")
    .option("--yes", "不提示直接接受默认值", false)
    .option("--no-input", "禁用提示（使用默认值）")
    .option("--set-default", "将 agents.defaults.model 设为第一个选择", false)
    .option("--set-image", "将 agents.defaults.imageModel 设为第一个图像选择", false)
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsScanCommand(opts, defaultRuntime);
      });
    });

  models.action(async (opts) => {
    await runModelsCommand(async () => {
      await modelsStatusCommand(
        {
          json: Boolean(opts?.statusJson),
          plain: Boolean(opts?.statusPlain),
        },
        defaultRuntime,
      );
    });
  });

  const auth = models.command("auth").description("管理模型认证配置文件");

  auth
    .command("add")
    .description("交互式认证工具（setup-token 或粘贴令牌）")
    .action(async () => {
      await runModelsCommand(async () => {
        await modelsAuthAddCommand({}, defaultRuntime);
      });
    });

  auth
    .command("login")
    .description("运行提供商插件认证流程（OAuth/API 密钥）")
    .option("--provider <id>", "插件注册的提供商 ID")
    .option("--method <id>", "提供商认证方法 ID")
    .option("--set-default", "应用提供商的默认模型推荐", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthLoginCommand(
          {
            provider: opts.provider as string | undefined,
            method: opts.method as string | undefined,
            setDefault: Boolean(opts.setDefault),
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("setup-token")
    .description("运行提供商 CLI 创建/同步令牌（需要 TTY）")
    .option("--provider <name>", "提供商 ID（默认：anthropic）")
    .option("--yes", "跳过确认", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthSetupTokenCommand(
          {
            provider: opts.provider as string | undefined,
            yes: Boolean(opts.yes),
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("paste-token")
    .description("将令牌粘贴到 auth-profiles.json 并更新配置")
    .requiredOption("--provider <name>", "提供商 ID（例如 anthropic）")
    .option("--profile-id <id>", "认证配置文件 ID（默认：<provider>:manual）")
    .option("--expires-in <duration>", "可选过期时间（例如 365d, 12h）。存储为绝对 expiresAt。")
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthPasteTokenCommand(
          {
            provider: opts.provider as string | undefined,
            profileId: opts.profileId as string | undefined,
            expiresIn: opts.expiresIn as string | undefined,
          },
          defaultRuntime,
        );
      });
    });

  auth
    .command("login-github-copilot")
    .description("通过 GitHub 设备流程登录 GitHub Copilot（需要 TTY）")
    .option("--profile-id <id>", "认证配置文件 ID（默认：github-copilot:github）")
    .option("--yes", "不提示直接覆盖现有配置文件", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await githubCopilotLoginCommand(
          {
            profileId: opts.profileId as string | undefined,
            yes: Boolean(opts.yes),
          },
          defaultRuntime,
        );
      });
    });

  const order = auth.command("order").description("管理每个智能体的认证配置文件顺序覆盖");

  order
    .command("get")
    .description("显示每个智能体的认证顺序覆盖（来自 auth-profiles.json）")
    .requiredOption("--provider <name>", "提供商 ID（例如 anthropic）")
    .option("--agent <id>", "智能体 ID（默认：已配置的默认智能体）")
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthOrderGetCommand(
          {
            provider: opts.provider as string,
            agent: opts.agent as string | undefined,
            json: Boolean(opts.json),
          },
          defaultRuntime,
        );
      });
    });

  order
    .command("set")
    .description("设置每个智能体的认证顺序覆盖（锁定轮换到此列表）")
    .requiredOption("--provider <name>", "提供商 ID（例如 anthropic）")
    .option("--agent <id>", "智能体 ID（默认：已配置的默认智能体）")
    .argument("<profileIds...>", "认证配置文件 ID（例如 anthropic:claude-cli）")
    .action(async (profileIds: string[], opts) => {
      await runModelsCommand(async () => {
        await modelsAuthOrderSetCommand(
          {
            provider: opts.provider as string,
            agent: opts.agent as string | undefined,
            order: profileIds,
          },
          defaultRuntime,
        );
      });
    });

  order
    .command("clear")
    .description("清除每个智能体的认证顺序覆盖（回退到配置/轮换）")
    .requiredOption("--provider <name>", "提供商 ID（例如 anthropic）")
    .option("--agent <id>", "智能体 ID（默认：已配置的默认智能体）")
    .action(async (opts) => {
      await runModelsCommand(async () => {
        await modelsAuthOrderClearCommand(
          {
            provider: opts.provider as string,
            agent: opts.agent as string | undefined,
          },
          defaultRuntime,
        );
      });
    });
}
