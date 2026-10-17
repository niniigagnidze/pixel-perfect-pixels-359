ALTER TABLE public.mock_patients ADD COLUMN finding_reviews jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.mock_patients ADD COLUMN messages jsonb;
GRANT ALL ON public.mock_patients TO service_role;