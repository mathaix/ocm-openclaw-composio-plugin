# Composio Plugin for OpenClaw

Access 1000+ third-party tools via Composio — Gmail, Slack, GitHub, Notion, Linear, Jira, HubSpot, Salesforce, Google Drive, and more.

## How It Works

On OpenClaw Machines (OCM), the plugin is pre-installed and configured automatically. The OCM backend proxies tool requests to Composio's REST API using a platform API key — no consumer key or MCP server is needed inside the VM.

The plugin fetches available tools at startup and registers them directly into the OpenClaw agent. Composio tools show up inside OpenClaw and can be invoked like native tools.

If a tool returns an auth error, the agent will prompt you to connect that toolkit via the OCM integrations hub.

## Configuration (OCM-managed)

On OCM, these fields are injected automatically by the config assembly pipeline:

| Option | Description | Default |
|---|---|---|
| `enabled` | Enable or disable the plugin | `true` |
| `apiUrl` | Backend proxy URL for Composio (injected by OCM) | — |
| `userId` | Machine-specific user ID (injected by OCM) | `default` |

## Links

- [Composio Documentation](https://docs.composio.dev)
- [Composio Dashboard](http://dashboard.composio.dev/~/org/connect/)
