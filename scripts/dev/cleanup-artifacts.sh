#!/bin/sh
# Clean up all CI artifacts from main branch pipelines.
#
# Usage:
#   GITLAB_TOKEN=<your-personal-access-token> sh scripts/dev/cleanup-artifacts.sh
#
# The token needs "api" scope. Create one at:
#   https://gitlab.knoffice.tech/-/user_settings/personal_access_tokens

set -e

GITLAB_URL="https://gitlab.knoffice.tech"
PROJECT_ID="154"  # engineering/anycap
REF="main"

if [ -z "$GITLAB_TOKEN" ]; then
  echo "Error: GITLAB_TOKEN is required."
  echo "Usage: GITLAB_TOKEN=glpat-xxx sh $0"
  exit 1
fi

echo "Fetching pipelines on ref=$REF ..."

page=1
total_jobs=0

while true; do
  PIPELINES=$(curl -s --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
    "$GITLAB_URL/api/v4/projects/$PROJECT_ID/pipelines?ref=$REF&per_page=100&page=$page")

  # Check for empty page
  COUNT=$(echo "$PIPELINES" | grep -o '"id"' | wc -l | tr -d ' ')
  if [ "$COUNT" = "0" ]; then
    break
  fi

  PIPELINE_IDS=$(echo "$PIPELINES" | grep -o '"id":[0-9]*' | sed 's/"id"://')

  for pid in $PIPELINE_IDS; do
    echo "Pipeline #$pid:"

    jpage=1
    while true; do
      JOBS=$(curl -s --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
        "$GITLAB_URL/api/v4/projects/$PROJECT_ID/pipelines/$pid/jobs?per_page=100&page=$jpage")

      JCOUNT=$(echo "$JOBS" | grep -o '"id"' | wc -l | tr -d ' ')
      if [ "$JCOUNT" = "0" ]; then
        break
      fi

      # Only target jobs that have a downloadable archive (skip trace-only jobs)
      JOB_IDS=$(echo "$JOBS" | python3 -c "
import sys, json
jobs = json.load(sys.stdin)
for j in jobs:
    arts = j.get('artifacts', [])
    if any(a.get('file_type') != 'trace' for a in arts):
        print(j['id'])
" 2>/dev/null || echo "$JOBS" | grep -o '"id":[0-9]*' | sed 's/"id"://')

      for jid in $JOB_IDS; do
        HTTP_CODE=$(curl -s -o /dev/null -w '%{http_code}' --request DELETE \
          --header "PRIVATE-TOKEN: $GITLAB_TOKEN" \
          "$GITLAB_URL/api/v4/projects/$PROJECT_ID/jobs/$jid/artifacts")
        if [ "$HTTP_CODE" = "204" ]; then
          echo "  job #$jid -> deleted"
          total_jobs=$((total_jobs + 1))
        fi
      done

      jpage=$((jpage + 1))
    done
  done

  page=$((page + 1))
done

echo "Done. Deleted artifacts from $total_jobs jobs."
