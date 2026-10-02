# Initial live Groq verification

October 1, 2026. Model: openai/gpt-oss-120b. Synthetic, assistant-authored development examples; not independently reviewed, not held-out evaluation, not medical validation.

The first live call using the old prompt incorrectly flagged an explicitly male individual as both male-default and pronoun-default. The scanner prompt was revised to define category boundaries explicitly and abstain when context is insufficient. Unverified citation instructions were removed because runtime validation already withholds those citations.

After the revision:

| Case | Expected | Observed | Wall time | Prompt tokens | Completion tokens (including reasoning) |
| --- | --- | --- | --- | --- | --- |
| specific-male | No findings | No findings | 682 ms | 623 | 142 |
| generic-pronoun | PRONOUN_DEFAULT | One matching finding | 833 ms | 613 | 270 |

Both responses passed runtime validation. These are single calls, not latency benchmarks. The prompt was tuned using these examples, so these results must never be represented as test-set accuracy. Exact input fixtures are in smoke-cases.json. No real patient data was submitted.

Next: expand development cases and collect separately reviewed examples covering other categories, clean passages, ambiguous context and adversarial instructions. Record prompt/model versions and source provenance. Live rewrite/addendum and full browser verification remain pending. Authentication, quotas, evidence validation and uncalibrated grades remain release work.
