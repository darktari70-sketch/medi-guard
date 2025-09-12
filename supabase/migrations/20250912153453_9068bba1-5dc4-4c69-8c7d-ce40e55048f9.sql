-- Fix security warnings by setting search_path for functions
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TEXT
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
DECLARE
  next_id INTEGER;
  patient_id_result TEXT;
BEGIN
  -- Get the next sequence number by explicitly referencing the table column
  SELECT COALESCE(MAX(CAST(SUBSTRING(p.patient_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.patients p;
  
  -- Format as PAT-0001, PAT-0002, etc.
  patient_id_result := 'PAT-' || LPAD(next_id::TEXT, 4, '0');
  
  RETURN patient_id_result;
END;
$$;

CREATE OR REPLACE FUNCTION public.trigger_generate_patient_id()
RETURNS TRIGGER
LANGUAGE plpgsql
SECURITY DEFINER
SET search_path = public
AS $$
BEGIN
  IF NEW.patient_id IS NULL OR NEW.patient_id = '' THEN
    NEW.patient_id := public.generate_patient_id();
  END IF;
  RETURN NEW;
END;
$$;