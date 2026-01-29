import type { ChannelOutboundAdapter } from "../types.js";
import { sendMessageFeishu } from "../../../feishu/send.js";
import { getFeishuClient } from "../../../feishu/client.js";

export const feishuOutbound: ChannelOutboundAdapter = {
  deliveryMode: "direct",
  sendText: async ({ to, text, accountId }) => {
    const client = getFeishuClient(accountId ?? undefined);
    const result = await sendMessageFeishu(client, to, { text });
    return {
      channel: "feishu",
      messageId: result?.message_id || "unknown",
      chatId: to,
    };
  },
  sendMedia: async ({ to, text, mediaUrl, accountId }) => {
    const client = getFeishuClient(accountId ?? undefined);
    const result = await sendMessageFeishu(client, to, { text: text || "" }, { mediaUrl });
    return {
      channel: "feishu",
      messageId: result?.message_id || "unknown",
      chatId: to,
    };
  },
};
