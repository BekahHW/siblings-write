name: Daily Session Analysis

on:
  schedule:
    - cron: "0 7 * * *"
  workflow_dispatch:

permissions:            # needed if you want to create issues
  contents: read
  issues: write

jobs:
  analyze:
    runs-on: ubuntu-latest
    steps:
      - uses: actions/checkout@v4

      - name: Install deps
        run: |
          sudo apt-get update
          sudo apt-get install -y jq curl
          npm install -g @continuedev/cli
          chmod +x daily-analysis.sh analyze-sessions.sh create-github-issues.sh

      - name: Run analysis
        env:
          # expose secrets as env vars (your script will use these)
          POSTHOG_API_KEY: ${{ secrets.POSTHOG_API_KEY }}
          POSTHOG_PROJECT_ID: ${{ secrets.POSTHOG_PROJECT_ID }}
          POSTHOG_HOST: https://us.posthog.com

          # repo info (if your scripts need them)
          GITHUB_OWNER: ${{ github.repository_owner }}
          GITHUB_REPO: ${{ github.event.repository.name }}

          # auth for GitHub CLI. gh will auto-use this.
          GH_TOKEN: ${{ github.token }}     # or secrets.GH_PAT if you prefer
        run: |
          ./daily-analysis.sh