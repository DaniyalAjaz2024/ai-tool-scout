# AI Tool Scout - GitHub Actions Workflows Guide

This directory is automated using three GitHub Actions workflows designed to run 100% within the GitHub Free tier (2,000 minutes/month).

---

## 1. Workflows Overview

| Workflow File | Trigger | Purpose | Free-Tier Consumption |
| :--- | :--- | :--- | :--- |
| `validate-catalogue.yml` | `push`, `pull_request` | Validates JSON schema, duplicate entries, runs security tests & builds static files. | ~20 seconds per push (~10 mins/month) |
| `scheduled-link-health.yml` | Weekly cron (`Sun 03:00 UTC`), `workflow_dispatch` | Checks official tool links conservatively; uploads link health markdown report. | ~1 minute per week (~4 mins/month) |
| `draft-content-generator.yml` | Manual `workflow_dispatch` | Scaffolds verified drafts and creates an editorial review Pull Request. | ~30 seconds per run on demand |

---

## 2. Editorial Policy & Guardrails

- **Zero Automatic Publishing**: No tool submission is ever auto-merged to `main`. Every candidate entry must be verified by a human editor.
- **Zero Hallucination / No Paid APIs Needed**: Draft scaffolding uses deterministic markdown templates (`templates/tool-submission-template.md`). Paid AI APIs are **NOT** required.
- **Optional Free AI Integration**: If you wish to use an LLM to generate initial summaries, you can add an optional free Gemini API key in GitHub Secrets as `GEMINI_API_KEY`. The core scripts operate seamlessly offline without it.

---

## 3. How to Enable, Disable, and Trigger Workflows

### Manual Triggering via GitHub Web Interface:
1. Navigate to your repository on GitHub.
2. Click the **Actions** tab at the top.
3. In the left sidebar, click the workflow you want to run (e.g. **Scheduled Link Health Monitor** or **Scaffolding Tool Draft**).
4. Click the **Run workflow** dropdown button on the right.
5. Provide parameters (if prompted) and click **Run workflow**.

### Disabling a Workflow:
1. In the **Actions** tab, select the workflow from the left sidebar.
2. Click the three dots (`...`) in the upper-right corner.
3. Select **Disable workflow**.

---

## 4. Troubleshooting Common Issues

### Issue 1: "Validation Failed: Duplicate ID or Slug"
- **Cause**: Two tools in `data/tools.json` share the same `id` or `slug`.
- **Fix**: Run `npm run validate` locally in PowerShell. The output will specify the exact line and tool index causing the conflict. Change the `id` and `slug` to be unique.

### Issue 2: "Link Health Checker returned 403 Forbidden"
- **Cause**: Many modern AI companies (such as OpenAI, Anthropic, Midjourney) employ Cloudflare Turnstile or DDoS bot challenges that block automated scripts.
- **Explanation**: The link checker specifically identifies `403` or `429` as "Live (Protected by Cloudflare/DDoS filter)" and records it as passing in the report.

### Issue 3: "create-pull-request failed with 403 Resource not accessible by integration"
- **Cause**: GitHub repository settings default to read-only permissions for `GITHUB_TOKEN`.
- **Fix**:
  1. Go to your repo **Settings** > **Actions** > **General**.
  2. Under **Workflow permissions**, select **Read and write permissions**.
  3. Check the box **Allow GitHub Actions to create and approve pull requests**.
  4. Click **Save**.
