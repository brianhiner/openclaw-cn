import type { Command } from "commander";

import { callGateway } from "../gateway/call.js";
import { GATEWAY_CLIENT_MODES, GATEWAY_CLIENT_NAMES } from "../utils/message-channel.js";
import { defaultRuntime } from "../runtime.js";
import { renderTable } from "../terminal/table.js";
import { theme } from "../terminal/theme.js";
import { withProgress } from "./progress.js";

type DevicesRpcOpts = {
  url?: string;
  token?: string;
  password?: string;
  timeout?: string;
  json?: boolean;
  device?: string;
  role?: string;
  scope?: string[];
};

type DeviceTokenSummary = {
  role: string;
  scopes?: string[];
  revokedAtMs?: number;
};

type PendingDevice = {
  requestId: string;
  deviceId: string;
  displayName?: string;
  role?: string;
  remoteIp?: string;
  isRepair?: boolean;
  ts?: number;
};

type PairedDevice = {
  deviceId: string;
  displayName?: string;
  roles?: string[];
  scopes?: string[];
  remoteIp?: string;
  tokens?: DeviceTokenSummary[];
  createdAtMs?: number;
  approvedAtMs?: number;
};

type DevicePairingList = {
  pending?: PendingDevice[];
  paired?: PairedDevice[];
};

function formatAge(msAgo: number) {
  const s = Math.max(0, Math.floor(msAgo / 1000));
  if (s < 60) return `${s}s`;
  const m = Math.floor(s / 60);
  if (m < 60) return `${m}m`;
  const h = Math.floor(m / 60);
  if (h < 24) return `${h}h`;
  const d = Math.floor(h / 24);
  return `${d}d`;
}

const devicesCallOpts = (cmd: Command, defaults?: { timeoutMs?: number }) =>
  cmd
    .option("--url <url>", "网关 WebSocket URL（已配置时默认为 gateway.remote.url）")
    .option("--token <token>", "网关令牌（如需要）")
    .option("--password <password>", "网关密码（密码认证）")
    .option("--timeout <ms>", "超时时间（毫秒）", String(defaults?.timeoutMs ?? 10_000))
    .option("--json", "输出 JSON", false);

const callGatewayCli = async (method: string, opts: DevicesRpcOpts, params?: unknown) =>
  withProgress(
    {
      label: `Devices ${method}`,
      indeterminate: true,
      enabled: opts.json !== true,
    },
    async () =>
      await callGateway({
        url: opts.url,
        token: opts.token,
        password: opts.password,
        method,
        params,
        timeoutMs: Number(opts.timeout ?? 10_000),
        clientName: GATEWAY_CLIENT_NAMES.CLI,
        mode: GATEWAY_CLIENT_MODES.CLI,
      }),
  );

function parseDevicePairingList(value: unknown): DevicePairingList {
  const obj = typeof value === "object" && value !== null ? (value as Record<string, unknown>) : {};
  return {
    pending: Array.isArray(obj.pending) ? (obj.pending as PendingDevice[]) : [],
    paired: Array.isArray(obj.paired) ? (obj.paired as PairedDevice[]) : [],
  };
}

function formatTokenSummary(tokens: DeviceTokenSummary[] | undefined) {
  if (!tokens || tokens.length === 0) return "none";
  const parts = tokens
    .map((t) => `${t.role}${t.revokedAtMs ? " (revoked)" : ""}`)
    .sort((a, b) => a.localeCompare(b));
  return parts.join(", ");
}

export function registerDevicesCli(program: Command) {
  const devices = program.command("devices").description("设备配对和认证令牌");

  devicesCallOpts(
    devices
      .command("list")
      .description("列出待处理和已配对的设备")
      .action(async (opts: DevicesRpcOpts) => {
        const result = await callGatewayCli("device.pair.list", opts, {});
        const list = parseDevicePairingList(result);
        if (opts.json) {
          defaultRuntime.log(JSON.stringify(list, null, 2));
          return;
        }
        if (list.pending?.length) {
          const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
          defaultRuntime.log(
            `${theme.heading("Pending")} ${theme.muted(`(${list.pending.length})`)}`,
          );
          defaultRuntime.log(
            renderTable({
              width: tableWidth,
              columns: [
                { key: "Request", header: "Request", minWidth: 10 },
                { key: "Device", header: "Device", minWidth: 16, flex: true },
                { key: "Role", header: "Role", minWidth: 8 },
                { key: "IP", header: "IP", minWidth: 12 },
                { key: "Age", header: "Age", minWidth: 8 },
                { key: "Flags", header: "Flags", minWidth: 8 },
              ],
              rows: list.pending.map((req) => ({
                Request: req.requestId,
                Device: req.displayName || req.deviceId,
                Role: req.role ?? "",
                IP: req.remoteIp ?? "",
                Age: typeof req.ts === "number" ? `${formatAge(Date.now() - req.ts)} ago` : "",
                Flags: req.isRepair ? "repair" : "",
              })),
            }).trimEnd(),
          );
        }
        if (list.paired?.length) {
          const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
          defaultRuntime.log(
            `${theme.heading("Paired")} ${theme.muted(`(${list.paired.length})`)}`,
          );
          defaultRuntime.log(
            renderTable({
              width: tableWidth,
              columns: [
                { key: "Device", header: "Device", minWidth: 16, flex: true },
                { key: "Roles", header: "Roles", minWidth: 12, flex: true },
                { key: "Scopes", header: "Scopes", minWidth: 12, flex: true },
                { key: "Tokens", header: "Tokens", minWidth: 12, flex: true },
                { key: "IP", header: "IP", minWidth: 12 },
              ],
              rows: list.paired.map((device) => ({
                Device: device.displayName || device.deviceId,
                Roles: device.roles?.length ? device.roles.join(", ") : "",
                Scopes: device.scopes?.length ? device.scopes.join(", ") : "",
                Tokens: formatTokenSummary(device.tokens),
                IP: device.remoteIp ?? "",
              })),
            }).trimEnd(),
          );
        }
        if (!list.pending?.length && !list.paired?.length) {
          defaultRuntime.log(theme.muted("No device pairing entries."));
        }
      }),
  );

  devicesCallOpts(
    devices
      .command("approve")
      .description("批准待处理的设备配对请求")
      .argument("<requestId>", "待处理请求 ID")
      .action(async (requestId: string, opts: DevicesRpcOpts) => {
        const result = await callGatewayCli("device.pair.approve", opts, { requestId });
        if (opts.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        const deviceId = (result as { device?: { deviceId?: string } })?.device?.deviceId;
        defaultRuntime.log(`${theme.success("Approved")} ${theme.command(deviceId ?? "ok")}`);
      }),
  );

  devicesCallOpts(
    devices
      .command("reject")
      .description("拒绝待处理的设备配对请求")
      .argument("<requestId>", "待处理请求 ID")
      .action(async (requestId: string, opts: DevicesRpcOpts) => {
        const result = await callGatewayCli("device.pair.reject", opts, { requestId });
        if (opts.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        const deviceId = (result as { deviceId?: string })?.deviceId;
        defaultRuntime.log(`${theme.warn("Rejected")} ${theme.command(deviceId ?? "ok")}`);
      }),
  );

  devicesCallOpts(
    devices
      .command("rotate")
      .description("轮换设备某角色的令牌")
      .requiredOption("--device <id>", "设备 ID")
      .requiredOption("--role <role>", "角色名称")
      .option("--scope <scope...>", "附加到令牌的作用域（可重复）")
      .action(async (opts: DevicesRpcOpts) => {
        const deviceId = String(opts.device ?? "").trim();
        const role = String(opts.role ?? "").trim();
        if (!deviceId || !role) {
          defaultRuntime.error("--device and --role required");
          defaultRuntime.exit(1);
          return;
        }
        const result = await callGatewayCli("device.token.rotate", opts, {
          deviceId,
          role,
          scopes: Array.isArray(opts.scope) ? opts.scope : undefined,
        });
        defaultRuntime.log(JSON.stringify(result, null, 2));
      }),
  );

  devicesCallOpts(
    devices
      .command("revoke")
      .description("撤销设备某角色的令牌")
      .requiredOption("--device <id>", "设备 ID")
      .requiredOption("--role <role>", "角色名称")
      .action(async (opts: DevicesRpcOpts) => {
        const deviceId = String(opts.device ?? "").trim();
        const role = String(opts.role ?? "").trim();
        if (!deviceId || !role) {
          defaultRuntime.error("--device and --role required");
          defaultRuntime.exit(1);
          return;
        }
        const result = await callGatewayCli("device.token.revoke", opts, {
          deviceId,
          role,
        });
        defaultRuntime.log(JSON.stringify(result, null, 2));
      }),
  );
}
