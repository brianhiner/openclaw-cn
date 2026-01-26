import type { Command } from "commander";
import { formatDocsLink } from "../../terminal/links.js";
import { theme } from "../../terminal/theme.js";
import { createDefaultDeps } from "../deps.js";
import {
  runDaemonInstall,
  runDaemonRestart,
  runDaemonStart,
  runDaemonStatus,
  runDaemonStop,
  runDaemonUninstall,
} from "./runners.js";

export function registerDaemonCli(program: Command) {
  const daemon = program
    .command("daemon")
    .description("管理网关服务（launchd/systemd/schtasks）")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("文档：")} ${formatDocsLink("/cli/gateway", "docs.clawd.bot/cli/gateway")}\n`,
    );

  daemon
    .command("status")
    .description("显示服务安装状态 + 探测网关")
    .option("--url <url>", "网关 WebSocket URL（默认为 config/remote/local）")
    .option("--token <token>", "网关令牌（如需要）")
    .option("--password <password>", "网关密码（密码认证）")
    .option("--timeout <ms>", "超时时间（毫秒）", "10000")
    .option("--no-probe", "跳过 RPC 探测")
    .option("--deep", "扫描系统级服务", false)
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runDaemonStatus({
        rpc: opts,
        probe: Boolean(opts.probe),
        deep: Boolean(opts.deep),
        json: Boolean(opts.json),
      });
    });

  daemon
    .command("install")
    .description("安装网关服务（launchd/systemd/schtasks）")
    .option("--port <port>", "网关端口")
    .option("--runtime <runtime>", "守护进程运行时（node|bun）。默认：node")
    .option("--token <token>", "网关令牌（令牌认证）")
    .option("--force", "如已安装则重新安装/覆盖", false)
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runDaemonInstall(opts);
    });

  daemon
    .command("uninstall")
    .description("卸载网关服务（launchd/systemd/schtasks）")
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runDaemonUninstall(opts);
    });

  daemon
    .command("start")
    .description("启动网关服务（launchd/systemd/schtasks）")
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runDaemonStart(opts);
    });

  daemon
    .command("stop")
    .description("停止网关服务（launchd/systemd/schtasks）")
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runDaemonStop(opts);
    });

  daemon
    .command("restart")
    .description("重启网关服务（launchd/systemd/schtasks）")
    .option("--json", "输出 JSON", false)
    .action(async (opts) => {
      await runDaemonRestart(opts);
    });

  // Build default deps (parity with other commands).
  void createDefaultDeps();
}
