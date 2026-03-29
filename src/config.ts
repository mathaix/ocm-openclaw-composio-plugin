import { z } from "zod";
import type { ComposioConfig } from "./types.js";

export const ComposioConfigSchema = z.object({
  enabled: z.boolean().default(true),
  apiUrl: z.string().default(""),
  userId: z.string().default("default"),
});

export function parseComposioConfig(value: unknown): ComposioConfig {
  const raw =
    value && typeof value === "object" && !Array.isArray(value)
      ? (value as Record<string, unknown>)
      : {};

  const configObj = raw.config as Record<string, unknown> | undefined;

  const apiUrl =
    (typeof configObj?.apiUrl === "string" && configObj.apiUrl.trim()) ||
    (typeof raw.apiUrl === "string" && raw.apiUrl.trim()) ||
    "";

  const userId =
    (typeof configObj?.userId === "string" && configObj.userId.trim()) ||
    (typeof raw.userId === "string" && raw.userId.trim()) ||
    "default";

  return ComposioConfigSchema.parse({ ...raw, apiUrl, userId });
}

export const composioPluginConfigSchema = {
  parse: parseComposioConfig,
  uiHints: {
    enabled: {
      label: "Enable Composio",
      help: "Enable or disable the Composio integration",
    },
    apiUrl: {
      label: "API URL",
      help: "Backend proxy URL for Composio (injected by OCM, do not set manually)",
      advanced: true,
    },
    userId: {
      label: "User ID",
      help: "Machine-specific user ID (injected by OCM, do not set manually)",
      advanced: true,
    },
  },
};
