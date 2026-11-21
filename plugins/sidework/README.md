# Sidework plugin v0.1

Ask **“What’s next on my open source PRs?”** Sidework reads GitHub review comments and shows the next action with a link to the source.

| Skill | Use it to |
| --- | --- |
| `sidework-init` | Add a public project, choose upstream PRs to watch, or remove a selection. |
| `sidework-pr-watch` | Check the review queue now or report changes on a schedule. |

Both skills use Node.js 22 and the [GitHub CLI](https://cli.github.com/). Run `gh auth login --hostname github.com` if you need to sign in. Use the same GitHub account for setup and scheduled checks.

## Install

### Claude Code

Inside Claude Code, run these commands.

```text
/plugin marketplace add mager/sidework
/plugin install sidework@sidework
```

Start a new session, then use `/sidework:sidework-init` or `/sidework:sidework-pr-watch`. If you used the earlier prototype, update the Sidework marketplace and plugin. The two skills above replace `setup-profile` and `find-contribution`.

### Codex

In a terminal, add the Sidework marketplace.

```sh
codex plugin marketplace add mager/sidework --ref plugin-v0.1.1
```

In the ChatGPT desktop app, open **Plugins**, choose the **Sidework** marketplace, and install **Sidework**. In a Codex CLI version that supports plugin installs, run `codex plugin add sidework@sidework`. Start a new session and use the skills picker or ask for `sidework-init` or `sidework-pr-watch` by name.

### OpenCode

With OpenCode 2, clone the tagged release.

```sh
git clone --branch plugin-v0.1.1 https://github.com/mager/sidework.git sidework-plugin
```

Add the absolute plugin directory to the existing `plugins` list in `~/.config/opencode/opencode.json` or `opencode.jsonc`.

```json
{
  "plugins": ["/absolute/path/sidework-plugin/plugins/sidework"]
}
```

Start a new session and ask it to load `sidework-init` or `sidework-pr-watch`.

## First run

1. Ask **“Use Sidework to add this repository as my project.”** You can also give it the public GitHub URL or `OWNER/REPO`.
2. Ask **“Show my recent upstream PRs and let me choose what to watch.”** Select by URL or `OWNER/REPO#NUMBER`. The GitHub account in `gh` must be the PR author. To stop watching one, ask Sidework to deselect it.
3. Ask **“What’s next on my selected open source PRs?”** Sidework checks inline review threads, submitted reviews, and PR conversation. It reports draft, open, merged, and closed states with links to the source.

## Run the review loop

First select at least one PR. A one-time check shows the current review queue. A recurring check shows each PR on the first run, then reports changes to its checked evidence or status. A failed check is shown as an error and can be retried.

- **Claude Code** — Run `/loop 15m Use the Sidework PR watch skill in poll mode and report the next action only when something changes or a check fails.` Keep that session open. To stop, ask Claude to cancel the loop. [Claude Code loop guide](https://code.claude.com/docs/en/scheduled-tasks)
- **Codex** — Create a scheduled task for a local project in the desktop app. Set the cadence and use the prompt below. Keep the computer and app running. [Codex scheduled task guide](https://learn.chatgpt.com/docs/automations?surface=app)
- **OpenCode** — Run the command below from the directory where the plugin is enabled. For recurring checks, run it every 15 minutes with your local scheduler, such as cron or Task Scheduler. Use the same local account and set the scheduler's PATH so it can find `opencode`, `node`, and `gh`. Stop by removing the scheduled entry. [OpenCode CLI guide](https://opencode.ai/docs/cli/)

Use this scheduled task prompt.

```text
Use the sidework-pr-watch skill in poll mode. Tell me the next action for each
changed PR. Include GitHub evidence links and report failed checks. When the
queue is quiet, skip the notification if the client supports it. Keep GitHub
read-only.
```

```sh
opencode run 'Use sidework-pr-watch in poll mode. Report next actions with GitHub links only for changed PRs, and report failed checks. Keep GitHub read-only.'
```

Run one recurring check per GitHub account. The local watch list and poll fingerprints are stored under `${XDG_CONFIG_HOME:-~/.config}/sidework/<GitHub numeric ID>/`. They contain project and PR references and hashes of checked evidence. Each check reads all review thread pages, the opening comment and latest ten comments per thread, and the latest 30 reviews and PR conversation comments. If a check omits older comments or shortens a long body, use the source link for full context.

## Optional Sidework profile draft

The two skills work with `gh` alone. To prepare a private profile draft, open [Sidework → Workbench → Agents](https://sidework.dev/workbench/#agents) with approved access and create an agent token. Enter it in Claude's optional **Sidework agent token** field or connect your client's MCP server using [the MCP setup guide](../../docs/agents.md). Keep the token out of chat. It expires within 24 hours.

Ask `sidework-init` to prepare the profile, choose up to six projects in order, then open the review link or file in Sidework. Choose **Save these projects** when the draft is ready. Approved accounts save it to private account storage. For a legacy session, it stays in that browser.

## Use the helper directly

From a checkout or an extracted release, run the helper at `plugins/sidework/bin/sidework.mjs`. For example:

```sh
node plugins/sidework/bin/sidework.mjs project add mager/sidework
node plugins/sidework/bin/sidework.mjs find
node plugins/sidework/bin/sidework.mjs list
node plugins/sidework/bin/sidework.mjs check
```

Run it with `--help` for all commands. Quote a PR reference like `'OWNER/REPO#NUMBER'` when you use it in a shell. Use `check` to reread the queue if a summary was interrupted after `poll` ran.

## Development

Run `npm test` and `npm run build` from the repository root. Validate Claude manifests with `claude plugin validate ./plugins/sidework` and `claude plugin validate .`. Test locally with `claude --plugin-dir ./plugins/sidework` or `codex plugin marketplace add .`. For OpenCode, add the absolute plugin directory to the `plugins` list, start OpenCode, and run `opencode api GET /api/skill` against the running server to check skill discovery.
