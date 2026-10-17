CREATE TABLE public.mock_users (
 id text PRIMARY KEY CHECK (id IN ('p1','p2','p3','p4','d1','d2','d3','family1','family2','family3')),
 display_name text NOT NULL,
 email text NOT NULL UNIQUE CHECK (email LIKE '%@example.invalid'),
 is_mock boolean NOT NULL DEFAULT true CHECK (is_mock = true)
);
GRANT SELECT ON public.mock_users TO anon, authenticated;
GRANT ALL ON public.mock_users TO service_role;
ALTER TABLE public.mock_users ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_users_read ON public.mock_users FOR SELECT TO anon, authenticated USING (is_mock = true);
COMMENT ON TABLE public.mock_users IS 'Public synthetic demo identities only. Not auth accounts; never store real people, credentials or clinical access permissions here.';
CREATE TABLE public.mock_personas (
 user_id text PRIMARY KEY REFERENCES public.mock_users(id),
 persona text NOT NULL CHECK (persona IN ('patient','doctor','family')),
 is_mock boolean NOT NULL DEFAULT true CHECK (is_mock = true)
);
GRANT SELECT ON public.mock_personas TO anon, authenticated;
GRANT ALL ON public.mock_personas TO service_role;
ALTER TABLE public.mock_personas ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_personas_read ON public.mock_personas FOR SELECT TO anon, authenticated USING (is_mock = true);
COMMENT ON TABLE public.mock_personas IS 'Demo labels only, never authorization roles. Real access must use authenticated user_roles and clinical policies.';
CREATE TABLE public.mock_patients (
 id text PRIMARY KEY REFERENCES public.mock_users(id) CHECK (id IN ('p1','p2','p3','p4')),
 assigned_doctor_id text NOT NULL REFERENCES public.mock_users(id),
 sample_ssn text NOT NULL UNIQUE,
 dob text NOT NULL,
 blood_type text NOT NULL,
 allergies jsonb NOT NULL DEFAULT '[]'::jsonb,
 status text NOT NULL DEFAULT 'pending' CHECK (status IN ('pending','done')),
 diagnoses jsonb NOT NULL DEFAULT '[]'::jsonb,
 prescriptions jsonb NOT NULL DEFAULT '[]'::jsonb,
 completed_at text,
 is_mock boolean NOT NULL DEFAULT true CHECK (is_mock = true)
);
GRANT SELECT ON public.mock_patients TO anon, authenticated;
GRANT ALL ON public.mock_patients TO service_role;
ALTER TABLE public.mock_patients ENABLE ROW LEVEL SECURITY;
CREATE POLICY mock_patients_read ON public.mock_patients FOR SELECT TO anon, authenticated USING (is_mock = true);
CREATE INDEX mock_patients_doctor_status_idx ON public.mock_patients(assigned_doctor_id, status);
COMMENT ON TABLE public.mock_patients IS 'Public fictional patient fixtures. No anonymous or authenticated writes; UI edits are session-only until clinical authentication exists.';
INSERT INTO public.mock_users (id,display_name,email) VALUES
('p1','Ana Beridze','ana@example.invalid'),
('p2','Davit Javakhishvili','davit@example.invalid'),
('p3','Nino Chkheidze','nino@example.invalid'),
('p4','Irakli Maisuradze','irakli@example.invalid'),
('d1','Dr. Giorgi Kapanadze','giorgi@example.invalid'),
('d2','Dr. Nika Tsiklauri','nika@example.invalid'),
('d3','Dr. Mariam Lomidze','mariam@example.invalid'),
('family1','Levan Beridze','levan@example.invalid'),
('family2','Mari Beridze','mari@example.invalid'),
('family3','Tamar Gelashvili','tamar@example.invalid');
INSERT INTO public.mock_personas (user_id,persona) VALUES ('p1','patient'),('p2','patient'),('p3','patient'),('p4','patient'),('d1','doctor'),('d2','doctor'),('d3','doctor'),('family1','family'),('family2','family'),('family3','family');
INSERT INTO public.mock_patients (id,assigned_doctor_id,sample_ssn,dob,blood_type,allergies,status,diagnoses,prescriptions,completed_at) VALUES
('p1','d1','01024056789','14 Mar 1979','A+','["Penicillin (severe)","Pollen"]','pending','[{"name":"Mild hypercholesterolemia","note":"Diet + statin.","date":"12 Feb 2026","by":"Dr. Giorgi Kapanadze"}]','[{"name":"Atorvastatin 10 mg","dose":"Once daily, evening","date":"12 Feb 2026","by":"Dr. Giorgi Kapanadze"}]',NULL),
('p2','d1','01017033412','02 Jul 1990','O+','[]','pending','[]','[]',NULL),
('p3','d1','01008022987','21 Nov 1965','B-','["Sulfonamides"]','pending','[]','[]',NULL),
('p4','d1','01030011245','09 Jan 1984','AB+','[]','done','[{"name":"No thyroid disease","note":"Routine check normal.","date":"11 Oct 2026","by":"Dr. Giorgi Kapanadze"}]','[]','11 Oct 2026, 10:10');