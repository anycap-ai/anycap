# Snapshot

Portable project handoff via a single AnyCap Drive share URL.

Use Snapshot when another agent, machine, or account needs a recoverable working set, not just a single file download.

## Commands

```bash
anycap snapshot create --target . --name repo
anycap snapshot restore 'https://drive.anycap.cloud/s/abc#password=secret' --target ./restored
```

## Create

`snapshot create`:

- packages one or more local targets into a single tar archive
- uploads it to Drive under `/_snapshots/{name}.snapshot.tar`
- creates a password-protected expiring share URL
- returns a restore command

Important behavior:

- `--target` is repeatable
- snapshot share expiration should be kept as short as practical
- unless the user explicitly asks otherwise, use `12h`
- if `--expires` is omitted, the CLI default is `12h`
- snapshot names are stable within `/_snapshots`
- same-name snapshots fail by default
- `--overwrite` intentionally replaces an existing same-name snapshot
- sensitive-file matches block create unless `--force` is set
- common technical directories like `node_modules`, `.git`, `.venv`, `dist`, `build`, and caches are skipped

Example:

```bash
anycap snapshot create --target . --target README.md --name repo --expires 12h
```

Typical output fields:

- `snapshot_name`
- `snapshot_url`
- `archive_name`
- `restore_command`
- `warnings`

## Restore

`snapshot restore`:

- parses `#password=...` locally
- converts the share URL into a raw download request
- sends `X-Anycap-Share-Password`
- restores the tar into the requested target directory

Example:

```bash
anycap snapshot restore 'https://drive.anycap.cloud/s/abc#password=secret' --target ./restored
```

Restore safety:

- target directory must be empty or not exist yet
- extraction rejects absolute paths
- extraction rejects `..` traversal
- extraction rejects symlinks, hardlinks, and other non-regular entries

## When To Use Snapshot vs Drive

Use Snapshot when:

- another agent needs the project state itself
- you want one self-contained restore URL
- multiple local targets must move together

Use Drive when:

- the human just needs a download link
- you are sharing one normal file or folder manually
