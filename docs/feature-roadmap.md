# Product feature roadmap

Updated October 6, 2026. Recommendations, not implemented features unless stated.

## Guest and account contract

Guest mode is a prepared preview: one fixed synthetic audit, temporary review decisions, sample JSON and text downloads. It has no live inference, private audit storage, generated addenda or PDF audit export. These restrictions follow the demo component and authenticated server routes, not a browser-only counter. A free account enables personal excerpts/PDF selections, private saved reviews, alternative rewrites, saved editorial addenda and PDF reports. Application usage caps were removed on request; provider limits still apply.

The demo must remain independent of authentication, database availability and inference. Do not present fixed guest findings as analysis of uploaded text. Signed-out visitors may prepare input in the scanner but must sign in before live analysis.

## Recommended sequence

1. Reviewer notes and decision rationale. Save an editable note per finding and optional reason for accepting/dismissing it. Include notes in exports. Creator-scoped RLS and reload tests are required. This records human judgment alongside model suggestions.
2. Revised-text preview and export. Let reviewers explicitly apply selected edits to a separate draft and view a word-level before/after comparison. Keep the original immutable; support undo. Use source offsets and reject overlapping or ambiguous replacements rather than replacing every matching phrase. No additional model call is required.
3. PDF source navigation and coverage. Persist selected page range and each finding's source location; clicking a finding navigates to its quoted passage. Report which pages were analyzed and omitted. This does not enable whole-textbook scanning or OCR.
4. Audit version comparison. Link a revised excerpt to its original audit and compare persisted findings as new, retained or no longer reported. Never label disappearance proof of improved clinical quality; LLM output can vary. Requires explicit version metadata and quote matching.
5. Reproducible evaluation dashboard. Expand permissioned, human-reviewed examples across the existing categories, legitimate male cases and insufficient context. Show false positives, missed labels, source-quote validity and latency with model/prompt versions and dataset size. Keep tuning and held-out cases separate. Synthetic smoke tests are not clinical validation.
6. Private library organisation. Tags, favourites and status filters with creator-only writes. Useful after review notes and edited drafts; do not add team invitations until there is a real collaboration need.

## Immediate release work

- Complete second-account production login and isolation checks.
- Keep the guest/account comparison and sign-in prompt clear.
- Preserve draft input across authentication using an explicit session-only option, with clear privacy copy; never silently retain sensitive source text in persistent local storage.
- Rename user-facing Workspace to My audits consistently if adopted.
- Verify keyboard focus, dialog dismissal and narrow-screen layout.

## Research supporting the direction

- Grammarly's editor connects suggestion cards to underlined text: https://support.grammarly.com/hc/en-us/articles/360003474732-Grammarly-Editor-user-guide
- Hypothesis supports private annotations and searchable annotation history: https://web.hypothes.is/help/annotation-basics/
- Hypothesis exports annotations to portable files: https://web.hypothes.is/help/exporting-and-importing-annotations/

These are product patterns, not evidence that EquiScan's findings are medically correct. The feature ordering is an engineering recommendation based on the current application.
