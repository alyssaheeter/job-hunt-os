---
description: Prepare and create a new repository release
---

1. Verify all tests and schema validations pass via `verify-schema.md` and `run-tests.md`.
2. Update the `version` field in `package.json` to the target version.
3. Summarize changes in the `README.md` or a `CHANGELOG.md`.
// turbo
4. Run standard shell commands to commit changes (`git add .`, `git commit -m "Release v[VERSION]"`).
5. Prepare a standard release tag (e.g. `job-os-alyssa-v[VERSION]`).
