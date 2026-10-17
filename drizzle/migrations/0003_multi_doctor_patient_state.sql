ALTER TABLE public.mock_patients ADD COLUMN doctor_statuses jsonb NOT NULL DEFAULT '{}'::jsonb;
ALTER TABLE public.mock_patients ADD COLUMN revision integer NOT NULL DEFAULT 0;
UPDATE public.mock_patients SET doctor_statuses = jsonb_build_object('d1', jsonb_build_object('status', status, 'completedAt', completed_at));