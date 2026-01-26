import type { Command } from "commander";

import { docsSearchCommand } from "../commands/docs.js";
import { defaultRuntime } from "../runtime.js";
import { formatDocsLink } from "../terminal/links.js";
import { theme } from "../terminal/theme.js";
import { runCommandWithRuntime } from "./cli-utils.js";

export function registerDocsCli(program: Command) {
  program
    .command("docs")
    .description("搜索 Clawdbot 在线文档")
    .argument("[query...]", "搜索查询")
    .addHelpText(
      "after",
      () =>
        `\n${theme.muted("文档：")} ${formatDocsLink("/cli/docs", "docs.clawd.bot/cli/docs")}\n`,
    )
    .action(async (queryParts: string[]) => {
      await runCommandWithRuntime(defaultRuntime, async () => {
        await docsSearchCommand(queryParts, defaultRuntime);
      });
    });
}
