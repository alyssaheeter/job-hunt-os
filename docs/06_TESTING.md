# 06: Testing & Validation

JobOS relies heavily on strictly enforced configuration and code logic. Testing consists of two layers: schema validation and unit testing.

## Local Workflow Testing
All standard tasks are encapsulated in NPM scripts which execute `Antigravity` workflows:
- `npm run docs`: Generate/update documentation.
- `npm run verify`: Validate schemas and properties.
- `npm run test`: Run the tests located in `tests/`.

### Smoke Testing
After deploying the backend via `npm run deploy`, verify core functionality:
1. Paste a mock URL into the Sidebar Ingest form to generate a **JOBS** row.
2. Tick the `DO_RESEARCH` checkbox. Wait for processing, then check the **RESEARCH** tab.
3. Tick the `DO_APPLY` checkbox. Check `OUTPUT_FOLDER_ID` for generated templates with test values and `[MISSING FACT]` triggers. Focus highly on the lack of hallucinated facts.

### Schema Validation
The `.agent/workflows/verify-schema.md` workflow validates your `SETTINGS` definition. Running `npm run verify` invokes this check to ensure no misconfigured application states.
