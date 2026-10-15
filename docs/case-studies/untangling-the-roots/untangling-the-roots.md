---
title: "Untangling the Roots"
subtitle: "Turning a 329-person Ancestry export into a verified, people-first knowledge graph"
tags: [genealogy, data-quality, graph, python, obsidian, firebase, ai-assisted]
status: draft
privacy: anonymized (no living people, no real names)
---

# Untangling the Roots

**One-line pitch:** I took a raw Ancestry GEDCOM export of my family and built a validated, people-first knowledge graph from it, then used scripts to find 30 ancestors the tree had silently lost.

> Companion builds: the family-history book portal and the maternal-line heritage portal.

## The problem

An Ancestry export is a flat file, not a usable research tool. Mine held **329 people, 100 families and 139 sources**. Imported as-is into a note-taking graph, it was unreadable: source citations, places and events outnumbered people, so the graph showed hubs instead of a family.

I wanted three things:

1. A graph where **only people and kinship edges** appear.
2. Every person labelled by how they relate to me.
3. Proof, by script, that the data was trustworthy.

## The build

| Layer | What I used | Why |
|---|---|---|
| Source of truth | GEDCOM 5.5.1 export | Portable and re-importable |
| Workspace | Obsidian vault plus the Charted Roots plugin | One note per person, linked by frontmatter |
| Cleanup | Deterministic Python scripts with a `--verify` mode | Re-runnable, never hand-edited |
| Graph | A people-only graph script | Hides citations and sources, keeps parent, child and spouse edges |
| Delivery | Two Firebase-hosted web portals | One per family line, with story submissions and fact corrections |

Every script has a read-only `--verify` mode that asserts an invariant (for example, "the graph contains kinship edges only and no hubs"). If the invariant breaks, the build fails.

## Labelling kinship

Each person gets one `kinship` value relative to the root person:

| Value | Count |
|---|---|
| collateral | 144 |
| ancestor | 110 |
| unlinked | 30 |
| by-marriage | 19 |
| in-law family | 14 |
| self | 1 |

That `unlinked` row is where the interesting problem was.

## The bug: 30 ancestors that "weren't related to anyone"

Thirty people had no path to the root, in two tidy clusters: one of 13 and one of 17. My first theory was a missing marriage connecting each cluster to the main tree.

I wrote a script to test that theory, parsing the GEDCOM, building the family graph and searching for off-root components. It disproved it:

- **The GEDCOM was fully connected: 329 of 329 people reached the root.** The source data was fine.
- Tracing paths showed both clusters were **direct ancestors**, five to six generations up on one side.
- The vault's links stopped one step short. Two people in the chain were **duplicate records**. Ancestry had stored one person twice, once with the parents attached and once without. My vault had linked to the copy without parents.

```
BEFORE                                   AFTER MERGE
Root -> parent -> grandparent            Root -> parent -> grandparent
         |                                        |
   great-grandparent (copy A, no parents)   great-grandparent (merged)
                                                  |
   great-grandparent (copy B, HAS parents)   -> 13 + 17 ancestors reconnected
```

The honest lesson: **a tag like `unlinked` can be right about your database and wrong about the family.** I only found that by checking the vault against an independent source.

## Judgement calls I deliberately did not automate

- **Merge candidate 1:** same name with a one-year birth gap. Strong match, likely merge.
- **Merge candidate 2:** same name with a **32-year** birth gap. A real conflict. The script flags it for a record check rather than guessing.

The script writes these to a review queue instead of changing notes. Automation finds the candidates and a human makes the call.

## Results

- 329 people validated against 100 family records.
- 30 hidden ancestors diagnosed, with a root cause and a merge plan.
- A repeatable `--verify` pipeline that keeps the graph people-only.
- Two family-facing web portals shipped.

## What I would do next

- Apply the approved merges and re-run kinship tagging; the 30 should become `ancestor`.
- Add a duplicate-detection pass at import time, so this class of bug is caught on day one.
- Publish a synthetic demo dataset so the method can be shown without any real family data.

## Skills demonstrated

Data quality and validation, graph modelling, Python tooling, hypothesis testing against ground truth, privacy-aware publishing, and AI-assisted development with human review gates.
