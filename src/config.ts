import { z } from "zod";
import type { ComposioConfig } from "./types.js";

export const ComposioConfigSchema = z.object({
  enabled: z.boolean().default(true),
  consumerKey: z.string().default(""),
  mcpUrl: z.string().default("https://connect.composio.dev/mcp"),
  userId: z.string().default("default"),
});

export function parseComposioConfig(value: unknown): ComposioConfig {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const configObj = raw.config as Record<string, unknown> | undefined;

  let consumerKey =
    (typeof configObj?.consumerKey === "string" && configObj.consumerKey.trim()) ||
    (typeof raw.consumerKey === "string" && raw.consumerKey.trim()) ||
    process.env.COMPOSIO_CONSUMER_KEY ||
    "";

  // If consumerKey looks like an env var name (ALL_CAPS_UNDERSCORE), resolve it
  if (consumerKey && /^[A-Z_][A-Z0-9_]*$/.test(consumerKey)) {
    consumerKey = process.env[consumerKey] || "";
  }

  const mcpUrl =
    (typeof configObj?.mcpUrl === "string" && configObj.mcpUrl.trim()) ||
    (typeof raw.mcpUrl === "string" && raw.mcpUrl.trim()) ||
    "https://connect.composio.dev/mcp";

  const userId =
    (typeof configObj?.userId === "string" && configObj.userId.trim()) ||
    (typeof raw.userId === "string" && raw.userId.trim()) ||
    "default";

  return ComposioConfigSchema.parse({ ...raw, consumerKey, mcpUrl, userId });
}

export const composioPluginConfigSchema = {
  parse: parseComposioConfig,
  uiHints: {
    enabled: {
      label: "Enable Composio",
      help: "Enable or disable the Composio integration",
    },
    consumerKey: {
      label: "Consumer Key",
      help: "Your Composio consumer key (ck_...) from dashboard.composio.dev/~/org/connect/clients/openclaw",
      sensitive: true,
    },
    mcpUrl: {
      label: "MCP Server URL",
      help: "Composio MCP server URL (default: https://connect.composio.dev/mcp)",
      advanced: true,
    },
    userId: {
      label: "User ID",
      help: "Machine-specific user ID for per-machine connection isolation (injected by OCM, do not set manually)",
      advanced: true,
    },
  },
};
