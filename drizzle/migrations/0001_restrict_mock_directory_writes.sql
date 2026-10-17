REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.mock_users FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.mock_personas FROM anon, authenticated;
REVOKE INSERT, UPDATE, DELETE, TRUNCATE, REFERENCES, TRIGGER ON public.mock_patients FROM anon, authenticated;
GRANT SELECT ON public.mock_users, public.mock_personas, public.mock_patients TO anon, authenticated;
GRANT ALL ON public.mock_users, public.mock_personas, public.mock_patients TO service_role;