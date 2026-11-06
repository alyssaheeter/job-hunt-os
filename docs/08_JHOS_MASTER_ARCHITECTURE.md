# 🚀 ANTIGRAVITY MASTER CONSTRUCTION PROMPT

## PROJECT: Job Hunt Operating System (JHOS) – Sales Engineer GTM Engine

---

## 1. SYSTEM_OVERVIEW

Build a deterministic GTM-style job search system where:
* Candidate = Enterprise Product
* Applications = High-value B2B deals
* FACTS table = Truth authority
* Proof Pack = Anti-filter signal library
* OMST = Linguistic enforcement layer
* FitScore = Capital allocation engine
* Search Intensity = Operational KPI

Primary Target:
Senior / Principal Sales Engineer

Secondary:
RevOps / Revenue Systems Architect

Disqualifiers:
* Pure AE
* Base < 150000
* Travel > 40%
* Internal IT support
* Demo-only without discovery/architecture

## 2. ARCHITECTURE

Frontend:
* Firebase Hosting
* Firebase Auth

Backend:
* Cloud Run API (orchestration)
* Cloud Run Job (scheduled automation)

Storage:
* Firestore (state + logs)
* Google Sheets (FACTS + Proof Pack)
* Cloud Storage (artifacts)

AI:
* Vertex AI (Gemini 1.5 Pro)

Email:
* Gmail API (draft only)

Scheduler:
* Cloud Scheduler

## 3. REPO_STRUCTURE

```
/services
  /api
  /worker

/packages
  /shared
    /schemas
    /scoring
    /prompt_templates
  /renderers
    /docx

/templates
  /resume
    Template Resume (1).docx
    placeholder_map.json

/golden_dataset
/infra
/docs
```

## 4. DATA_MODEL

Firestore Collections:
* `tenants/{tenantId}`
* `canonical_profile/{tenantId}`
* `jobs/{jobId}`
* `scoring_runs/{runId}`
* `applications/{applicationId}`
* `materials/{materialId}`
* `communications/{commId}`
* `metrics_snapshots/{snapshotId}`
* `prompt_run_logs/{logId}`

Storage Paths:
* `gs://[BUCKET]/jd/{tenantId}/{jobId}/raw.txt`
* `gs://[BUCKET]/materials/{tenantId}/{applicationId}/resume.docx`
* `gs://[BUCKET]/proof_pack/{tenantId}/{artifactId}.pdf`

## 5. FACTS_TABLE_SCHEMA

Google Sheet columns:
* `fact_id`
* `outcome_metric`
* `mechanism`
* `scope`
* `tooling`
* `role`
* `tags`
* `verified`
* `proof_uri`
* `last_updated`

Rules:
* Only verified=true rows usable.
* Must include numeric outcome to qualify for resume bullets.

## 6. FACTS_TABLE_SEED (OMST NORMALIZED)

```json
[
  {
    "fact_id": "F001",
    "outcome_metric": "Secured $10M enterprise contract",
    "mechanism": "Positioned AI-optimized server architecture as primary vendor solution",
    "scope": "Top-tier airline infrastructure modernization initiative",
    "tooling": "AI server configurations, enterprise data center architecture",
    "role": "Client Solution Architect",
    "tags": ["enterprise", "ai", "infrastructure"],
    "verified": true
  },
  {
    "fact_id": "F002",
    "outcome_metric": "Increased revenue by $5M",
    "mechanism": "Exceeded sales targets through consultative network solution selling",
    "scope": "SMB portfolio across Chicago market",
    "tooling": "Salesforce CRM, AT&T solution portfolio",
    "role": "AT&T Sales Executive",
    "tags": ["sales", "network", "crm"],
    "verified": true
  },
  {
    "fact_id": "F003",
    "outcome_metric": "Improved infrastructure reliability by 30%",
    "mechanism": "Led data center modernization and server optimization initiatives",
    "scope": "Enterprise airline environment",
    "tooling": "Server architecture, cloud optimization tools",
    "role": "Client Solution Architect",
    "tags": ["cloud", "data_center"],
    "verified": true
  },
  {
    "fact_id": "F004",
    "outcome_metric": "Reduced manual legal operations by 40%",
    "mechanism": "Designed automated document and case-tracking workflows",
    "scope": "Multiple SMB law firms",
    "tooling": "Clio, AI automation tools",
    "role": "Independent Consultant",
    "tags": ["legaltech", "automation"],
    "verified": true
  },
  {
    "fact_id": "F005",
    "outcome_metric": "Increased deal closures by 30%",
    "mechanism": "Maintained disciplined Salesforce pipeline governance",
    "scope": "200+ business account portfolio",
    "tooling": "Salesforce CRM",
    "role": "Client Solution Executive",
    "tags": ["pipeline", "crm"],
    "verified": true
  },
  {
    "fact_id": "F006",
    "outcome_metric": "Improved customer retention by 20%",
    "mechanism": "Designed tailored enterprise network solutions aligned to business objectives",
    "scope": "Mid-market and enterprise accounts",
    "tooling": "SD-WAN, Dedicated Internet, UCaaS",
    "role": "Client Solution Executive",
    "tags": ["enterprise", "network"],
    "verified": true
  }
]
```
*(Additional OMST rows to be scaled in Google Sheets to ~100 atomic facts.)*

## 7. PROOF_PACK_SCHEMA

* `artifact_id`
* `type`
* `uri`
* `tags`
* `redaction_level`
* `allowed`

## 8. SCORING_ENGINE

Weighted rubric:
* Sales Engineer Fit: 30
* Compensation: 20
* Technical Depth: 15
* Deal Complexity: 10
* Remote: 10
* Revenue Scope: 10
* Industry: 5

Generation threshold: FitScore ≥ 80 required.

## 9. AGENT_TOPOLOGY

1. **Triage Architect**: JSON classification of JD against FitScore. Evaluates disqualifiers.
2. **Agent Suki**: Integrity and OMST generator. Synthesizes FACTS table data to match JD requirements and writes to DOM placeholders.
3. **Weekly Review Agent**: Search Intensity diagnostics and performance analysis.

## 10. VERTEX_AI_INTEGRATION

* Model: `gemini-1.5-pro` (Provides reliable reasoning & large context caching)
* Response MIME type: `application/json`
* Implementation: Strict JSON formatting via schema definitions.
* Abductive reasoning required before output to ensure fit to candidate "product".
* Retry once on schema violation, then log failure for human review.

## 11. CONTEXT_CACHING

Cache includes:
* OMST rules
* FACTS snapshot
* Proof Pack index
* Positioning
* Scoring rubric
Refresh Strategy: Cached context recreated monthly, saving ~50-80% on large input tokens.

## 12. DOCX_RENDERING

Replace:
* `{{PRO_SUMMARY}}`
* `{{INDEPENDENT_CONSULTANCY_BULLET_1-5}}`
* `{{AHEAD_BULLET_1-5}}`
* `{{ATT_CSE_BULLET_1-5}}`
* `{{ATT_B2B_BULLET_1-5}}`
* `{{SKILLS}}`

Validation Requirement: Before final artifact push, the payload is checked for zero unresolved placeholders (`{{...}}`).

## 13. WORKFLOWS

**Daily:**
* JD ingestion against FitScore engine.
* Follow-up scheduling generation (drafts).

**Weekly:**
* Review Agent summarizes velocity (roles evaluated, FitScores generated, conversion vs pass).

**Monthly:**
* Context cache refresh.
* Golden dataset regression evaluations against generated outputs.

## 14. IAM_AND_SECURITY

* Identity Provider: Firebase Authentication for tenant authorization.
* Principle of Least Privilege: GCP IAM limits Cloud Run Service Accounts strictly to Firestore (read/write), Vertex AI (invoke), and Cloud Storage (read/write to path).
* Secret Management: Google Secret Manager holds Gmail API client credentials and OAuth tokens. No secrets are stored in code or config files.

## 15. API_ENABLEMENT

* Endpoint Auth: All orchestration endpoints secured via Firebase Bearer tokens or Cloud Run invoked via IAM identity.
* Core Service Binding: `firebase.firestore`, `aiplatform.googleapis.com`, `run.googleapis.com`, `cloudscheduler.googleapis.com`.
* Invocation Limits: Triage and Generation APIs capped to reasonable quotas to prevent billing abuse.

## 16. ENVIRONMENT_VARIABLES

* `GCP_PROJECT_ID`: Target Google Cloud Project.
* `GCP_REGION`: (e.g., `us-central1`).
* `FIREBASE_CONFIG`: Project environment setup.
* `VERTEX_AI_MODEL`: Set to `gemini-1.5-pro`.
* `SHEETS_API_CREDENTIALS`: Scoped access string for FACTS SSOT.
* `GS_FACTS_SPREADSHEET_ID`: Primary sheet resource ID.

## 17. DEPLOYMENT_STEPS

1. **IaC Deployment**: Deploy GCP resources (Firestore, Buckets, Secret Manager).
2. **Backend Services**: Submit Cloud Build pipelines from `/services/api` to Google Cloud Run.
3. **Jobs & Scheduling**: Deploy `/services/worker` to Cloud Run Jobs; instantiate Cloud Scheduler for daily/weekly cadence.
4. **Static Frontend**: Publish via `firebase deploy --only hosting`.

## 18. MONITORING_AND_LOGGING

* **Logs**: Node.js structured logging routing cleanly into Cloud Logging payload fields.
* **FitScore KPIs**: Firestore aggregates metrics; Search Intensity alerts drop to operations console if output rate falls below target.
* **Alerting**: Pager alerts for Cloud Run 5xx spikes or >3 schema violation failures per hour.

## 19. REGRESSION_TESTING

* **Methodology**: Re-running `/golden_dataset` JDs against the current Agent Topology.
* **Evaluation**: Diff compares newly generated `{{..._BULLET_1-5}}` against the baseline. Must score ≥ 95% similarity in context parsing.
* **Rollbacks**: If logic drifts or FitScore diverges substantially on golden data, prompt parameters or app code is rolled back via GCP revision tags.

## 20. SEARCH_INTENSITY_ENGINE

* Measures: Ingested JD count vs Generatable FitScore JDs vs Submitted Applications.
* Target Matrix: Automatically tracks conversion funnels per week and prompts user when manual intervention or networking touchpoints is dropping beneath expected run rate.

## 21. FAILURE_MODES

* **Timeouts**: Strict 120s timeout on all AI API calls and docx rendering.
* **Data Scarcity**: If a matched required skill or gap has no validated OMST fact, Agent gracefully outputs `[FILL-IN]` for human finishing rather than hallucinating.
* **Retries**: Exponential backoff utilized for Gmail / Sheets API rate limits and Vertex AI 429 errors.

## 22. VERIFY_AND_SMOKETESTS

* **Startup Check**: Service initialization tests Vertex AI availability.
* **OMST Integrity Test**: Runs a dummy JD specifically requesting an unverified `fact_id` to ensure the filter drops it.
* **Draft Render Test**: Ingests fake payload and verifies resulting `application/vnd.openxmlformats-officedocument.wordprocessingml.document` has absolutely 0 unresolved `{{...}}` tags.
* **Outbound Comms Limit**: Mocks Gmail outbound; errors if the system attempts to execute `send()` instead of `createDraft()`.
