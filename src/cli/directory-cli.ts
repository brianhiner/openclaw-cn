import type { Command } from "commander";

import { resolveChannelDefaultAccountId } from "../channels/plugins/helpers.js";
import { getChannelPlugin } from "../channels/plugins/index.js";
import { loadConfig } from "../config/config.js";
import { danger } from "../globals.js";
import { resolveMessageChannelSelection } from "../infra/outbound/channel-selection.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { renderTable } from "../terminal/table.js";

function parseLimit(value: unknown): number | null {
  if (typeof value === "number" && Number.isFinite(value)) {
    if (value <= 0) return null;
    return Math.floor(value);
  }
  if (typeof value !== "string") return null;
  const raw = value.trim();
  if (!raw) return null;
  const parsed = Number.parseInt(raw, 10);
  if (!Number.isFinite(parsed) || parsed <= 0) return null;
  return parsed;
}

function buildRows(entries: Array<{ id: string; name?: string | undefined }>) {
  return entries.map((entry) => ({
    ID: entry.id,
    Name: entry.name?.trim() ?? "",
  }));
}

export function registerDirectoryCli(program: Command) {
  const directory = program
    .command("directory")
    .description("目录查找（自己、同伴、群组）适用于支持的渠道")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("文档：")} ${formatDocsLink(
          "/cli/directory",
          "docs.clawd.bot/cli/directory",
        )}\n`,
    )
    .action(() => {
      directory.help({ error: true });
    });

  const withChannel = (cmd: Command) =>
    cmd
      .option("--channel <name>", "渠道（仅配置一个时自动选择）")
      .option("--account <id>", "账户 ID（accountId）")
      .option("--json", "输出 JSON", false);

  const resolve = async (opts: { channel?: string; account?: string }) => {
    const cfg = loadConfig();
    const selection = await resolveMessageChannelSelection({
      cfg,
      channel: opts.channel ?? null,
    });
    const channelId = selection.channel;
    const plugin = getChannelPlugin(channelId);
    if (!plugin) throw new Error(`Unsupported channel: ${String(channelId)}`);
    const accountId = opts.account?.trim() || resolveChannelDefaultAccountId({ plugin, cfg });
    return { cfg, channelId, accountId, plugin };
  };

  withChannel(directory.command("self").description("显示当前账户用户")).action(async (opts) => {
    try {
      const { cfg, channelId, accountId, plugin } = await resolve({
        channel: opts.channel as string | undefined,
        account: opts.account as string | undefined,
      });
      const fn = plugin.directory?.self;
      if (!fn) throw new Error(`Channel ${channelId} does not support directory self`);
      const result = await fn({ cfg, accountId, runtime: defaultRuntime });
      if (opts.json) {
        defaultRuntime.log(JSON.stringify(result, null, 2));
        return;
      }
      if (!result) {
        defaultRuntime.log(theme.muted("Not available."));
        return;
      }
      const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
      defaultRuntime.log(`${theme.heading("Self")}`);
      defaultRuntime.log(
        renderTable({
          width: tableWidth,
          columns: [
            { key: "ID", header: "ID", minWidth: 16, flex: true },
            { key: "Name", header: "Name", minWidth: 18, flex: true },
          ],
          rows: buildRows([result]),
        }).trimEnd(),
      );
    } catch (err) {
      defaultRuntime.error(danger(String(err)));
      defaultRuntime.exit(1);
    }
  });

  const peers = directory.command("peers").description("同伴目录（联系人/用户）");
  withChannel(peers.command("list").description("列出同伴"))
    .option("--query <text>", "可选的搜索查询")
    .option("--limit <n>", "限制结果数")
    .action(async (opts) => {
      try {
        const { cfg, channelId, accountId, plugin } = await resolve({
          channel: opts.channel as string | undefined,
          account: opts.account as string | undefined,
        });
        const fn = plugin.directory?.listPeers;
        if (!fn) throw new Error(`Channel ${channelId} does not support directory peers`);
        const result = await fn({
          cfg,
          accountId,
          query: (opts.query as string | undefined) ?? null,
          limit: parseLimit(opts.limit),
          runtime: defaultRuntime,
        });
        if (opts.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        if (result.length === 0) {
          defaultRuntime.log(theme.muted("No peers found."));
          return;
        }
        const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
        defaultRuntime.log(`${theme.heading("Peers")} ${theme.muted(`(${result.length})`)}`);
        defaultRuntime.log(
          renderTable({
            width: tableWidth,
            columns: [
              { key: "ID", header: "ID", minWidth: 16, flex: true },
              { key: "Name", header: "Name", minWidth: 18, flex: true },
            ],
            rows: buildRows(result),
          }).trimEnd(),
        );
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  const groups = directory.command("groups").description("群组目录");
  withChannel(groups.command("list").description("列出群组"))
    .option("--query <text>", "可选的搜索查询")
    .option("--limit <n>", "限制结果数")
    .action(async (opts) => {
      try {
        const { cfg, channelId, accountId, plugin } = await resolve({
          channel: opts.channel as string | undefined,
          account: opts.account as string | undefined,
        });
        const fn = plugin.directory?.listGroups;
        if (!fn) throw new Error(`Channel ${channelId} does not support directory groups`);
        const result = await fn({
          cfg,
          accountId,
          query: (opts.query as string | undefined) ?? null,
          limit: parseLimit(opts.limit),
          runtime: defaultRuntime,
        });
        if (opts.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        if (result.length === 0) {
          defaultRuntime.log(theme.muted("No groups found."));
          return;
        }
        const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
        defaultRuntime.log(`${theme.heading("Groups")} ${theme.muted(`(${result.length})`)}`);
        defaultRuntime.log(
          renderTable({
            width: tableWidth,
            columns: [
              { key: "ID", header: "ID", minWidth: 16, flex: true },
              { key: "Name", header: "Name", minWidth: 18, flex: true },
            ],
            rows: buildRows(result),
          }).trimEnd(),
        );
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });

  withChannel(
    groups
      .command("members")
      .description("列出群组成员")
      .requiredOption("--group-id <id>", "群组 ID"),
  )
    .option("--limit <n>", "限制结果数")
    .action(async (opts) => {
      try {
        const { cfg, channelId, accountId, plugin } = await resolve({
          channel: opts.channel as string | undefined,
          account: opts.account as string | undefined,
        });
        const fn = plugin.directory?.listGroupMembers;
        if (!fn) throw new Error(`Channel ${channelId} does not support group members listing`);
        const groupId = String(opts.groupId ?? "").trim();
        if (!groupId) throw new Error("Missing --group-id");
        const result = await fn({
          cfg,
          accountId,
          groupId,
          limit: parseLimit(opts.limit),
          runtime: defaultRuntime,
        });
        if (opts.json) {
          defaultRuntime.log(JSON.stringify(result, null, 2));
          return;
        }
        if (result.length === 0) {
          defaultRuntime.log(theme.muted("No group members found."));
          return;
        }
        const tableWidth = Math.max(60, (process.stdout.columns ?? 120) - 1);
        defaultRuntime.log(
          `${theme.heading("Group Members")} ${theme.muted(`(${result.length})`)}`,
        );
        defaultRuntime.log(
          renderTable({
            width: tableWidth,
            columns: [
              { key: "ID", header: "ID", minWidth: 16, flex: true },
              { key: "Name", header: "Name", minWidth: 18, flex: true },
            ],
            rows: buildRows(result),
          }).trimEnd(),
        );
      } catch (err) {
        defaultRuntime.error(danger(String(err)));
        defaultRuntime.exit(1);
      }
    });
}
