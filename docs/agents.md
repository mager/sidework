# Use Sidework with an agent

Ask: **“Set up my Sidework profile from my GitHub projects.”**

The agent reads public repositories, helps you choose up to six projects, and prepares their stories. It returns a direct review link. Open it in Sidework, check the result, then choose **Save these projects**. Nothing is saved before that action. The public profile stays unchanged.

## Connect Claude Code

1. Open [Workbench → Agents](https://sidework-ten.vercel.app/workbench/#agents) with an invite.
2. Select **Create agent token**, then **Copy token**.
3. Run these commands inside Claude Code:

```text
/plugin marketplace add mager/sidework
/plugin install sidework@sidework
```

4. Paste the token into the plugin's sensitive **Sidework agent token** configuration field. Do not paste it into chat. If your version does not support plugin user configuration, use the generic MCP configuration below instead.
5. Run `/sidework:setup-profile @mager`. Use `/sidework:find-contribution accessibility` for a contribution idea.

The plugin has no shell hooks, background jobs, local filesystem server, or GitHub permissions. It is distributed from this repository; no public directory listing is claimed.

## Other MCP clients

The endpoint is **https://sidework-ten.vercel.app/api/mcp**. It uses Streamable HTTP, JSON responses, and a Bearer token. Use **Copy MCP config** in Sidework for a complete configuration with your current token. Treat that configuration as a credential. The token stays in page memory, not localStorage.

```json
{
  "mcpServers": {
    "sidework": {
      "type": "http",
      "url": "https://sidework-ten.vercel.app/api/mcp",
      "headers": { "Authorization": "Bearer YOUR_SIDEWORK_AGENT_TOKEN" }
    }
  }
}
```

Clients may use a different configuration wrapper. Use their Streamable HTTP and custom-header fields. This prototype uses manually issued tokens; OAuth discovery and authorization are not implemented.

## Tools

| Tool | Use |
| --- | --- |
| `get_profile` | Read the committed @mager profile snapshot. |
| `list_projects` | Search published projects by name, purpose, or stack. |
| `list_contributions` | Search dated evidence by text and explicit PR state, with pagination. |
| `discover_opportunities` | Find curated contribution ideas. Verify current availability at the source. |
| `list_github_repositories` | Read a page of public owned repositories; follow `nextPage` until null. |
| `prepare_profile_draft` | Validate up to six projects in featured order and return a review link and JSON backup. |

The `sidework://profiles/mager` resource supplies the profile. The `setup_profile` prompt starts the workflow. No tool saves, publishes, deletes, sends messages, or changes GitHub.

## Review and storage

The first prototype supports **@mager** only. A token represents invite access, not verified GitHub identity. Agents cannot read browser-local drafts. Export a draft to provide your latest edits. Accounts, private repositories, and server-saved drafts are not connected.

Saving a reviewed draft updates matching project IDs or source URLs and sets the featured order. Other projects and the weekly plan remain. An invalid draft or failed storage write leaves the saved state unchanged.

Review links contain compressed draft data in a URL fragment, removed before the review is displayed. The fragment is not sent to Sidework's server, but the original link is in the agent conversation and may remain in browser history or clipboard tools. It is not encrypted; share it only with the author. No draft is kept in a server inbox. Long drafts use a JSON file instead. **Profile draft → Review a draft file** accepts the same format, up to 64 KB. Reloading an unsaved review discards it; reopen the original link or file.

## Token limits

Tokens expire within 24 hours or when the source invite session expires, whichever is first. Signed tokens are bound to the endpoint's origin and the scopes `catalog:read`, `github:public`, and `draft:prepare`. They cannot unlock the website or issue more tokens. MCP does not accept a browser cookie as authentication.

Creating another token does not revoke earlier tokens. Remove the source invitation hash or rotate the session secret and redeploy to revoke them. Individual revocation and per-user rate limits require durable account storage and are not implemented. Requests are limited to 100 KB and drafts to 64 KB. GitHub requests have an eight-second timeout and use public API limits. The application does not log tokens.

## Development

Run `npm test` and `npm run build`. Protocol tests use the official MCP client against the deployed route's handler. They check initialization, tools, resources, prompts, auth boundaries, limits, unsafe URLs, review links, and atomic merges. Validate with `claude plugin validate ./plugins/sidework` and `claude plugin validate .`.

For localhost, use a generic MCP configuration and a token issued at the same origin. The distributed plugin points to production.

Implementation references: [MCP TypeScript SDK](https://ts.sdk.modelcontextprotocol.io/server), [Claude plugin manifest](https://code.claude.com/docs/en/plugins-reference), and [Claude marketplace format](https://code.claude.com/docs/en/plugin-marketplaces).


### Project metadata

`prepare_profile_draft` accepts optional `category`, `softwareType`, `audience` (180 characters), and `features` (up to five strings, 160 characters each). Its input schema lists the supported category and software type IDs. Use repository evidence and the author's input. Leave unknown fields blank; a language does not establish a project's purpose. These fields survive review and JSON export. `list_projects` searches them and accepts an optional `category` filter. Older version 1 draft files remain valid.
