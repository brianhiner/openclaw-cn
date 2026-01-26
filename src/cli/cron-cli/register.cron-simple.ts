import type { Command } from "commander";
import { danger } from "../../globals.js";
import { defaultRuntime } from "../../runtime.js";
import { addGatewayClientOptions, callGatewayFromCli } from "../gateway-rpc.js";
import { warnIfCronSchedulerDisabled } from "./shared.js";

export function registerCronSimpleCommands(cron: Command) {
  addGatewayClientOptions(
    cron
      .command("rm")
      .alias("remove")
      .alias("delete")
      .description("删除定时任务")
      .argument("<id>", "任务 ID")
      .option("--json", "输出 JSON", false)
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.remove", opts, { id });
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("enable")
      .description("启用定时任务")
      .argument("<id>", "任务 ID")
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch: { enabled: true },
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("disable")
      .description("禁用定时任务")
      .argument("<id>", "任务 ID")
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.update", opts, {
            id,
            patch: { enabled: false },
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
          await warnIfCronSchedulerDisabled(opts);
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("runs")
      .description("显示定时任务运行历史（JSONL 支持）")
      .requiredOption("--id <id>", "任务 ID")
      .option("--limit <n>", "最大条目数（默认 50）", "50")
      .action(async (opts) => {
        try {
          const limitRaw = Number.parseInt(String(opts.limit ?? "50"), 10);
          const limit = Number.isFinite(limitRaw) && limitRaw > 0 ? limitRaw : 50;
          const id = String(opts.id);
          const res = await callGatewayFromCli("cron.runs", opts, {
            id,
            limit,
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );

  addGatewayClientOptions(
    cron
      .command("run")
      .description("立即运行定时任务（调试）")
      .argument("<id>", "任务 ID")
      .option("--force", "即使未到期也运行", false)
      .action(async (id, opts) => {
        try {
          const res = await callGatewayFromCli("cron.run", opts, {
            id,
            mode: opts.force ? "force" : "due",
          });
          defaultRuntime.log(JSON.stringify(res, null, 2));
        } catch (err) {
          defaultRuntime.error(danger(String(err)));
          defaultRuntime.exit(1);
        }
      }),
  );
}
