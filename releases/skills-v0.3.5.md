fix(skills): align with cli v0.3.5 bug fixes

- Annotate: the CLI now embeds the bundled page.html instead of the
  Vite dev shell, so anycap annotate renders the real toolbar and
  canvas in fresh installs without a local make annotate-ui rebuild.
- Feishu local resume: clarify that "view or recover this conversation
  locally" only returns a codex resume <id> command and does NOT make
  the daemon resume that session on its next turn; "continue the local
  session" remains the explicit auto-resume verb.
- Feishu owned conversations: document that the daemon now replies in
  conversations it already owns without requiring an explicit binding;
  no skill-side action needed for users.

Assisted-by: YAAI <261597362+yaai-bot@users.noreply.github.com>
