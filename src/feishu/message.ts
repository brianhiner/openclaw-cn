import type { Client } from "@larksuiteoapi/node-sdk";
import { dispatchReplyWithBufferedBlockDispatcher } from "../auto-reply/reply/provider-dispatcher.js";
import { loadConfig } from "../config/config.js";
import { getChildLogger } from "../logging.js";
import { sendMessageFeishu } from "./send.js";

const logger = getChildLogger({ module: "feishu-message" });

export async function processFeishuMessage(client: Client, data: any, appId: string) {
  // data is the event payload from Lark SDK
  // We expect "im.message.receive_v1" event structure
  // https://open.feishu.cn/document/server-side-sdk/nodejs-sdk/handling-callbacks

  logger.info(`[feishu] Received event: ${JSON.stringify(data).slice(0, 500)}`);

  const event = data.event;
  if (!event || !event.message) {
    logger.warn(
      `[feishu] Received invalid Feishu event structure: ${JSON.stringify(data).slice(0, 200)}`,
    );
    return;
  }

  const message = event.message;
  const sender = event.sender;
  const chatId = message.chat_id;

  logger.info(
    `[feishu] Processing message: chatId=${chatId}, type=${message.message_type}, sender=${sender?.sender_id?.open_id}`,
  );

  // Only handle text messages for now
  if (message.message_type !== "text") {
    logger.debug(`Skipping non-text message type: ${message.message_type}`);
    return;
  }

  let text = "";
  try {
    const content = JSON.parse(message.content);
    text = content.text || "";
  } catch (e) {
    logger.error(`Failed to parse message content: ${e}`);
    return;
  }

  if (!text) return;

  const senderId = sender.sender_id?.open_id || sender.sender_id?.user_id || "unknown";
  const senderName = sender.sender_id?.user_id || "unknown"; // Lark doesn't provide name in event usually?

  const cfg = loadConfig();

  const isGroup = message.chat_type === "group";
  const isP2P = message.chat_type === "p2p";

  // Context construction
  const ctx = {
    Body: text,
    RawBody: text,
    From: senderId,
    To: chatId, // This is where we send reply back
    SenderId: senderId,
    SenderName: senderName,
    ChatType: isGroup ? "group" : "dm",
    Provider: "feishu",
    Surface: "feishu",
    Timestamp: Number(message.create_time),
    MessageSid: message.message_id,
    AccountId: appId,
    OriginatingChannel: "feishu",
    OriginatingTo: chatId,
  };

  await dispatchReplyWithBufferedBlockDispatcher({
    ctx,
    cfg,
    dispatcherOptions: {
      deliver: async (payload, info) => {
        // payload.text contains the reply text
        if (!payload.text) return;

        // If it's a final response or a block, we send it.
        // For streaming, we might want to accumulate or use "interactive" cards if supported.
        // For now, just send text.

        await sendMessageFeishu(
          client,
          chatId,
          { text: payload.text },
          {
            msgType: "text",
            receiveIdType: "chat_id",
          },
        );
      },
      onError: (err, info) => {
        logger.error(`Reply error: ${err}`);
      },
      // Simple typing indicator if supported (Lark has no typing indicator API publicly generally available or simple)
      onReplyStart: () => {},
    },
    replyOptions: {
      disableBlockStreaming: true, // Simple text implementation first
    },
  });
}
