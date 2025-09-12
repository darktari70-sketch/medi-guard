import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import { supabase } from '@/integrations/supabase/client';
import { Input } from '@/components/ui/input';
import { Button } from '@/components/ui/button';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Badge } from '@/components/ui/badge';
import { Search, Eye, Phone, MapPin } from 'lucide-react';

interface Patient {
  id: string;
  patient_id: string;
  name: string;
  age: number;
  gender: string;
  phone: string | null;
  address: string | null;
  date_of_registration: string;
  profile_picture_url: string | null;
}

export default function PatientsList() {
  const [patients, setPatients] = useState<Patient[]>([]);
  const [filteredPatients, setFilteredPatients] = useState<Patient[]>([]);
  const [loading, setLoading] = useState(true);
  const [searchTerm, setSearchTerm] = useState('');

  useEffect(() => {
    fetchPatients();
  }, []);

  useEffect(() => {
    if (!searchTerm) {
      setFilteredPatients(patients);
    } else {
      const filtered = patients.filter(
        (patient) =>
          patient.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.patient_id.toLowerCase().includes(searchTerm.toLowerCase()) ||
          patient.phone?.includes(searchTerm)
      );
      setFilteredPatients(filtered);
    }
  }, [searchTerm, patients]);

  const fetchPatients = async () => {
    try {
      const { data, error } = await supabase
        .from('patients')
        .select('*')
        .order('created_at', { ascending: false });

      if (error) throw error;
      setPatients(data || []);
      setFilteredPatients(data || []);
    } catch (error) {
      console.error('Error fetching patients:', error);
    } finally {
      setLoading(false);
    }
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString();
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-3xl font-bold">Patients List</h1>
        </div>
        <div className="grid gap-4">
          {[...Array(6)].map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="space-y-2">
                  <div className="h-4 bg-muted rounded animate-pulse"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-3/4"></div>
                  <div className="h-3 bg-muted rounded animate-pulse w-1/2"></div>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="flex justify-between items-center">
        <div>
          <h1 className="text-3xl font-bold">Patients List</h1>
          <p className="text-muted-foreground">
            Manage and view all registered patients
          </p>
        </div>
        <Link to="/register">
          <Button>Register New Patient</Button>
        </Link>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-muted-foreground h-4 w-4" />
        <Input
          placeholder="Search by name, patient ID, or phone number..."
          value={searchTerm}
          onChange={(e) => setSearchTerm(e.target.value)}
          className="pl-10"
        />
      </div>

      {filteredPatients.length === 0 ? (
        <Card>
          <CardContent className="text-center py-8">
            <p className="text-muted-foreground">
              {searchTerm ? 'No patients found matching your search.' : 'No patients registered yet.'}
            </p>
            {!searchTerm && (
              <Link to="/register">
                <Button className="mt-4">Register First Patient</Button>
              </Link>
            )}
          </CardContent>
        </Card>
      ) : (
        <div className="grid gap-4">
          {filteredPatients.map((patient) => (
            <Card key={patient.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-6">
                <div className="flex items-start justify-between">
                  <div className="flex items-start space-x-4">
                    {patient.profile_picture_url ? (
                      <img
                        src={patient.profile_picture_url}
                        alt={patient.name}
                        className="w-12 h-12 rounded-full object-cover"
                      />
                    ) : (
                      <div className="w-12 h-12 rounded-full bg-muted flex items-center justify-center">
                        <span className="text-sm font-medium">
                          {patient.name.charAt(0).toUpperCase()}
                        </span>
                      </div>
                    )}
                    
                    <div className="space-y-1">
                      <div className="flex items-center space-x-2">
                        <h3 className="font-semibold text-lg">{patient.name}</h3>
                        <Badge variant="secondary">{patient.patient_id}</Badge>
                      </div>
                      
                      <div className="flex items-center space-x-4 text-sm text-muted-foreground">
                        <span>{patient.age} years old</span>
                        <span className="capitalize">{patient.gender}</span>
                        <span>Registered: {formatDate(patient.date_of_registration)}</span>
                      </div>
                      
                      {patient.phone && (
                        <div className="flex items-center space-x-1 text-sm">
                          <Phone className="h-3 w-3" />
                          <span>{patient.phone}</span>
                        </div>
                      )}
                      
                      {patient.address && (
                        <div className="flex items-center space-x-1 text-sm text-muted-foreground">
                          <MapPin className="h-3 w-3" />
                          <span className="truncate max-w-md">{patient.address}</span>
                        </div>
                      )}
                    </div>
                  </div>
                  
                  <Link to={`/patient/${patient.id}`}>
                    <Button variant="outline" size="sm">
                      <Eye className="h-4 w-4 mr-2" />
                      View Details
                    </Button>
                  </Link>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>
      )}
    </div>
  );
}