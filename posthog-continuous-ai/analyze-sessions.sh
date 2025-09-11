#!/bin/bash
# analyze-sessions.sh
set -e

# Load .env if it exists (for local testing), otherwise use GitHub Actions environment
if [ -f .env ]; then
    source .env
fi

# Check for required environment variables
if [ -z "$POSTHOG_API_KEY" ] || [ -z "$POSTHOG_PROJECT_ID" ] || [ -z "$POSTHOG_HOST" ]; then
    echo "❌ Missing required environment variables"
    echo "POSTHOG_API_KEY: ${POSTHOG_API_KEY:+[SET]}"
    echo "POSTHOG_PROJECT_ID: ${POSTHOG_PROJECT_ID:+[SET]}"
    echo "POSTHOG_HOST: ${POSTHOG_HOST:+[SET]}"
    exit 1
fi

echo "🎬 Fetching session recordings from PostHog..."

# Fetch recent session recordings with potential issues
curl -s -H "Authorization: Bearer $POSTHOG_API_KEY" \
  "$POSTHOG_HOST/api/projects/$POSTHOG_PROJECT_ID/session_recordings/?limit=20" \
  | jq '.results[] | {
      id: .id,
      duration: .recording_duration,
      start_url: .start_url,
      click_count: .click_count,
      console_error_count: .console_error_count,
      person_distinct_id: .person.distinct_ids[0],
      start_time: .start_time
    }' > sessions.json

echo "📊 Found $(cat sessions.json | jq -s length) sessions"

# Filter for problematic sessions (errors or long durations)
cat sessions.json | jq -s 'map(select(.console_error_count > 0 or .recording_duration > 300))' > problem-sessions.json

echo "🚨 Found $(cat problem-sessions.json | jq length) problematic sessions"

# Analyze with Continue CLI
cat problem-sessions.json | cn -p "
Analyze these PostHog session recordings to identify user experience issues.

Each session contains:
- duration: how long the session lasted (in seconds)
- start_url: the page where the user started
- click_count: total number of clicks
- console_error_count: JavaScript errors encountered

Look for patterns that suggest code issues:

1. **High Error Sessions**: Sessions with console_error_count > 0
   - What pages/URLs are generating errors?
   - Are users abandoning after errors occur?

2. **Long Duration Sessions**: Sessions over 300 seconds (5+ minutes)
   - Are users struggling to complete tasks?
   - Low click count + high duration = user confusion

3. **Abandonment Patterns**:
   - Users starting on key pages but not progressing
   - Short sessions on important conversion pages

For each issue pattern you identify:
- Describe the user behavior problem
- Suggest likely technical causes (JS errors, slow loading, UI confusion)
- Recommend specific code areas to investigate
- Provide example fixes or improvements
- Priority: High (blocks user goals), Medium (hurts UX), Low (minor issue)

Focus on actionable technical improvements that will measurably improve user experience.
"

echo "✅ Analysis complete! Check the output above for optimization opportunities."