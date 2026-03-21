# Composio Plugin for OpenClaw

Access 1000+ third-party tools via Composio MCP — Gmail, Slack, GitHub, Notion, Linear, Jira, HubSpot, Salesforce, Google Drive, and more.

## Install

```bash
openclaw plugins install @composio/openclaw-plugin
```

## Setup

1. Log in at [dashboard.composio.dev](http://dashboard.composio.dev/~/org/connect/clients/openclaw)
2. Choose your preferred client (OpenClaw, Claude Code, Cursor, etc.)
3. Copy your consumer key (`ck_...`)

### Via OpenClaw Config

```bash
openclaw config set plugins.entries.composio.config.consumerKey "ck_your_key_here"
openclaw config set plugins.allow '["composio"]'
openclaw config set tools.alsoAllow '["composio"]'
```

- `plugins.allow` ensures the Composio plugin is explicitly trusted and allowed to load.
- `tools.alsoAllow` ensures Composio tools remain available on non-`full` tool profiles such as `coding`, `minimal`, and `messaging`.

After setting your key and allowlists, restart the gateway:

```bash
openclaw gateway restart
```

## How It Works

The plugin connects to Composio's MCP server at `https://connect.composio.dev/mcp` and registers all available tools directly into the OpenClaw agent. Once the plugin is configured, Composio tools show up directly inside OpenClaw and can be invoked like native tools.

If a tool returns an auth error, the agent will prompt you to connect that toolkit at [dashboard.composio.dev](http://dashboard.composio.dev/~/org/connect/clients/openclaw).

## Configuration

```json
{
  "plugins": {
    "entries": {
      "composio": {
        "enabled": true,
        "config": {
          "consumerKey": "ck_your_key_here"
        }
      }
    }
  }
}
```

| Option | Description | Default |
|---|---|---|
| `enabled` | Enable or disable the plugin | `true` |
| `consumerKey` | Your Composio consumer key (`ck_...`) | — |
| `mcpUrl` | MCP server URL (advanced) | `https://connect.composio.dev/mcp` |

## Links

- [Composio Documentation](https://docs.composio.dev)
- [Composio Dashboard](http://dashboard.composio.dev/~/org/connect/)
- [MCP Protocol](https://modelcontextprotocol.io)
