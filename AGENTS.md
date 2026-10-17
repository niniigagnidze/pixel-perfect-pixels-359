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
