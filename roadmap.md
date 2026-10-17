# Gemini integration
- [x] Add secure Gemini streaming for sample patient summaries and doctor assistance.
- [x] Add generation, Stop, and error states without automatic clinical actions.
- [x] Test streaming and check the app; real records remain blocked from AI inputs until clinical accounts and record permissions exist.

# Mock-user backend
- [x] Create read-only mock users, persona assignments and sample patient records in Lovable Cloud.
- [x] Load the existing patient list from saved sample records without exposing real records or enabling public writes.
- [x] Test database access and the patient-search flow; distinguish sample users from sign-in accounts.

# Multi-hospital conversations
- [x] Separate patient conversations by doctor and hospital, including scoped unread state.
- [x] Ensure each hospital's doctor can manage their own patient queue and contribute to the combined record.
- [x] Verify persisted updates, cross-doctor chat isolation and hospital labels in both portals.