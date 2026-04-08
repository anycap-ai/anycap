# AnyCap CLI -- Sandbox Setup Guide

> Copy this prompt to your agent to set up AnyCap CLI in a sandboxed environment.

---

Please set up AnyCap CLI in this workspace. This environment does not persist the home directory across restarts, so we need to install locally and store config in the working directory.

## Step 1: Install or upgrade

Install or upgrade the CLI to the latest version:

```bash
npm install @anycap/cli@latest
```

This works for both first-time install and subsequent upgrades.

## Step 2: Set environment variables

Set these **before** using the CLI. They store config and credentials in the working directory instead of `~/.anycap`, and disable the OS keychain (ephemeral in sandboxes).

> Note: `ANYCAP_NO_KEYRING=1` is only needed in sandbox/container environments where the OS keychain is ephemeral. On normal machines (macOS, Windows, Linux desktop), do NOT set this -- the keychain is the more secure storage option and works automatically.

```bash
export ANYCAP_CONFIG_DIR=./.anycap
export ANYCAP_NO_KEYRING=1
```

## Step 3: Disable auto-update

The npm package pins a specific CLI version. Auto-update would download a binary outside `node_modules` that gets lost on sandbox restart. Disable it:

```bash
npx anycap config set auto_update false
```

## Step 4: Update skill files

Skill files teach you how to use each AnyCap capability. Download or update them to match the current CLI version:

```bash
npx anycap skill install
```

This creates or updates a `skills/anycap-cli/` directory with `SKILL.md` and detailed reference docs. Read `skills/anycap-cli/SKILL.md` when you need to use AnyCap capabilities.

## Step 5: Check login status and login if needed

```bash
npx anycap status
```

If the output shows you are logged in, skip to Step 6.

If not logged in, run the headless login flow:

```bash
npx anycap login --headless --no-wait --json
```

Read the JSON output, present the `verification_uri` and `user_code` to the human, and ask them to confirm when they've completed browser login. Then run:

```bash
npx anycap login poll --session <login_session_id> --json --wait
```

Credentials are stored in `./.anycap/credentials` and survive sandbox restarts.

## Step 6: Record setup in project files (first time only)

Skip this step if `AGENTS.md` already contains an "AnyCap CLI" section.

### Add to AGENTS.md

Add the following section to the project's `AGENTS.md` file (create the file if it doesn't exist):

````markdown
## AnyCap CLI

AnyCap CLI is installed locally via npm (`@anycap/cli`). Before using it, set these environment variables (sandbox only -- on normal machines, do NOT set `ANYCAP_NO_KEYRING`):

```bash
export ANYCAP_CONFIG_DIR=./.anycap
export ANYCAP_NO_KEYRING=1  # sandbox only: disable ephemeral OS keychain
```

These variables store config and credentials in the working directory's `.anycap/` folder, preventing loss on sandbox restart. `ANYCAP_NO_KEYRING=1` is only needed because sandboxes have ephemeral keychains. Auto-update is disabled -- the npm package manages the binary version.

**Usage:** `npx anycap <command>`

**Skill files:** Read `skills/anycap-cli/SKILL.md` for all available capabilities and usage examples.

**Update CLI and skills regularly** to get new capabilities and bug fixes:
```bash
npm install @anycap/cli@latest    # update CLI binary
npx anycap skill install          # update skill files to match new version
```

**Login status:** Credentials persist in `.anycap/credentials`. If `npx anycap status` shows not logged in, run the headless login flow:
```bash
npx anycap login --headless --no-wait --json
# Show the URL and code to the user, then after they confirm:
npx anycap login poll --session <session_id> --json --wait
```
````

### Add to .gitignore

If `.anycap/` is not already in `.gitignore`, add it to avoid committing credentials:

```bash
grep -qxF '.anycap/' .gitignore 2>/dev/null || echo '.anycap/' >> .gitignore
```

---

After completing all steps, confirm `npx anycap status` shows a logged-in state.
