import { useState, useEffect } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Badge } from '@/components/ui/badge';
import { useToast } from '@/components/ui/use-toast';
import { Download, FileText, Calendar, User } from 'lucide-react';
import PrescriptionGenerator from '@/components/PrescriptionGenerator';

interface Prescription {
  id: string;
  prescription_date: string;
  doctor_name: string;
  doctor_license: string | null;
  clinic_name: string | null;
  clinic_address: string | null;
  medication_ids: string[];
  additional_instructions: string | null;
  created_at: string;
}

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
}

interface PrescriptionListProps {
  patientId: string;
  patientName: string;
}

export default function PrescriptionList({ patientId, patientName }: PrescriptionListProps) {
  const [prescriptions, setPrescriptions] = useState<Prescription[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  useEffect(() => {
    fetchPrescriptions();
    fetchMedications();
  }, [patientId]);

  const fetchPrescriptions = async () => {
    try {
      const { data, error } = await supabase
        .from('prescriptions')
        .select('*')
        .eq('patient_id', patientId)
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPrescriptions(data || []);
    } catch (error) {
      console.error('Error fetching prescriptions:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to fetch prescriptions.",
      });
    } finally {
      setLoading(false);
    }
  };

  const fetchMedications = async () => {
    try {
      const { data, error } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', patientId);

      if (error) throw error;
      setMedications(data || []);
    } catch (error) {
      console.error('Error fetching medications:', error);
    }
  };

  const getMedicationDetails = (medicationIds: string[]) => {
    return medications.filter(med => medicationIds.includes(med.id));
  };

  const regeneratePrescriptionPDF = (prescription: Prescription) => {
    const prescriptionMeds = getMedicationDetails(prescription.medication_ids);
    
    const prescriptionText = `
PRESCRIPTION

Patient: ${patientName}
Date: ${new Date(prescription.prescription_date).toLocaleDateString()}
Doctor: ${prescription.doctor_name}
${prescription.doctor_license ? `License: ${prescription.doctor_license}` : ''}
${prescription.clinic_name ? `Clinic: ${prescription.clinic_name}` : ''}
${prescription.clinic_address ? `Address: ${prescription.clinic_address}` : ''}

MEDICATIONS:
${prescriptionMeds.map(med => `
• ${med.drug_name} - ${med.dosage}
  ${med.frequency}, ${med.duration}
  Instructions: ${med.instructions}
`).join('\n')}

${prescription.additional_instructions ? `Additional Instructions:\n${prescription.additional_instructions}` : ''}

Doctor's Signature: _________________
    `;

    const blob = new Blob([prescriptionText], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `prescription_${patientName}_${prescription.prescription_date}.txt`;
    a.click();
    URL.revokeObjectURL(url);
  };

  if (loading) {
    return (
      <div className="space-y-4">
        <div className="h-32 bg-muted rounded animate-pulse"></div>
        <div className="h-32 bg-muted rounded animate-pulse"></div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PrescriptionGenerator 
        patientId={patientId} 
        patientName={patientName}
        onPrescriptionGenerated={fetchPrescriptions}
      />
      
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="h-5 w-5" />
            Previous Prescriptions
          </CardTitle>
          <CardDescription>
            All generated prescriptions for this patient
          </CardDescription>
        </CardHeader>
        <CardContent>
          {prescriptions.length === 0 ? (
            <p className="text-muted-foreground text-center py-8">
              No prescriptions generated yet
            </p>
          ) : (
            <div className="space-y-4">
              {prescriptions.map((prescription) => (
                <div key={prescription.id} className="border rounded-lg p-4">
                  <div className="flex items-start justify-between">
                    <div className="space-y-2">
                      <div className="flex items-center gap-2">
                        <Calendar className="h-4 w-4" />
                        <span className="font-medium">
                          {new Date(prescription.prescription_date).toLocaleDateString()}
                        </span>
                        <Badge variant="outline">
                          {prescription.medication_ids.length} medication(s)
                        </Badge>
                      </div>
                      
                      <div className="flex items-center gap-2">
                        <User className="h-4 w-4" />
                        <span className="text-sm">Dr. {prescription.doctor_name}</span>
                        {prescription.clinic_name && (
                          <span className="text-sm text-muted-foreground">
                            • {prescription.clinic_name}
                          </span>
                        )}
                      </div>

                      {prescription.additional_instructions && (
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Instructions:</span> {prescription.additional_instructions}
                        </p>
                      )}

                      <div className="pt-2">
                        <p className="text-sm font-medium mb-1">Medications:</p>
                        <div className="grid gap-1">
                          {getMedicationDetails(prescription.medication_ids).map((med) => (
                            <div key={med.id} className="text-sm text-muted-foreground">
                              • {med.drug_name} - {med.dosage} ({med.frequency})
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                    
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => regeneratePrescriptionPDF(prescription)}
                    >
                      <Download className="h-4 w-4 mr-2" />
                      Download
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}