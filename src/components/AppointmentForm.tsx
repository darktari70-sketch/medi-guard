import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Calendar, Plus } from 'lucide-react';

interface AppointmentFormProps {
  patientId: string;
  onAppointmentAdded: () => void;
}

export default function AppointmentForm({ patientId, onAppointmentAdded }: AppointmentFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('appointments')
        .insert({
          patient_id: patientId,
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
        .eq('id', patientId);

      toast({
        title: "Success",
        description: "Appointment scheduled successfully",
      });

      e.currentTarget.reset();
      onAppointmentAdded();
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
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center space-x-2">
          <Calendar className="h-5 w-5 text-blue-500" />
          <span>Schedule Appointment</span>
        </CardTitle>
        <CardDescription>Schedule a follow-up appointment for this patient</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
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

          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Scheduling..." : "Schedule Appointment"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}