# Sidework for Claude Code

Set up a profile from public GitHub projects and return a direct review link.

1. Open [Sidework → Agents](https://sidework-ten.vercel.app/workbench/#agents) with your invite. Create an agent token.
2. In Claude Code, run:

```text
/plugin marketplace add mager/sidework
/plugin install sidework@sidework
```

3. Paste the token into the plugin's sensitive **Sidework agent token** configuration field when prompted. Never paste it into chat. Use the plugin configuration screen to replace it when it expires, within 24 hours.
4. Run `/sidework:setup-profile @mager`, or ask Claude to set up your Sidework profile. `/sidework:find-contribution accessibility` finds a contribution idea.
5. Open the returned review link and choose **Save these projects** after checking the draft.

The prototype supports one profile, @mager. Agents can read committed records, read public GitHub repositories, and prepare drafts. They cannot read browser-local state, publish, access private repositories, or verify ownership. Review links contain the draft; share them only with its author. Local saves stay in that browser. Accounts and public publishing are future work.

The plugin uses the official MCP SDK through Sidework's Streamable HTTP endpoint. It has no shell hooks or background jobs. For any other MCP client, use **Copy MCP config** from the Agents screen.

For local plugin development: `claude --plugin-dir ./plugins/sidework`. Validate with `claude plugin validate ./plugins/sidework` and `claude plugin validate .` from the repository root.
