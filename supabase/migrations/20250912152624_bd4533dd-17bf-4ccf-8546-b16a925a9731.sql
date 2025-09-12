-- Create patients table
CREATE TABLE public.patients (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id TEXT NOT NULL UNIQUE,
  name TEXT NOT NULL,
  age INTEGER NOT NULL,
  gender TEXT NOT NULL CHECK (gender IN ('male', 'female', 'other')),
  phone TEXT,
  address TEXT,
  notes TEXT,
  profile_picture_url TEXT,
  date_of_registration DATE NOT NULL DEFAULT CURRENT_DATE,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create visit_notes table
CREATE TABLE public.visit_notes (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  visit_date DATE NOT NULL DEFAULT CURRENT_DATE,
  notes TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Create patient_files table
CREATE TABLE public.patient_files (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL REFERENCES public.patients(id) ON DELETE CASCADE,
  file_name TEXT NOT NULL,
  file_path TEXT NOT NULL,
  file_type TEXT NOT NULL,
  file_size BIGINT,
  uploaded_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable Row Level Security
ALTER TABLE public.patients ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.visit_notes ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_files ENABLE ROW LEVEL SECURITY;

-- Create policies (only authenticated users can access)
CREATE POLICY "Authenticated users can view patients" 
ON public.patients FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert patients" 
ON public.patients FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patients" 
ON public.patients FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patients" 
ON public.patients FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view visit_notes" 
ON public.visit_notes FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert visit_notes" 
ON public.visit_notes FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update visit_notes" 
ON public.visit_notes FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete visit_notes" 
ON public.visit_notes FOR DELETE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view patient_files" 
ON public.patient_files FOR SELECT USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert patient_files" 
ON public.patient_files FOR INSERT WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patient_files" 
ON public.patient_files FOR UPDATE USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patient_files" 
ON public.patient_files FOR DELETE USING (auth.uid() IS NOT NULL);

-- Create storage buckets
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-pictures', 'patient-pictures', false);
INSERT INTO storage.buckets (id, name, public) VALUES ('patient-documents', 'patient-documents', false);

-- Create storage policies
CREATE POLICY "Authenticated users can view patient pictures" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'patient-pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload patient pictures" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'patient-pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patient pictures" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'patient-pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patient pictures" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'patient-pictures' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can view patient documents" 
ON storage.objects FOR SELECT 
USING (bucket_id = 'patient-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can upload patient documents" 
ON storage.objects FOR INSERT 
WITH CHECK (bucket_id = 'patient-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patient documents" 
ON storage.objects FOR UPDATE 
USING (bucket_id = 'patient-documents' AND auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patient documents" 
ON storage.objects FOR DELETE 
USING (bucket_id = 'patient-documents' AND auth.uid() IS NOT NULL);

-- Create function to generate patient ID
CREATE OR REPLACE FUNCTION public.generate_patient_id()
RETURNS TEXT AS $$
DECLARE
  next_id INTEGER;
  patient_id TEXT;
BEGIN
  -- Get the next sequence number
  SELECT COALESCE(MAX(CAST(SUBSTRING(patient_id FROM 5) AS INTEGER)), 0) + 1
  INTO next_id
  FROM public.patients;
  
  -- Format as PAT-0001, PAT-0002, etc.
  patient_id := 'PAT-' || LPAD(next_id::TEXT, 4, '0');
  
  RETURN patient_id;
END;
$$ LANGUAGE plpgsql;

-- Create trigger to auto-generate patient ID
CREATE OR REPLACE FUNCTION public.trigger_generate_patient_id()
RETURNS TRIGGER AS $$
BEGIN
  IF NEW.patient_id IS NULL OR NEW.patient_id = '' THEN
    NEW.patient_id := public.generate_patient_id();
  END IF;
  RETURN NEW;
END;
$$ LANGUAGE plpgsql;

CREATE TRIGGER trigger_patients_generate_id
  BEFORE INSERT ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.trigger_generate_patient_id();

-- Create function to update timestamps
CREATE OR REPLACE FUNCTION public.update_updated_at_column()
RETURNS TRIGGER AS $$
BEGIN
  NEW.updated_at = now();
  RETURN NEW;
END;
$$ LANGUAGE plpgsql SET search_path = public;

-- Create trigger for automatic timestamp updates
CREATE TRIGGER update_patients_updated_at
  BEFORE UPDATE ON public.patients
  FOR EACH ROW
  EXECUTE FUNCTION public.update_updated_at_column();