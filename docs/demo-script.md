# EquiScan: recruiter walkthrough

Start at `/demo`. This prepared synthetic example needs no login, database, or AI request. Show the source quote, explanation, suggested edit, and local review decision. Explain that prepared results demonstrate the interface, not model accuracy.

Download a text fixture from the bottom of the demo. Open `/scan`, choose Paste, and paste its contents. Sign in with Google first if you want to save the result. Live requests consume provider quota and may return different findings.

| Step | Action | What it demonstrates |
| --- | --- | --- |
| 1 | Scan generic-pronoun.txt | Source-linked candidate finding and suggested edit |
| 2 | Open Workspace, then the saved document | Authenticated persistence without rerunning analysis |
| 3 | Expand the finding and accept or dismiss it | Human review stored separately from original findings |
| 4 | Refresh the saved audit | Persisted review decision |
| 5 | Scan inclusive-instructions.txt | A useful result may contain no findings |
| 6 | Explain limits | Synthetic development cases, unvalidated score, human review required |

For a real PDF upload, use the NHLBI sample linked in [attribution](attribution.md). Download the original and upload it; do not present it as a labeled bias dataset. On October 2, 2026 it extracted to 1,395 characters and returned zero findings in one live run.

Do not describe output as clinically validated, promise fixed model responses, or claim custom model training. PDF download automation, addendum quality, deletion, durable quotas, and production deployment remain release checks; see [verification](verification.md).
