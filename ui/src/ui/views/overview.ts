import { html } from "lit";

import type { GatewayHelloOk } from "../gateway";
import { formatAgo, formatDurationMs } from "../format";
import { formatNextRun } from "../presenter";
import type { UiSettings } from "../storage";

export type OverviewProps = {
  connected: boolean;
  hello: GatewayHelloOk | null;
  settings: UiSettings;
  password: string;
  lastError: string | null;
  presenceCount: number;
  sessionsCount: number | null;
  cronEnabled: boolean | null;
  cronNext: number | null;
  lastChannelsRefresh: number | null;
  onSettingsChange: (next: UiSettings) => void;
  onPasswordChange: (next: string) => void;
  onSessionKeyChange: (next: string) => void;
  onConnect: () => void;
  onRefresh: () => void;
};

export function renderOverview(props: OverviewProps) {
  const snapshot = props.hello?.snapshot as
    | { uptimeMs?: number; policy?: { tickIntervalMs?: number } }
    | undefined;
  const uptime = snapshot?.uptimeMs ? formatDurationMs(snapshot.uptimeMs) : "n/a";
  const tick = snapshot?.policy?.tickIntervalMs
    ? `${snapshot.policy.tickIntervalMs}ms`
    : "n/a";
  const authHint = (() => {
    if (props.connected || !props.lastError) return null;
    const lower = props.lastError.toLowerCase();
    const authFailed = lower.includes("unauthorized") || lower.includes("connect failed");
    if (!authFailed) return null;
    const hasToken = Boolean(props.settings.token.trim());
    const hasPassword = Boolean(props.password.trim());
    if (!hasToken && !hasPassword) {
      return html`
        <div class="muted" style="margin-top: 8px;">
          此网关需要身份验证。添加令牌或密码，然后点击连接。
          <div style="margin-top: 6px;">
            <span class="mono">clawdbot dashboard --no-open</span> → 生成带令牌的URL<br />
            <span class="mono">clawdbot doctor --generate-gateway-token</span> → 设置令牌
          </div>
          <div style="margin-top: 6px;">
            <a
              class="session-link"
              href="https://docs.clawd.bot/web/dashboard"
              target="_blank"
              rel="noreferrer"
              title="控制界面身份验证文档（在新标签页中打开）"
              >文档：控制界面身份验证</a
            >
          </div>
        </div>
      `;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        身份验证失败。重新复制带令牌的URL，使用
        <span class="mono">clawdbot dashboard --no-open</span>，或更新令牌，
        然后点击连接。
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.clawd.bot/web/dashboard"
            target="_blank"
            rel="noreferrer"
            title="Control UI auth docs (opens in new tab)"
            >Docs: Control UI auth</a
          >
        </div>
      </div>
    `;
  })();
  const insecureContextHint = (() => {
    if (props.connected || !props.lastError) return null;
    const isSecureContext = typeof window !== "undefined" ? window.isSecureContext : true;
    if (isSecureContext !== false) return null;
    const lower = props.lastError.toLowerCase();
    if (!lower.includes("secure context") && !lower.includes("device identity required")) {
      return null;
    }
    return html`
      <div class="muted" style="margin-top: 8px;">
        此页面使用HTTP协议，因此浏览器会阻止设备身份验证。请使用HTTPS（Tailscale Serve）或
        在网关主机上打开 <span class="mono">http://127.0.0.1:18789</span>。
        <div style="margin-top: 6px;">
          如果必须使用HTTP，请设置
          <span class="mono">gateway.controlUi.allowInsecureAuth: true</span>（仅限令牌）。
        </div>
        <div style="margin-top: 6px;">
          <a
            class="session-link"
            href="https://docs.clawd.bot/gateway/tailscale"
            target="_blank"
            rel="noreferrer"
            title="Tailscale Serve 文档（在新标签页中打开）"
            >文档：Tailscale Serve</a
          >
          <span class="muted"> · </span>
          <a
            class="session-link"
            href="https://docs.clawd.bot/web/control-ui#insecure-http"
            target="_blank"
            rel="noreferrer"
            title="非安全HTTP文档（在新标签页中打开）"
            >文档：非安全HTTP</a
          >
        </div>
      </div>
    `;
  })();

  return html`
    <section class="grid grid-cols-2">
      <div class="card">
        <div class="card-title">网关访问</div>
        <div class="card-sub">仪表板连接位置以及身份验证方式。</div>
        <div class="form-grid" style="margin-top: 16px;">
          <label class="field">
            <span>WebSocket URL</span>
            <input
              .value=${props.settings.gatewayUrl}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSettingsChange({ ...props.settings, gatewayUrl: v });
              }}
              placeholder="ws://100.x.y.z:18789"
            />
          </label>
          <label class="field">
            <span>网关令牌</span>
            <input
              .value=${props.settings.token}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSettingsChange({ ...props.settings, token: v });
              }}
              placeholder="CLAWDBOT_GATEWAY_TOKEN"
            />
          </label>
          <label class="field">
            <span>密码（不存储）</span>
            <input
              type="password"
              .value=${props.password}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onPasswordChange(v);
              }}
              placeholder="system or shared password"
            />
          </label>
          <label class="field">
            <span>默认会话密钥</span>
            <input
              .value=${props.settings.sessionKey}
              @input=${(e: Event) => {
                const v = (e.target as HTMLInputElement).value;
                props.onSessionKeyChange(v);
              }}
            />
          </label>
        </div>
        <div class="row" style="margin-top: 14px;">
          <button class="btn" @click=${() => props.onConnect()}>连接</button>
          <button class="btn" @click=${() => props.onRefresh()}>刷新</button>
          <span class="muted">点击连接以应用连接更改。</span>
        </div>
      </div>

      <div class="card">
        <div class="card-title">快照</div>
        <div class="card-sub">最新网关握手信息。</div>
        <div class="stat-grid" style="margin-top: 16px;">
          <div class="stat">
            <div class="stat-label">状态</div>
            <div class="stat-value ${props.connected ? "ok" : "warn"}">
              ${props.connected ? "已连接" : "已断开"}
            </div>
          </div>
          <div class="stat">
            <div class="stat-label">运行时间</div>
            <div class="stat-value">${uptime}</div>
          </div>
          <div class="stat">
            <div class="stat-label">心跳间隔</div>
            <div class="stat-value">${tick}</div>
          </div>
          <div class="stat">
            <div class="stat-label">上次通道刷新</div>
            <div class="stat-value">
              ${props.lastChannelsRefresh
                ? formatAgo(props.lastChannelsRefresh)
                : "无"}
            </div>
          </div>
        </div>
        ${props.lastError
          ? html`<div class="callout danger" style="margin-top: 14px;">
              <div>${props.lastError}</div>
              ${authHint ?? ""}
              ${insecureContextHint ?? ""}
            </div>`
          : html`<div class="callout" style="margin-top: 14px;">
              使用通道链接 WhatsApp、Telegram、Discord、Signal 或 iMessage。
            </div>`}
      </div>
    </section>

    <section class="grid grid-cols-3" style="margin-top: 18px;">
      <div class="card stat-card">
        <div class="stat-label">Instances</div>
        <div class="stat-value">${props.presenceCount}</div>
        <div class="muted">Presence beacons in the last 5 minutes.</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">Sessions</div>
        <div class="stat-value">${props.sessionsCount ?? "n/a"}</div>
        <div class="muted">Recent session keys tracked by the gateway.</div>
      </div>
      <div class="card stat-card">
        <div class="stat-label">定时任务</div>
        <div class="stat-value">
          ${props.cronEnabled == null
            ? "无"
            : props.cronEnabled
              ? "启用"
              : "禁用"}
        </div>
        <div class="muted">下次唤醒 ${formatNextRun(props.cronNext)}</div>
      </div>
    </section>

    <section class="card" style="margin-top: 18px;">
      <div class="card-title">Notes</div>
      <div class="card-sub">Quick reminders for remote control setups.</div>
      <div class="note-grid" style="margin-top: 14px;">
        <div>
          <div class="note-title">Tailscale serve</div>
          <div class="muted">
            Prefer serve mode to keep the gateway on loopback with tailnet auth.
          </div>
        </div>
        <div>
          <div class="note-title">Session hygiene</div>
          <div class="muted">Use /new or sessions.patch to reset context.</div>
        </div>
        <div>
          <div class="note-title">Cron reminders</div>
          <div class="muted">Use isolated sessions for recurring runs.</div>
        </div>
      </div>
    </section>
  `;
}
