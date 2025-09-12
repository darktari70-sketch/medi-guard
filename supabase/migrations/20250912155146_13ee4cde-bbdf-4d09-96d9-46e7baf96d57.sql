-- Add tables for Drug & Prescription Management, Follow-Up & Reminders, and Analytics

-- Medications table to store drug information
CREATE TABLE public.medications (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  drug_name TEXT NOT NULL,
  dosage TEXT NOT NULL,
  frequency TEXT NOT NULL,
  duration TEXT NOT NULL,
  instructions TEXT,
  start_date DATE NOT NULL DEFAULT CURRENT_DATE,
  end_date DATE,
  prescribed_by TEXT,
  status TEXT NOT NULL DEFAULT 'active' CHECK (status IN ('active', 'completed', 'discontinued')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Patient allergies table
CREATE TABLE public.patient_allergies (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  allergen TEXT NOT NULL,
  reaction TEXT,
  severity TEXT CHECK (severity IN ('mild', 'moderate', 'severe')),
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Appointments table for follow-up reminders
CREATE TABLE public.appointments (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  appointment_date DATE NOT NULL,
  appointment_time TIME,
  purpose TEXT,
  status TEXT NOT NULL DEFAULT 'scheduled' CHECK (status IN ('scheduled', 'completed', 'cancelled', 'no_show')),
  reminder_sent BOOLEAN DEFAULT false,
  notes TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Prescriptions table for generating prescription documents
CREATE TABLE public.prescriptions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  patient_id UUID NOT NULL,
  prescription_date DATE NOT NULL DEFAULT CURRENT_DATE,
  doctor_name TEXT NOT NULL,
  doctor_license TEXT,
  clinic_name TEXT,
  clinic_address TEXT,
  medication_ids UUID[] NOT NULL,
  additional_instructions TEXT,
  signature_path TEXT,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now(),
  updated_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Drug interactions table for flagging potential issues
CREATE TABLE public.drug_interactions (
  id UUID NOT NULL DEFAULT gen_random_uuid() PRIMARY KEY,
  drug_a TEXT NOT NULL,
  drug_b TEXT NOT NULL,
  interaction_type TEXT CHECK (interaction_type IN ('major', 'moderate', 'minor')),
  description TEXT NOT NULL,
  created_at TIMESTAMP WITH TIME ZONE NOT NULL DEFAULT now()
);

-- Enable RLS on all new tables
ALTER TABLE public.medications ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.patient_allergies ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.appointments ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.prescriptions ENABLE ROW LEVEL SECURITY;
ALTER TABLE public.drug_interactions ENABLE ROW LEVEL SECURITY;

-- Create RLS policies for medications
CREATE POLICY "Authenticated users can view medications" 
ON public.medications 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert medications" 
ON public.medications 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update medications" 
ON public.medications 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete medications" 
ON public.medications 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for patient allergies
CREATE POLICY "Authenticated users can view patient_allergies" 
ON public.patient_allergies 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert patient_allergies" 
ON public.patient_allergies 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update patient_allergies" 
ON public.patient_allergies 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete patient_allergies" 
ON public.patient_allergies 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for appointments
CREATE POLICY "Authenticated users can view appointments" 
ON public.appointments 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert appointments" 
ON public.appointments 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update appointments" 
ON public.appointments 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete appointments" 
ON public.appointments 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for prescriptions
CREATE POLICY "Authenticated users can view prescriptions" 
ON public.prescriptions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert prescriptions" 
ON public.prescriptions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update prescriptions" 
ON public.prescriptions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete prescriptions" 
ON public.prescriptions 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create RLS policies for drug interactions
CREATE POLICY "Authenticated users can view drug_interactions" 
ON public.drug_interactions 
FOR SELECT 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can insert drug_interactions" 
ON public.drug_interactions 
FOR INSERT 
WITH CHECK (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can update drug_interactions" 
ON public.drug_interactions 
FOR UPDATE 
USING (auth.uid() IS NOT NULL);

CREATE POLICY "Authenticated users can delete drug_interactions" 
ON public.drug_interactions 
FOR DELETE 
USING (auth.uid() IS NOT NULL);

-- Create triggers for updated_at columns
CREATE TRIGGER update_medications_updated_at
BEFORE UPDATE ON public.medications
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_patient_allergies_updated_at
BEFORE UPDATE ON public.patient_allergies
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_appointments_updated_at
BEFORE UPDATE ON public.appointments
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

CREATE TRIGGER update_prescriptions_updated_at
BEFORE UPDATE ON public.prescriptions
FOR EACH ROW
EXECUTE FUNCTION public.update_updated_at_column();

-- Insert some common drug interactions for demonstration
INSERT INTO public.drug_interactions (drug_a, drug_b, interaction_type, description) VALUES
('Warfarin', 'Aspirin', 'major', 'Increased risk of bleeding when used together'),
('Simvastatin', 'Amlodipine', 'moderate', 'May increase simvastatin levels and risk of muscle problems'),
('Metformin', 'Alcohol', 'moderate', 'May increase risk of lactic acidosis'),
('Lisinopril', 'Potassium supplements', 'major', 'May cause dangerously high potassium levels'),
('Digoxin', 'Furosemide', 'moderate', 'Furosemide may increase digoxin toxicity by causing low potassium');

-- Add additional fields to patients table for analytics
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS condition_diagnosis TEXT;
ALTER TABLE public.patients ADD COLUMN IF NOT EXISTS next_appointment_date DATE;