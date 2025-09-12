import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus } from 'lucide-react';

interface MedicationFormProps {
  patientId: string;
  onMedicationAdded: () => void;
}

export default function MedicationForm({ patientId, onMedicationAdded }: MedicationFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('medications')
        .insert({
          patient_id: patientId,
          drug_name: formData.get('drug_name') as string,
          dosage: formData.get('dosage') as string,
          frequency: formData.get('frequency') as string,
          duration: formData.get('duration') as string,
          instructions: formData.get('instructions') as string,
          prescribed_by: formData.get('prescribed_by') as string,
          notes: formData.get('notes') as string,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Medication added successfully",
      });

      e.currentTarget.reset();
      onMedicationAdded();
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
        <CardTitle>Add New Medication</CardTitle>
        <CardDescription>Record prescribed medications for this patient</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="drug_name">Drug Name</Label>
              <Input id="drug_name" name="drug_name" required />
            </div>
            <div className="space-y-2">
              <Label htmlFor="dosage">Dosage</Label>
              <Input id="dosage" name="dosage" placeholder="e.g., 500mg" required />
            </div>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="frequency">Frequency</Label>
              <Select name="frequency" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select frequency" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="once_daily">Once daily</SelectItem>
                  <SelectItem value="twice_daily">Twice daily</SelectItem>
                  <SelectItem value="three_times_daily">Three times daily</SelectItem>
                  <SelectItem value="four_times_daily">Four times daily</SelectItem>
                  <SelectItem value="as_needed">As needed</SelectItem>
                  <SelectItem value="weekly">Weekly</SelectItem>
                  <SelectItem value="monthly">Monthly</SelectItem>
                </SelectContent>
              </Select>
            </div>
            <div className="space-y-2">
              <Label htmlFor="duration">Duration</Label>
              <Input id="duration" name="duration" placeholder="e.g., 7 days, 2 weeks" required />
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="prescribed_by">Prescribed By</Label>
            <Input id="prescribed_by" name="prescribed_by" placeholder="Doctor name" />
          </div>

          <div className="space-y-2">
            <Label htmlFor="instructions">Instructions</Label>
            <Textarea 
              id="instructions" 
              name="instructions" 
              placeholder="Take with food, before bedtime, etc."
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Additional notes or observations"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Medication"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}