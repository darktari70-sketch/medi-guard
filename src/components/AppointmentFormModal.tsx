import { useState, useEffect } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Dialog, DialogContent, DialogDescription, DialogHeader, DialogTitle } from '@/components/ui/dialog';
import { useToast } from '@/components/ui/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Plus } from 'lucide-react';

interface Patient {
  id: string;
  name: string;
  patient_id: string;
}

interface AppointmentFormModalProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  onSuccess: () => void;
}

export default function AppointmentFormModal({ open, onOpenChange, onSuccess }: AppointmentFormModalProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);
  const [patients, setPatients] = useState<Patient[]>([]);
  const [selectedPatientId, setSelectedPatientId] = useState<string>('');

  useEffect(() => {
    if (open) {
      fetchPatients();
    }
  }, [open]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('id, name, patient_id')
        .order('name');

      if (error) throw error;
      setPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    }
  };

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: selectedPatientId,
          appointment_date: formData.get('appointment_date') as string,
          appointment_time: formData.get('appointment_time') as string,
          purpose: formData.get('purpose') as string,
          notes: formData.get('notes') as string,
        });

      if (error) throw error;

      // Also update the patient's next_appointment_date
      await supabase
        .from('patients')
        .update({
          next_appointment_date: formData.get('appointment_date') as string,
        })
        .eq('id', selectedPatientId);

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });

      onSuccess();
      onOpenChange(false);
      e.currentTarget.reset();
      setSelectedPatientId('');
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

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="sm:max-w-md">
        <DialogHeader>
          <DialogTitle className="flex items-center space-x-2">
            <Calendar className="h-5 w-5 text-blue-500" />
            <span>Schedule Appointment</span>
          </DialogTitle>
          <DialogDescription>Schedule a new appointment for a patient</DialogDescription>
        </DialogHeader>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="space-y-2">
            <Label htmlFor="patient">Patient</Label>
            <Select value={selectedPatientId} onValueChange={setSelectedPatientId} required>
              <SelectTrigger>
                <SelectValue placeholder="Select a patient" />
              </SelectTrigger>
              <SelectContent>
                {patients.map((patient) => (
                  <SelectItem key={patient.id} value={patient.id}>
                    {patient.name} ({patient.patient_id})
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="appointment_date">Date</Label>
              <Input 
                id="appointment_date" 
                name="appointment_date" 
                type="date"
                min={new Date().toISOString().split('T')[0]}
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="appointment_time">Time</Label>
              <Input 
                id="appointment_time" 
                name="appointment_time" 
                type="time"
              />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="purpose">Purpose</Label>
            <Input 
              id="purpose" 
              name="purpose" 
              placeholder="e.g., Follow-up, Check-up, Consultation"
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Any additional notes for this appointment"
              rows={2}
            />
          </div>

          <div className="flex justify-end gap-2">
            <Button type="button" variant="outline" onClick={() => onOpenChange(false)}>
              Cancel
            </Button>
            <Button type="submit" disabled={loading || !selectedPatientId}>
              <Plus className="h-4 w-4 mr-2" />
              {loading ? "Scheduling..." : "Schedule Appointment"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}