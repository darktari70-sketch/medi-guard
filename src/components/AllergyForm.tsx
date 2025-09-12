import { useState } from 'react';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { useToast } from '@/hooks/use-toast';
import { supabase } from '@/integrations/supabase/client';
import { Plus, AlertTriangle } from 'lucide-react';

interface AllergyFormProps {
  patientId: string;
  onAllergyAdded: () => void;
}

export default function AllergyForm({ patientId, onAllergyAdded }: AllergyFormProps) {
  const { toast } = useToast();
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    setLoading(true);

    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('patient_allergies')
        .insert({
          patient_id: patientId,
          allergen: formData.get('allergen') as string,
          reaction: formData.get('reaction') as string,
          severity: formData.get('severity') as string,
          notes: formData.get('notes') as string,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Allergy information added successfully",
      });

      e.currentTarget.reset();
      onAllergyAdded();
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
          <AlertTriangle className="h-5 w-5 text-orange-500" />
          <span>Add Allergy Information</span>
        </CardTitle>
        <CardDescription>Record known allergies and reactions</CardDescription>
      </CardHeader>
      <CardContent>
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="allergen">Allergen</Label>
              <Input 
                id="allergen" 
                name="allergen" 
                placeholder="e.g., Penicillin, Peanuts, Latex"
                required 
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="severity">Severity</Label>
              <Select name="severity" required>
                <SelectTrigger>
                  <SelectValue placeholder="Select severity" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="mild">Mild</SelectItem>
                  <SelectItem value="moderate">Moderate</SelectItem>
                  <SelectItem value="severe">Severe</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          <div className="space-y-2">
            <Label htmlFor="reaction">Reaction</Label>
            <Textarea 
              id="reaction" 
              name="reaction" 
              placeholder="Describe the allergic reaction (rash, swelling, difficulty breathing, etc.)"
              rows={2}
            />
          </div>

          <div className="space-y-2">
            <Label htmlFor="notes">Additional Notes</Label>
            <Textarea 
              id="notes" 
              name="notes" 
              placeholder="Any additional information about this allergy"
              rows={2}
            />
          </div>

          <Button type="submit" disabled={loading}>
            <Plus className="h-4 w-4 mr-2" />
            {loading ? "Adding..." : "Add Allergy"}
          </Button>
        </form>
      </CardContent>
    </Card>
  );
}