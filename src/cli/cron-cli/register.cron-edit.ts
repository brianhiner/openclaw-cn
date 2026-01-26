import type { Command } from "commander";
import { danger } from "../../globals.js";
import { defaultRuntime } from "../../runtime.js";
import { sanitizeAgentId } from "../../routing/session-key.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import {
  getCronChannelOptions,
  parseAtMs,
  parseDurationMs,
  warnIfCronSchedulerDisabled,
} from "./shared.js";

const assignIf = (
  target: Record<string, unknown>,
  key: string,
  value: unknown,
  shouldAssign: boolean,
) => {
  if (shouldAssign) target[key] = value;
};

export function registerCronEditCommand(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("edit")
      .description("编辑定时任务（补丁字段）")
      .argument("<id>", "任务 ID")
      .option("--name <name>", "设置名称")
      .option("--description <text>", "设置描述")
      .option("--enable", "启用任务", false)
      .option("--disable", "禁用任务", false)
      .option("--delete-after-run", "一次性任务成功后删除", false)
      .option("--keep-after-run", "一次性任务成功后保留", false)
      .option("--session <target>", "会话目标（main|isolated）")
      .option("--agent <id>", "设置智能体 ID")
      .option("--clear-agent", "取消设置智能体并使用默认", false)
      .option("--wake <mode>", "唤醒模式（now|next-heartbeat）")
      .option("--at <when>", "设置一次性时间（ISO）或时长如 20m")
      .option("--every <duration>", "设置间隔时长如 10m")
      .option("--cron <expr>", "设置 Cron 表达式")
      .option("--tz <iana>", "Cron 表达式的时区（IANA）")
      .option("--system-event <text>", "设置 systemEvent 负载")
      .option("--message <text>", "设置 agentTurn 负载消息")
      .option("--thinking <level>", "智能体任务的思考级别")
      .option("--model <model>", "智能体任务的模型覆盖")
      .option("--timeout-seconds <n>", "智能体任务的超时秒数")
      .option("--deliver", "交付智能体输出（使用 last-route 交付且无 --to 时必需）")
      .option("--no-deliver", "禁用交付")
      .option("--channel <channel>", `交付渠道（${getCronChannelOptions()}）`)
      .option("--to <dest>", "交付目的地（E.164、Telegram chatId 或 Discord 频道/用户）")
      .option("--best-effort-deliver", "交付失败时不使任务失败")
      .option("--no-best-effort-deliver", "交付失败时任务失败")
      .option("--post-prefix <prefix>", "摘要系统事件的前缀")
      .action(async (id, opts) => {
        try {
          if (opts.session === "main" && opts.message) {
            throw new Error(
              "Main jobs cannot use --message; use --system-event or --session isolated.",
            );
          }
          if (opts.session === "isolated" && opts.systemEvent) {
            throw new Error(
              "Isolated jobs cannot use --system-event; use --message or --session main.",
            );
          }
          if (opts.session === "main" && typeof opts.postPrefix === "string") {
            throw new Error("--post-prefix only applies to isolated jobs.");
          }

          const patch: Record<string, unknown> = {};
          if (typeof opts.name === "string") patch.name = opts.name;
          if (typeof opts.description === "string") patch.description = opts.description;
          if (opts.enable && opts.disable)
            throw new Error("Choose --enable or --disable, not both");
          if (opts.enable) patch.enabled = true;
          if (opts.disable) patch.enabled = false;
          if (opts.deleteAfterRun && opts.keepAfterRun) {
            throw new Error("Choose --delete-after-run or --keep-after-run, not both");
          }
          if (opts.deleteAfterRun) patch.deleteAfterRun = true;
          if (opts.keepAfterRun) patch.deleteAfterRun = false;
          if (typeof opts.session === "string") patch.sessionTarget = opts.session;
          if (typeof opts.wake === "string") patch.wakeMode = opts.wake;
          if (opts.agent && opts.clearAgent) {
            throw new Error("Use --agent or --clear-agent, not both");
          }
          if (typeof opts.agent === "string" && opts.agent.trim()) {
            patch.agentId = sanitizeAgentId(opts.agent.trim());
          }
          if (opts.clearAgent) {
            patch.agentId = null;
          }

          const scheduleChosen = [opts.at, opts.every, opts.cron].filter(Boolean).length;
          if (scheduleChosen > 1) throw new Error("Choose at most one schedule change");
          if (opts.at) {
            const atMs = parseAtMs(String(opts.at));
            if (!atMs) throw new Error("Invalid --at");
            patch.schedule = { kind: "at", atMs };
          } else if (opts.every) {
            const everyMs = parseDurationMs(String(opts.every));
            if (!everyMs) throw new Error("Invalid --every");
            patch.schedule = { kind: "every", everyMs };
          } else if (opts.cron) {
            patch.schedule = {
              kind: "cron",
              expr: String(opts.cron),
              tz: typeof opts.tz === "string" && opts.tz.trim() ? opts.tz.trim() : undefined,
            };
          }

          const hasSystemEventPatch = typeof opts.systemEvent === "string";
          const model =
            typeof opts.model === "string" && opts.model.trim() ? opts.model.trim() : undefined;
          const thinking =
            typeof opts.thinking === "string" && opts.thinking.trim()
              ? opts.thinking.trim()
              : undefined;
          const timeoutSeconds = opts.timeoutSeconds
            ? Number.parseInt(String(opts.timeoutSeconds), 10)
            : undefined;
          const hasTimeoutSeconds = Boolean(timeoutSeconds && Number.isFinite(timeoutSeconds));
          const hasAgentTurnPatch =
            typeof opts.message === "string" ||
            Boolean(model) ||
            Boolean(thinking) ||
            hasTimeoutSeconds ||
            typeof opts.deliver === "boolean" ||
            typeof opts.channel === "string" ||
            typeof opts.to === "string" ||
            typeof opts.bestEffortDeliver === "boolean";
          if (hasSystemEventPatch && hasAgentTurnPatch) {
            throw new Error("Choose at most one payload change");
          }
          if (hasSystemEventPatch) {
            patch.payload = {
              kind: "systemEvent",
              text: String(opts.systemEvent),
            };
          } else if (hasAgentTurnPatch) {
            const payload: Record<string, unknown> = { kind: "agentTurn" };
            assignIf(payload, "message", String(opts.message), typeof opts.message === "string");
            assignIf(payload, "model", model, Boolean(model));
            assignIf(payload, "thinking", thinking, Boolean(thinking));
            assignIf(payload, "timeoutSeconds", timeoutSeconds, hasTimeoutSeconds);
            assignIf(payload, "deliver", opts.deliver, typeof opts.deliver === "boolean");
            assignIf(payload, "channel", opts.channel, typeof opts.channel === "string");
            assignIf(payload, "to", opts.to, typeof opts.to === "string");
            assignIf(
              payload,
              "bestEffortDeliver",
              opts.bestEffortDeliver,
              typeof opts.bestEffortDeliver === "boolean",
            );
            patch.payload = payload;
          }

          if (typeof opts.postPrefix === "string") {
            patch.isolation = {
              postToMainPrefix: opts.postPrefix.trim() ? opts.postPrefix : "Cron",
            };
          }

          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch,
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}
