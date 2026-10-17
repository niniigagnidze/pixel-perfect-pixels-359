<!-- LOVABLE:BEGIN -->
> [!IMPORTANT]
> This project is connected to [Lovable](https://lovable.dev). Avoid rewriting
> published git history — force pushing, or rebasing/amending/squashing commits
> that are already pushed — as it rewrites history on Lovable's side and the
> user will likely lose their project history.
>
> Commits you push to the connected branch sync back to Lovable and show up in
> the editor, so keep the branch in a working state.
<!-- LOVABLE:END -->

- Keep Gemini credentials and prompt construction in server-only modules; the browser calls the same-origin streaming endpoint so keys never enter client bundles.
- Until patient authentication and clinical access policies exist, AI accepts only fixed sample IDs and constructs de-identified context server-side; never accept arbitrary clinical records from the browser.
- Generated clinical text remains a draft; no AI call creates diagnoses, prescriptions, approvals, or patient messages automatically.
- Parse Gemini SSE centrally and require a successful STOP finish before applying drafts, so split frames, refusals, and truncated responses cannot become completed clinical suggestions.
- Own the upstream Gemini response reader and handle cancellation both before and after headers; returning a raw fetch body lets normal disconnects escape the request handler.
- Keep the mock directory in dedicated read-only public mock tables with fixed fixture IDs and invalid-domain emails; demo personas never confer authorization or create Auth accounts.
- Load saved mock patients through a publishable-key server function and the root query loader into DemoProvider; persist demo mutations only via a strictly validated, size-capped server function scoped to the fixed sample patient IDs, and derive patient-portal views from the same shared patient state so doctor and patient sides stay in sync.
- Doctor–patient chat messages are append-only per sample patient via a dedicated validated server function and synced by polling with merge-by-id; record snapshot saves never write messages, so concurrent senders cannot overwrite each other.
- Partition sample conversations and queue completion by clinician; merge only the submitting clinician's clinical entries and reviews, using revision-checked writes so hospital updates cannot erase each other. Sample persona selection is not authorization.
