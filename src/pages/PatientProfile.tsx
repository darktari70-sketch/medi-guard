import { useEffect, useState } from 'react';
import { useParams, Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { Textarea } from '@/components/ui/textarea';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Separator } from '@/components/ui/separator';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Edit, Save, Plus, Download, FileText, Calendar, Phone, MapPin, User, Pill, AlertTriangle, Clock } from 'lucide-react';
import MedicationForm from '@/components/MedicationForm';
import AllergyForm from '@/components/AllergyForm';
import AppointmentForm from '@/components/AppointmentForm';
import PrescriptionList from '@/components/PrescriptionList';

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string | null;
  address: string | null;
  notes: string | null;
  profile_picture_url: string | null;
  date_of_registration: string;
  condition_diagnosis: string | null;
  next_appointment_date: string | null;
}

interface VisitNote {
  id: string;
  visit_date: string;
  notes: string;
  created_at: string;
}

interface PatientFile {
  id: string;
  file_name: string;
  file_path: string;
  file_type: string;
  file_size: number;
  uploaded_at: string;
}

interface Medication {
  id: string;
  drug_name: string;
  dosage: string;
  frequency: string;
  duration: string;
  instructions: string;
  status: string;
  created_at: string;
}

interface Allergy {
  id: string;
  allergen: string;
  reaction: string;
  severity: string;
  notes: string;
}

interface Appointment {
  id: string;
  appointment_date: string;
  appointment_time: string;
  purpose: string;
  status: string;
  notes: string;
}

export default function PatientProfile() {
  const { id } = useParams<{ id: string }>();
  const { toast } = useToast();
  const [patient, setPatient] = useState<Patient | null>(null);
  const [visitNotes, setVisitNotes] = useState<VisitNote[]>([]);
  const [patientFiles, setPatientFiles] = useState<PatientFile[]>([]);
  const [medications, setMedications] = useState<Medication[]>([]);
  const [allergies, setAllergies] = useState<Allergy[]>([]);
  const [appointments, setAppointments] = useState<Appointment[]>([]);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [newVisitNote, setNewVisitNote] = useState('');
  const [newFiles, setNewFiles] = useState<FileList | null>(null);

  useEffect(() => {
    if (id) {
      fetchPatientData();
    }
  }, [id]);

  const fetchPatientData = async () => {
    try {
      // Fetch patient details
      const { data: patientData, error: patientError } = await supabase
        .from('patients')
        .select('*')
        .eq('id', id)
        .single();

      if (patientError) throw patientError;
      setPatient(patientData);

      // Fetch visit notes
      const { data: notesData, error: notesError } = await supabase
        .from('visit_notes')
        .select('*')
        .eq('patient_id', id)
        .order('visit_date', { ascending: false });

      if (notesError) throw notesError;
      setVisitNotes(notesData || []);

      // Fetch patient files
      const { data: filesData, error: filesError } = await supabase
        .from('patient_files')
        .select('*')
        .eq('patient_id', id)
        .order('uploaded_at', { ascending: false });

      if (filesError) throw filesError;
      setPatientFiles(filesData || []);

      // Fetch medications
      const { data: medicationsData, error: medicationsError } = await supabase
        .from('medications')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (medicationsError) throw medicationsError;
      setMedications(medicationsData || []);

      // Fetch allergies
      const { data: allergiesData, error: allergiesError } = await supabase
        .from('patient_allergies')
        .select('*')
        .eq('patient_id', id)
        .order('created_at', { ascending: false });

      if (allergiesError) throw allergiesError;
      setAllergies(allergiesData || []);

      // Fetch appointments
      const { data: appointmentsData, error: appointmentsError } = await supabase
        .from('appointments')
        .select('*')
        .eq('patient_id', id)
        .order('appointment_date', { ascending: true });

      if (appointmentsError) throw appointmentsError;
      setAppointments(appointmentsData || []);
    } catch (error) {
      console.error('Error fetching patient data:', error);
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to load patient data",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleUpdatePatient = async (e: React.FormEvent<HTMLFormElement>) => {
    e.preventDefault();
    if (!patient) return;

    try {
      const formData = new FormData(e.currentTarget);
      
      const { error } = await supabase
        .from('patients')
        .update({
          name: formData.get('name') as string,
          age: parseInt(formData.get('age') as string),
          phone: formData.get('phone') as string,
          address: formData.get('address') as string,
          notes: formData.get('notes') as string,
        })
        .eq('id', patient.id);

      if (error) throw error;

      toast({
        title: "Success",
        description: "Patient information updated successfully",
      });

      setEditing(false);
      fetchPatientData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleAddVisitNote = async () => {
    if (!newVisitNote.trim() || !patient) return;

    try {
      const { error } = await supabase
        .from('visit_notes')
        .insert({
          patient_id: patient.id,
          notes: newVisitNote,
        });

      if (error) throw error;

      toast({
        title: "Success",
        description: "Visit note added successfully",
      });

      setNewVisitNote('');
      fetchPatientData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleFileUpload = async () => {
    if (!newFiles || !patient) return;

    try {
      for (let i = 0; i < newFiles.length; i++) {
        const file = newFiles[i];
        const fileName = `${Date.now()}_${i}_${file.name}`;
        const filePath = `documents/${patient.id}/${fileName}`;

        const { error: uploadError } = await supabase.storage
          .from('patient-documents')
          .upload(filePath, file);

        if (uploadError) throw uploadError;

        await supabase
          .from('patient_files')
          .insert({
            patient_id: patient.id,
            file_name: file.name,
            file_path: filePath,
            file_type: file.type,
            file_size: file.size,
          });
      }

      toast({
        title: "Success",
        description: "Files uploaded successfully",
      });

      setNewFiles(null);
      fetchPatientData();
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: error.message,
      });
    }
  };

  const handleDownloadFile = async (filePath: string, fileName: string) => {
    try {
      const { data, error } = await supabase.storage
        .from('patient-documents')
        .download(filePath);

      if (error) throw error;

      const url = URL.createObjectURL(data);
      const a = document.createElement('a');
      a.href = url;
      a.download = fileName;
      a.click();
      URL.revokeObjectURL(url);
    } catch (error: any) {
      toast({
        variant: "destructive",
        title: "Error",
        description: "Failed to download file",
      });
    }
  };

  const formatFileSize = (bytes: number) => {
    if (bytes === 0) return '0 Bytes';
    const k = 1024;
    const sizes = ['Bytes', 'KB', 'MB', 'GB'];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex items-center space-x-4">
          <div className="h-8 w-8 bg-muted rounded animate-pulse"></div>
          <div className="h-8 bg-muted rounded animate-pulse w-48"></div>
        </div>
        <div className="grid gap-6 md:grid-cols-2">
          <Card>
            <CardContent className="p-6 space-y-4">
              <div className="h-4 bg-muted rounded animate-pulse"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-3/4"></div>
              <div className="h-4 bg-muted rounded animate-pulse w-1/2"></div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  if (!patient) {
    return (
      <div className="text-center py-8">
        <p className="text-muted-foreground">Patient not found</p>
        <Link to="/patients">
          <Button className="mt-4">Back to Patients List</Button>
        </Link>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div className="flex items-center space-x-4">
          <Link to="/patients">
            <Button variant="outline" size="sm">
              <ArrowLeft className="h-4 w-4 mr-2" />
              Back
            </Button>
          </Link>
          <div>
            <div className="flex items-center space-x-2">
              <h1 className="text-3xl font-bold">{patient.name}</h1>
              <Badge variant="secondary">{patient.patient_id}</Badge>
            </div>
            <p className="text-muted-foreground">Patient Profile</p>
          </div>
        </div>
        <Button
          onClick={() => setEditing(!editing)}
          variant={editing ? "secondary" : "default"}
        >
          <Edit className="h-4 w-4 mr-2" />
          {editing ? "Cancel" : "Edit"}
        </Button>
      </div>

      <Tabs defaultValue="details" className="space-y-6">
        <TabsList>
          <TabsTrigger value="details">Details</TabsTrigger>
          <TabsTrigger value="medications">
            <Pill className="h-4 w-4 mr-2" />
            Medications
          </TabsTrigger>
          <TabsTrigger value="allergies">
            <AlertTriangle className="h-4 w-4 mr-2" />
            Allergies
          </TabsTrigger>
          <TabsTrigger value="appointments">
            <Clock className="h-4 w-4 mr-2" />
            Appointments
          </TabsTrigger>
          <TabsTrigger value="visits">Visit Notes</TabsTrigger>
          <TabsTrigger value="files">Files</TabsTrigger>
          <TabsTrigger value="prescriptions">Prescriptions</TabsTrigger>
        </TabsList>

        <TabsContent value="details" className="space-y-6">
          <div className="grid gap-6 md:grid-cols-2">
            <Card>
              <CardHeader>
                <CardTitle>Patient Information</CardTitle>
                <CardDescription>
                  Personal details and contact information
                </CardDescription>
              </CardHeader>
              <CardContent>
                {editing ? (
                  <form onSubmit={handleUpdatePatient} className="space-y-4">
                    <div className="space-y-2">
                      <Label htmlFor="name">Full Name</Label>
                      <Input
                        id="name"
                        name="name"
                        defaultValue={patient.name}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="age">Age</Label>
                      <Input
                        id="age"
                        name="age"
                        type="number"
                        defaultValue={patient.age}
                        required
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="phone">Phone</Label>
                      <Input
                        id="phone"
                        name="phone"
                        defaultValue={patient.phone || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="address">Address</Label>
                      <Textarea
                        id="address"
                        name="address"
                        defaultValue={patient.address || ''}
                      />
                    </div>
                    <div className="space-y-2">
                      <Label htmlFor="notes">Notes</Label>
                      <Textarea
                        id="notes"
                        name="notes"
                        defaultValue={patient.notes || ''}
                      />
                    </div>
                    <Button type="submit">
                      <Save className="h-4 w-4 mr-2" />
                      Save Changes
                    </Button>
                  </form>
                ) : (
                  <div className="space-y-4">
                    <div className="flex items-center space-x-3">
                      <User className="h-4 w-4 text-muted-foreground" />
                      <span>{patient.age} years old, {patient.gender}</span>
                    </div>
                    {patient.phone && (
                      <div className="flex items-center space-x-3">
                        <Phone className="h-4 w-4 text-muted-foreground" />
                        <span>{patient.phone}</span>
                      </div>
                    )}
                    {patient.address && (
                      <div className="flex items-start space-x-3">
                        <MapPin className="h-4 w-4 text-muted-foreground mt-0.5" />
                        <span>{patient.address}</span>
                      </div>
                    )}
                    <div className="flex items-center space-x-3">
                      <Calendar className="h-4 w-4 text-muted-foreground" />
                      <span>Registered: {new Date(patient.date_of_registration).toLocaleDateString()}</span>
                    </div>
                    {patient.notes && (
                      <>
                        <Separator />
                        <div>
                          <h4 className="font-medium mb-2">Notes</h4>
                          <p className="text-sm text-muted-foreground whitespace-pre-wrap">
                            {patient.notes}
                          </p>
                        </div>
                      </>
                    )}
                  </div>
                )}
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle>Profile Picture</CardTitle>
                <CardDescription>Patient photo</CardDescription>
              </CardHeader>
              <CardContent>
                {patient.profile_picture_url ? (
                  <img
                    src={patient.profile_picture_url}
                    alt={patient.name}
                    className="w-48 h-48 rounded-lg object-cover mx-auto"
                  />
                ) : (
                  <div className="w-48 h-48 rounded-lg bg-muted flex items-center justify-center mx-auto">
                    <span className="text-4xl font-medium text-muted-foreground">
                      {patient.name.charAt(0).toUpperCase()}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="medications" className="space-y-6">
          <MedicationForm patientId={patient.id} onMedicationAdded={fetchPatientData} />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Current Medications</h3>
            {medications.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No medications recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              medications.map((medication) => (
                <Card key={medication.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{medication.drug_name}</h4>
                          <Badge variant={medication.status === 'active' ? 'default' : 'secondary'}>
                            {medication.status}
                          </Badge>
                        </div>
                        <p className="text-sm text-muted-foreground">
                          <span className="font-medium">Dosage:</span> {medication.dosage} • 
                          <span className="font-medium"> Frequency:</span> {medication.frequency} • 
                          <span className="font-medium"> Duration:</span> {medication.duration}
                        </p>
                        {medication.instructions && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Instructions:</span> {medication.instructions}
                          </p>
                        )}
                      </div>
                      <span className="text-xs text-muted-foreground">
                        {new Date(medication.created_at).toLocaleDateString()}
                      </span>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="allergies" className="space-y-6">
          <AllergyForm patientId={patient.id} onAllergyAdded={fetchPatientData} />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Known Allergies</h3>
            {allergies.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No allergies recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              allergies.map((allergy) => (
                <Card key={allergy.id}>
                  <CardContent className="p-4">
                    <div className="flex items-start space-x-3">
                      <AlertTriangle className={`h-5 w-5 mt-0.5 ${
                        allergy.severity === 'severe' ? 'text-red-500' :
                        allergy.severity === 'moderate' ? 'text-orange-500' : 'text-yellow-500'
                      }`} />
                      <div className="flex-1">
                        <div className="flex items-center space-x-2">
                          <h4 className="font-medium">{allergy.allergen}</h4>
                          <Badge variant={
                            allergy.severity === 'severe' ? 'destructive' :
                            allergy.severity === 'moderate' ? 'outline' : 'secondary'
                          }>
                            {allergy.severity}
                          </Badge>
                        </div>
                        {allergy.reaction && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Reaction:</span> {allergy.reaction}
                          </p>
                        )}
                        {allergy.notes && (
                          <p className="text-sm text-muted-foreground mt-1">
                            <span className="font-medium">Notes:</span> {allergy.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="appointments" className="space-y-6">
          <AppointmentForm patientId={patient.id} onAppointmentAdded={fetchPatientData} />
          
          <div className="space-y-4">
            <h3 className="text-lg font-semibold">Scheduled Appointments</h3>
            {appointments.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No appointments scheduled yet</p>
                </CardContent>
              </Card>
            ) : (
              appointments.map((appointment) => (
                <Card key={appointment.id}>
                  <CardContent className="p-4">
                    <div className="flex justify-between items-start">
                      <div className="space-y-2">
                        <div className="flex items-center space-x-2">
                          <Calendar className="h-4 w-4 text-muted-foreground" />
                          <span className="font-medium">
                            {new Date(appointment.appointment_date).toLocaleDateString()}
                          </span>
                          {appointment.appointment_time && (
                            <span className="text-muted-foreground">
                              at {appointment.appointment_time}
                            </span>
                          )}
                          <Badge variant={
                            appointment.status === 'scheduled' ? 'default' :
                            appointment.status === 'completed' ? 'secondary' :
                            appointment.status === 'cancelled' ? 'destructive' : 'outline'
                          }>
                            {appointment.status}
                          </Badge>
                        </div>
                        {appointment.purpose && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Purpose:</span> {appointment.purpose}
                          </p>
                        )}
                        {appointment.notes && (
                          <p className="text-sm text-muted-foreground">
                            <span className="font-medium">Notes:</span> {appointment.notes}
                          </p>
                        )}
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="visits" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Add New Visit Note</CardTitle>
              <CardDescription>Record a new visit or consultation</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Textarea
                placeholder="Enter visit notes..."
                value={newVisitNote}
                onChange={(e) => setNewVisitNote(e.target.value)}
                rows={4}
              />
              <Button onClick={handleAddVisitNote} disabled={!newVisitNote.trim()}>
                <Plus className="h-4 w-4 mr-2" />
                Add Visit Note
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {visitNotes.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No visit notes recorded yet</p>
                </CardContent>
              </Card>
            ) : (
              visitNotes.map((note) => (
                <Card key={note.id}>
                  <CardHeader>
                    <CardTitle className="text-lg">
                      Visit - {new Date(note.visit_date).toLocaleDateString()}
                    </CardTitle>
                    <CardDescription>
                      Recorded on {new Date(note.created_at).toLocaleString()}
                    </CardDescription>
                  </CardHeader>
                  <CardContent>
                    <p className="whitespace-pre-wrap">{note.notes}</p>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="files" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Upload New Files</CardTitle>
              <CardDescription>Add medical documents, reports, or images</CardDescription>
            </CardHeader>
            <CardContent className="space-y-4">
              <Input
                type="file"
                multiple
                accept=".pdf,.jpg,.jpeg,.png,.doc,.docx"
                onChange={(e) => setNewFiles(e.target.files)}
              />
              <Button 
                onClick={handleFileUpload} 
                disabled={!newFiles || newFiles.length === 0}
              >
                <Plus className="h-4 w-4 mr-2" />
                Upload Files
              </Button>
            </CardContent>
          </Card>

          <div className="space-y-4">
            {patientFiles.length === 0 ? (
              <Card>
                <CardContent className="text-center py-8">
                  <p className="text-muted-foreground">No files uploaded yet</p>
                </CardContent>
              </Card>
            ) : (
              patientFiles.map((file) => (
                <Card key={file.id}>
                  <CardContent className="p-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <FileText className="h-8 w-8 text-muted-foreground" />
                        <div>
                          <h4 className="font-medium">{file.file_name}</h4>
                          <div className="text-sm text-muted-foreground">
                            <span>{formatFileSize(file.file_size)}</span>
                            <span className="mx-2">•</span>
                            <span>Uploaded {new Date(file.uploaded_at).toLocaleDateString()}</span>
                          </div>
                        </div>
                      </div>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => handleDownloadFile(file.file_path, file.file_name)}
                      >
                        <Download className="h-4 w-4 mr-2" />
                        Download
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))
            )}
          </div>
        </TabsContent>

        <TabsContent value="prescriptions" className="space-y-6">
          <PrescriptionList patientId={patient.id} patientName={patient.name} />
        </TabsContent>
      </Tabs>
    </div>
  );
}