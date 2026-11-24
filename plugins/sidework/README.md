# Sidework plugin v0.1.2

Tell the story of what you built in [Sidework](https://sidework.dev/), import public GitHub projects, and check your upstream pull requests.

| Skill | What to ask |
| --- | --- |
| `sidework-story` | “Help me tell the story of what I built.” |
| `sidework-init` | “Import this repository into Sidework.” or “Show my upstream PRs and let me choose what to watch.” |
| `sidework-pr-watch` | “What’s next on my open source PRs?” |

## Install

Install the plugin once in your agent. It includes the PR watcher. Start a new session after installing or updating.

### Claude Code

Run these commands in Claude Code.

```text
/plugin marketplace add mager/sidework
/plugin install sidework@sidework
```

Use `/sidework:sidework-story`, `/sidework:sidework-init`, or `/sidework:sidework-pr-watch`. If Sidework is already installed, update the marketplace and plugin from **/plugin**.

### Codex

Run these commands in a terminal with a current Codex CLI.

```sh
codex plugin marketplace add mager/sidework
codex plugin add sidework@sidework
```

You can also install **Sidework** from the **Sidework** marketplace in the Codex desktop plugin browser after you add the marketplace. If you pinned the marketplace to `plugin-v0.1.1`, remove that source with `codex plugin marketplace remove sidework`, then add it again with the commands above. Otherwise run `codex plugin marketplace upgrade sidework` first. In a new session, ask for a skill by name or use the skills picker.

### OpenCode

With OpenCode 2, clone the current plugin source.

```sh
git clone https://github.com/mager/sidework.git sidework-plugin
```

Add the absolute plugin directory to the existing `plugins` list in `~/.config/opencode/opencode.json` or `opencode.jsonc`.

```json
{
  "plugins": ["/absolute/path/sidework-plugin/plugins/sidework"]
}
```

Start a new session and ask for a skill by name. To update an existing checkout, switch to `main` and pull the latest changes with `git pull --ff-only`.

## Tell one project's story

Ask **“Help me tell the story of what I built.”** in your project checkout, or provide a public repository URL. The `sidework-story` skill checks public source evidence and asks you what you personally built, why, and what you learned. Unknown claims stay blank.

With the optional [Sidework MCP connection](../../docs/agents.md), the agent prepares one project and returns a private review link plus a JSON file. Without MCP, it gives you a repository import link and the story to copy into the editor. Neither path requires terminal Sidework sign-in; MCP tokens belong in your agent's private connection settings.

**Draft → Review → Save → Publish:** open the link or file, review, and explicitly save in the browser to your private account. Legacy sessions save in this browser. Publish one reviewed project and its selected favorites separately in Showcase. Agents cannot read private account drafts, save, or publish.

## First run

1. Ask **“Import this repository into Sidework.”** You can also give your agent public GitHub URLs or `OWNER/REPO` names. Open its **Review and import in Sidework** link, then choose **Import**. Your projects appear in your private workbench. Website import uses your normal Sidework sign-in and requires approved access. If you had to sign in, reopen the import link.
2. To use PR watch, have [Node.js 22](https://nodejs.org/en/download) and the [GitHub CLI](https://cli.github.com/) on the machine where your agent runs. If you have not signed in to GitHub CLI, run `gh auth login --hostname github.com` once. Project import needs only your Sidework website sign-in.
3. Ask **“Show my recent upstream PRs and let me choose what to watch.”** Pick one of your PRs or give its GitHub link. Ask **“What’s next on my selected open source PRs?”** to see review comments and a next action with a source link. To stop watching a PR, ask Sidework to deselect it.

The watch list stays on the machine that runs your agent, under its active GitHub account. An upgrade keeps your existing PR selections. If you added projects with v0.1.1, ask to import those repositories on the website.

## Run a recurring PR check

Select at least one PR first. A recurring run reports the first check, then changes and failed checks. Use the same GitHub account for setup and monitoring. GitHub access is read-only.

- **Claude Code** — Run `/loop 15m Use sidework-pr-watch in poll mode. Report changed PRs and failed checks.` Keep the session open. [Claude Code loop guide](https://code.claude.com/docs/en/scheduled-tasks)
- **Codex** — Create a scheduled task for a local project in the desktop app. Give it the prompt below. Keep the computer and app running. [Codex scheduled task guide](https://learn.chatgpt.com/docs/automations?surface=app)
- **OpenCode** — Give your local scheduler the command below. Use the same local account and make sure its PATH includes `opencode`, `node`, and `gh`. [OpenCode CLI guide](https://opencode.ai/docs/cli/)

```text
Use sidework-pr-watch in poll mode. Report the next action and source link
for each changed PR. Report failed checks. Skip empty alerts if supported.
```

```sh
opencode run 'Use sidework-pr-watch in poll mode. Report changed PRs and failed checks.'
```

Use **“Check my Sidework PRs now”** to read the full queue if a scheduled summary was interrupted. For an optional workflow to write project stories with an agent, see the [Sidework MCP guide](../../docs/agents.md).

## Development

Run `npm test` and `npm run build` at the repository root. Validate the Claude manifests with `claude plugin validate ./plugins/sidework` and `claude plugin validate .`. Use a temporary client profile to check skill discovery and run the watcher outside the repository.
