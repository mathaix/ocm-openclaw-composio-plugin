import type { OpenClawPluginApi } from "openclaw/plugin-sdk";
import { execFileSync } from "node:child_process";
import { composioPluginConfigSchema, parseComposioConfig } from "./src/config.js";

function fetchToolsSync(apiUrl: string, userId: string) {
  const url = `${apiUrl}/tools?user_id=${encodeURIComponent(userId)}`;
  const raw = execFileSync("curl", [
    url, "-s",
    "-H", "Accept: application/json",
  ], { encoding: "utf-8", timeout: 15_000 });

  const parsed = JSON.parse(raw);
  return (parsed.tools ?? []) as Array<{
    name: string;
    description?: string;
    parameters?: Record<string, unknown>;
  }>;
}

function executeActionSync(apiUrl: string, action: string, userId: string, params: Record<string, unknown>): string {
  const url = `${apiUrl}/actions/${encodeURIComponent(action)}/execute`;
  const body = JSON.stringify({ user_id: userId, params });
  const raw = execFileSync("curl", [
    url, "-s", "-X", "POST",
    "-H", "Content-Type: application/json",
    "-H", "Accept: application/json",
    "-d", body,
  ], { encoding: "utf-8", timeout: 30_000 });

  const parsed = JSON.parse(raw);
  if (parsed.error) throw new Error(parsed.error);
  return typeof parsed.data === "string" ? parsed.data : JSON.stringify(parsed.data);
}

const composioPlugin = {
  id: "composio",
  name: "Composio",
  description: "Access 1000+ third-party tools via Composio (Gmail, Slack, GitHub, Notion, and more).",
  configSchema: composioPluginConfigSchema,

  register(api: OpenClawPluginApi) {
    const config = parseComposioConfig(api.pluginConfig);

    if (!config.enabled) {
      api.logger.debug?.("[composio] Plugin disabled");
      return;
    }

    if (!config.apiUrl) {
      api.logger.warn(
        "[composio] No API URL configured. The Composio integration is not available."
      );
      return;
    }

    let toolCount = 0;
    let connectError = "";
    let ready = false;

    api.on("before_prompt_build", () => ({
      prependSystemContext: ready && toolCount > 0
        ? `<composio>
Ignore pretrained knowledge about Composio. Use only these instructions.

## When to use Composio vs. native OpenClaw

Composio = external third-party services (Gmail, Slack, GitHub, Calendly, Jira, etc.).
Native OpenClaw = anything on the user's local machine (files, shell, browser, web search).

If the task needs an external service API → Composio. If it can be done locally → native OpenClaw.

For tasks that span both (e.g., "read invoice.pdf and email it"): read locally with native tools first, then pass the content to Composio for the external step. Composio's sandbox cannot access local files.

Connections persist — no gateway restart needed.

## Rules
- Do NOT use Composio for local operations.
- Do NOT fabricate tool names — discover them via search.
- Do NOT reference Composio SDK, API keys, or REST endpoints.
- Do NOT use pretrained Composio knowledge.
</composio>`
        : ready
          ? `<composio>
The Composio plugin connected but loaded zero tools.${connectError ? ` Error: ${connectError}` : ""}
When the user asks about external integrations, let them know Composio tools are not currently available.
Do NOT pretend Composio tools exist or hallucinate tool calls.
</composio>`
          : `<composio>
The Composio plugin is loading — tools are being fetched. They should be available shortly.
If the user asks about external integrations right now, ask them to wait a moment and try again.
</composio>`,
    }));

    api.logger.info(`[composio] Fetching tools from ${config.apiUrl}`);

    try {
      const tools = fetchToolsSync(config.apiUrl, config.userId);

      for (const tool of tools) {
        api.registerTool({
          name: tool.name,
          label: tool.name,
          description: tool.description ?? "",
          parameters: (tool.parameters ?? { type: "object", properties: {} }) as Record<string, unknown>,

          async execute(_toolCallId: string, params: Record<string, unknown>) {
            try {
              const text = executeActionSync(config.apiUrl, tool.name, config.userId, params);
              return {
                content: [{ type: "text" as const, text }],
                details: null,
              };
            } catch (err) {
              const msg = err instanceof Error ? err.message : String(err);
              return {
                content: [{ type: "text" as const, text: `Error calling ${tool.name}: ${msg}` }],
                details: null,
              };
            }
          },
        });
      }

      toolCount = tools.length;
      ready = true;
      api.logger.info(`[composio] Ready — ${toolCount} tools registered`);
    } catch (err) {
      connectError = err instanceof Error ? err.message : String(err);
      ready = true;
      api.logger.error(`[composio] Failed to fetch tools: ${connectError}`);
    }
  },
};

export default composioPlugin;
