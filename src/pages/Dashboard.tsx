import { useEffect, useState } from 'react';
import { supabase } from '@/integrations/supabase/client';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Users, UserPlus, FileText, Calendar } from 'lucide-react';

interface DashboardStats {
  totalPatients: number;
  newPatientsToday: number;
  totalFiles: number;
  totalVisits: number;
}

export default function Dashboard() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPatients: 0,
    newPatientsToday: 0,
    totalFiles: 0,
    totalVisits: 0,
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchDashboardStats();
  }, []);

  const fetchDashboardStats = async () => {
    try {
      // Get total patients
      const { count: totalPatients } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true });

      // Get new patients today
      const today = new Date().toISOString().split('T')[0];
      const { count: newPatientsToday } = await supabase
        .from('patients')
        .select('*', { count: 'exact', head: true })
        .eq('date_of_registration', today);

      // Get total files
      const { count: totalFiles } = await supabase
        .from('patient_files')
        .select('*', { count: 'exact', head: true });

      // Get total visits
      const { count: totalVisits } = await supabase
        .from('visit_notes')
        .select('*', { count: 'exact', head: true });

      setStats({
        totalPatients: totalPatients || 0,
        newPatientsToday: newPatientsToday || 0,
        totalFiles: totalFiles || 0,
        totalVisits: totalVisits || 0,
      });
    } catch (error) {
      console.error('Error fetching dashboard stats:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {[...Array(4)].map((_, i) => (
            <Card key={i}>
              <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
                <div className="h-4 bg-muted rounded animate-pulse"></div>
                <div className="h-4 w-4 bg-muted rounded animate-pulse"></div>
              </CardHeader>
              <CardContent>
                <div className="h-8 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-3 bg-muted rounded animate-pulse w-20"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Dashboard</h1>
        <p className="text-muted-foreground">
          Welcome to your patient management system
        </p>
      </div>

      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalPatients}</div>
            <p className="text-xs text-muted-foreground">
              Registered patients
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">New Today</CardTitle>
            <UserPlus className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.newPatientsToday}</div>
            <p className="text-xs text-muted-foreground">
              Registered today
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Files</CardTitle>
            <FileText className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalFiles}</div>
            <p className="text-xs text-muted-foreground">
              Uploaded files
            </p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{stats.totalVisits}</div>
            <p className="text-xs text-muted-foreground">
              Visit records
            </p>
          </CardContent>
        </Card>
      </div>

      <div className="grid gap-4 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Quick Actions</CardTitle>
            <CardDescription>Common tasks</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              • Register a new patient
            </div>
            <div className="text-sm">
              • View patient records
            </div>
            <div className="text-sm">
              • Add visit notes
            </div>
            <div className="text-sm">
              • Upload medical documents
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>System Features</CardTitle>
            <CardDescription>Available functionalities</CardDescription>
          </CardHeader>
          <CardContent className="space-y-2">
            <div className="text-sm">
              ✓ Secure authentication
            </div>
            <div className="text-sm">
              ✓ Patient data management
            </div>
            <div className="text-sm">
              ✓ File storage & retrieval
            </div>
            <div className="text-sm">
              ✓ Visit notes tracking
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}