import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Checkbox } from '@/components/ui/checkbox';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { FileText, Download } from 'lucide-react';

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: string;
}

interface PrescriptionGeneratorProps {
  patientId: string;
  patientName: string;
}

export default function PrescriptionGenerator({ patientId, patientName }: PrescriptionGeneratorProps) {
  const { toast } = useToast();
  const [medications, setMedications] = useState<Medication[]>([]);
  const [selectedMedications, setSelectedMedications] = useState<string[]>([]);
  const [loading, setLoading] = useState(false);

  useEffect(() => {
    fetchActiveMedications();
  }, [patientId]);

  const fetchActiveMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId)
        .eq('status', 'active')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setMedications(data || []);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch medications",
      });
    }
  };

  const handleMedicationToggle = (medicationId: string) => {
    setSelectedMedications(prev => 
      prev.includes(medicationId) 
        ? prev.filter(id => id !== medicationId)
        : [...prev, medicationId]
    );
  };

  const generatePrescription = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (selectedMedications.length === 0) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Please select at least one medication",
      });
      return;
    }

    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { data, error } = await supabase
        .from('prescriptions')
        .insert({
          patient_id: patientId,
          doctor_name: formData.get('doctor_name') as string,
          doctor_license: formData.get('doctor_license') as string,
          clinic_name: formData.get('clinic_name') as string,
          clinic_address: formData.get('clinic_address') as string,
          medication_ids: selectedMedications,
          additional_instructions: formData.get('additional_instructions') as string,
        })
        .select()
        .single();

      if (error) throw error;

      // Generate PDF (simplified for now - would integrate with a PDF library)
      generatePrescriptionPDF(data, selectedMedications);

      toast({
        title: "Success",
        description: "Prescription generated successfully",
      });

      e.currentTarget.reset();
      setSelectedMedications([]);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    } finally {
      setLoading(false);
    }
  };

  const generatePrescriptionPDF = (prescriptionData: any, medicationIds: string[]) => {
    // This is a simplified version - in a real app, you'd use a PDF library like jsPDF
    const selectedMeds = medications.filter(med => medicationIds.includes(med.id));
    
    const prescriptionText = `
PRESCRIPTION

Patient: ${patientName}
Date: ${new Date().toLocaleDateString()}
Doctor: ${prescriptionData.doctor_name}
License: ${prescriptionData.doctor_license}
Clinic: ${prescriptionData.clinic_name}
Address: ${prescriptionData.clinic_address}

MEDICATIONS:
${selectedMeds.map(med => `
• ${med.drug_name} - ${med.dosage}
  ${med.frequency}, ${med.duration}
  Instructions: ${med.instructions}
`).join('\n')}

Additional Instructions:
${prescriptionData.additional_instructions || 'None'}

Doctor's Signature: _________________
    `;

    // Create downloadable text file (in a real app, this would be a proper PDF)
    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${patientName}_${new Date().toISOString().split('T')[0]}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <FileText className="h-5 w-5 text-green-500" />
          <span>Generate Prescription</span>
        </CardTitle>
        <CardDescription>Create a printable prescription document</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={generatePrescription} className="space-y-6">
          {/* Doctor Information */}
          <div className="space-y-4">
            <h4 className="font-medium">Doctor Information</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="doctor_name">Doctor Name</Label>
                <Input id="doctor_name" name="doctor_name" required />
              </div>
              <div className="space-y-2">
                <Label htmlFor="doctor_license">License Number</Label>
                <Input id="doctor_license" name="doctor_license" />
              </div>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="clinic_name">Clinic Name</Label>
                <Input id="clinic_name" name="clinic_name" />
              </div>
              <div className="space-y-2">
                <Label htmlFor="clinic_address">Clinic Address</Label>
                <Input id="clinic_address" name="clinic_address" />
              </div>
            </div>
          </div>

          {/* Medication Selection */}
          <div className="space-y-4">
            <h4 className="font-medium">Select Medications</h4>
            {medications.length === 0 ? (
              <p className="text-muted-foreground">No active medications found</p>
            ) : (
              <div className="space-y-2">
                {medications.map((medication) => (
                  <div key={medication.id} className="flex items-start space-x-3 p-3 border rounded">
                    <Checkbox
                      id={medication.id}
                      checked={selectedMedications.includes(medication.id)}
                      onCheckedChange={() => handleMedicationToggle(medication.id)}
                    />
                    <div className="flex-1">
                      <Label htmlFor={medication.id} className="font-medium cursor-pointer">
                        {medication.drug_name} - {medication.dosage}
                      </Label>
                      <p className="text-sm text-muted-foreground">
                        {medication.frequency}, {medication.duration}
                      </p>
                      {medication.instructions && (
                        <p className="text-sm text-muted-foreground">
                          Instructions: {medication.instructions}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            )}
          </div>

          {/* Additional Instructions */}
          <div className="space-y-2">
            <Label htmlFor="additional_instructions">Additional Instructions</Label>
            <Textarea 
              id="additional_instructions" 
              name="additional_instructions" 
              placeholder="Any additional instructions for the patient"
              rows={3}
            />
          </div>

          <Button type="submit" disabled={loading || selectedMedications.length === 0}>
            <Download className="h-4 w-4 mr-2" />
            {loading ? "Generating..." : "Generate Prescription"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}