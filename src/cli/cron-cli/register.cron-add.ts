import type { Command } from "commander";
import type { CronJob } from "../../cron/types.js";
import { danger } from "../../globals.js";
import { defaultRuntime } from "../../runtime.js";
import { sanitizeAgentId } from "../../routing/session-key.js";
import type { GatewayRpcOpts } from "../gateway-rpc.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import { parsePositiveIntOrUndefined } from "../program/helpers.js";
import {
  getCronChannelOptions,
  parseAtMs,
  parseDurationMs,
  printCronList,
  warnIfCronSchedulerDisabled,
} from "./shared.js";

export function registerCronStatusCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("status")
      .description("显示定时调度器状态")
      .option("--json", "输出 JSON", false)
      .action(async (opts) => {
        try {
          const res = await callGatewayFromCli("cron.status", opts, {});
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}

export function registerCronListCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("list")
      .description("列出定时任务")
      .option("--all", "包含已禁用的任务", false)
      .option("--json", "输出 JSON", false)
      .action(async (opts) => {
        try {
          const res = await callGatewayFromCli("cron.list", opts, {
            includeDisabled: Boolean(opts.all),
          });
          if (opts.json) {
            defaultRuntime.log(JSON.stringify(res, null, 2));
            return;
          }
          const jobs = (res as { jobs?: CronJob[] } | null)?.jobs ?? [];
          printCronList(jobs, defaultRuntime);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}

export function registerCronAddCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("add")
      .alias("create")
      .description("添加定时任务")
      .requiredOption("--name <name>", "任务名称")
      .option("--description <text>", "可选描述")
      .option("--disabled", "创建时禁用任务", false)
      .option("--delete-after-run", "一次性任务成功后删除", false)
      .option("--agent <id>", "此任务的智能体 ID")
      .option("--session <target>", "会话目标（main|隔离isolated）", "main")
      .option("--wake <mode>", "唤醒模式（now|next-heartbeat）", "next-heartbeat")
      .option("--at <when>", "在指定时间运行一次（ISO）或 +时长（例如 20m）")
      .option("--every <duration>", "每隔指定时长运行（例如 10m, 1h）")
      .option("--cron <expr>", "Cron 表达式（5 字段）")
      .option("--tz <iana>", "Cron 表达式的时区（IANA）", "")
      .option("--system-event <text>", "系统事件负载（主会话）")
      .option("--message <text>", "智能体消息负载")
      .option("--thinking <level>", "智能体任务的思考级别（off|minimal|low|medium|high）")
      .option("--model <model>", "智能体任务的模型覆盖（提供商/模型或别名）")
      .option("--timeout-seconds <n>", "智能体任务的超时秒数")
      .option("--deliver", "交付智能体输出（使用 last-route 交付且无 --to 时必需）", false)
      .option("--channel <channel>", `交付渠道（${getCronChannelOptions()}）`, "last")
      .option("--to <dest>", "交付目的地（E.164、Telegram chatId 或 Discord 频道/用户）")
      .option("--best-effort-deliver", "交付失败时不使任务失败", false)
      .option("--post-prefix <prefix>", "主会话发布的前缀", "Cron")
      .option("--post-mode <mode>", "隔离任务发布到主会话的内容（summary|full）", "summary")
      .option("--post-max-chars <n>", "--post-mode=full 时的最大字符数（默认 8000）", "8000")
      .option("--json", "输出 JSON", false)
      .action(async (opts: GatewayRpcOpts & Record<string, unknown>) => {
        try {
          const schedule = (() => {
            const at = typeof opts.at === "string" ? opts.at : "";
            const every = typeof opts.every === "string" ? opts.every : "";
            const cronExpr = typeof opts.cron === "string" ? opts.cron : "";
            const chosen = [Boolean(at), Boolean(every), Boolean(cronExpr)].filter(Boolean).length;
            if (chosen !== 1) {
              throw new Error("Choose exactly one schedule: --at, --every, or --cron");
            }
            if (at) {
              const atMs = parseAtMs(at);
              if (!atMs) throw new Error("Invalid --at; use ISO time or duration like 20m");
              return { kind: "at" as const, atMs };
            }
            if (every) {
              const everyMs = parseDurationMs(every);
              if (!everyMs) throw new Error("Invalid --every; use e.g. 10m, 1h, 1d");
              return { kind: "every" as const, everyMs };
            }
            return {
              kind: "cron" as const,
              expr: cronExpr,
              tz: typeof opts.tz === "string" && opts.tz.trim() ? opts.tz.trim() : undefined,
            };
          })();

          const sessionTargetRaw = typeof opts.session === "string" ? opts.session : "main";
          const sessionTarget = sessionTargetRaw.trim() || "main";
          if (sessionTarget !== "main" && sessionTarget !== "isolated") {
            throw new Error("--session must be main or isolated");
          }

          const wakeModeRaw = typeof opts.wake === "string" ? opts.wake : "next-heartbeat";
          const wakeMode = wakeModeRaw.trim() || "next-heartbeat";
          if (wakeMode !== "now" && wakeMode !== "next-heartbeat") {
            throw new Error("--wake must be now or next-heartbeat");
          }

          const agentId =
            typeof opts.agent === "string" && opts.agent.trim()
              ? sanitizeAgentId(opts.agent.trim())
              : undefined;

          const payload = (() => {
            const systemEvent = typeof opts.systemEvent === "string" ? opts.systemEvent.trim() : "";
            const message = typeof opts.message === "string" ? opts.message.trim() : "";
            const chosen = [Boolean(systemEvent), Boolean(message)].filter(Boolean).length;
            if (chosen !== 1) {
              throw new Error("Choose exactly one payload: --system-event or --message");
            }
            if (systemEvent) return { kind: "systemEvent" as const, text: systemEvent };
            const timeoutSeconds = parsePositiveIntOrUndefined(opts.timeoutSeconds);
            return {
              kind: "agentTurn" as const,
              message,
              model:
                typeof opts.model === "string" && opts.model.trim() ? opts.model.trim() : undefined,
              thinking:
                typeof opts.thinking === "string" && opts.thinking.trim()
                  ? opts.thinking.trim()
                  : undefined,
              timeoutSeconds:
                timeoutSeconds && Number.isFinite(timeoutSeconds) ? timeoutSeconds : undefined,
              deliver: opts.deliver ? true : undefined,
              channel: typeof opts.channel === "string" ? opts.channel : "last",
              to: typeof opts.to === "string" && opts.to.trim() ? opts.to.trim() : undefined,
              bestEffortDeliver: opts.bestEffortDeliver ? true : undefined,
            };
          })();

          if (sessionTarget === "main" && payload.kind !== "systemEvent") {
            throw new Error("Main jobs require --system-event (systemEvent).");
          }
          if (sessionTarget === "isolated" && payload.kind !== "agentTurn") {
            throw new Error("Isolated jobs require --message (agentTurn).");
          }

          const isolation =
            sessionTarget === "isolated"
              ? {
                  postToMainPrefix:
                    typeof opts.postPrefix === "string" && opts.postPrefix.trim()
                      ? opts.postPrefix.trim()
                      : "Cron",
                  postToMainMode:
                    opts.postMode === "full" || opts.postMode === "summary"
                      ? opts.postMode
                      : undefined,
                  postToMainMaxChars:
                    typeof opts.postMaxChars === "string" && /^\d+$/.test(opts.postMaxChars)
                      ? Number.parseInt(opts.postMaxChars, 10)
                      : undefined,
                }
              : undefined;

          const nameRaw = typeof opts.name === "string" ? opts.name : "";
          const name = nameRaw.trim();
          if (!name) throw new Error("--name is required");

          const description =
            typeof opts.description === "string" && opts.description.trim()
              ? opts.description.trim()
              : undefined;

          const params = {
            name,
            description,
            enabled: !opts.disabled,
            deleteAfterRun: Boolean(opts.deleteAfterRun),
            agentId,
            schedule,
            sessionTarget,
            wakeMode,
            payload,
            isolation,
          };

          const res = await callGatewayFromCli("cron.add", opts, params);
          defaultRuntime.log(JSON.stringify(res, null, 2));
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}
