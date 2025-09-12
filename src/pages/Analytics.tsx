import { useEffect, useState } from 'react';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { supabase } from '@/integrations/supabase/client';
import { ChartContainer, ChartTooltip, ChartTooltipContent } from '@/components/ui/chart';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { Users, Calendar, Activity, TrendingUp } from 'lucide-react';

interface AnalyticsData {
  patientsPerMonth: any[];
  ageDistribution: any[];
  genderDistribution: any[];
  commonConditions: any[];
  totalStats: {
    totalPatients: number;
    totalAppointments: number;
    totalMedications: number;
    totalVisits: number;
  };
}

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--muted))'];

export default function Analytics() {
  const [data, setData] = useState<AnalyticsData | null>(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchAnalyticsData();
  }, []);

  const fetchAnalyticsData = async () => {
    try {
      // Fetch total statistics
      const [patientsResult, appointmentsResult, medicationsResult, visitsResult] = await Promise.all([
        supabase.from('patients').select('*', { count: 'exact' }),
        supabase.from('appointments').select('*', { count: 'exact' }),
        supabase.from('medications').select('*', { count: 'exact' }),
        supabase.from('visit_notes').select('*', { count: 'exact' }),
      ]);

      // Fetch patients data for charts
      const { data: patients } = await supabase
        .from('patients')
        .select('created_at, age, gender, condition_diagnosis');

      if (patients) {
        // Process patients per month
        const monthlyData = patients.reduce((acc: any, patient) => {
          const month = new Date(patient.created_at).toLocaleDateString('en-US', { 
            year: 'numeric', 
            month: 'short' 
          });
          acc[month] = (acc[month] || 0) + 1;
          return acc;
        }, {});

        const patientsPerMonth = Object.entries(monthlyData).map(([month, count]) => ({
          month,
          patients: count,
        }));

        // Process age distribution
        const ageGroups = patients.reduce((acc: any, patient) => {
          const ageGroup = patient.age < 18 ? 'Under 18' :
                          patient.age < 30 ? '18-29' :
                          patient.age < 50 ? '30-49' :
                          patient.age < 65 ? '50-64' : '65+';
          acc[ageGroup] = (acc[ageGroup] || 0) + 1;
          return acc;
        }, {});

        const ageDistribution = Object.entries(ageGroups).map(([group, count]) => ({
          group,
          count,
        }));

        // Process gender distribution
        const genderGroups = patients.reduce((acc: any, patient) => {
          acc[patient.gender] = (acc[patient.gender] || 0) + 1;
          return acc;
        }, {});

        const genderDistribution = Object.entries(genderGroups).map(([gender, count]) => ({
          gender,
          count,
        }));

        // Process common conditions
        const conditions = patients
          .filter(p => p.condition_diagnosis)
          .reduce((acc: any, patient) => {
            acc[patient.condition_diagnosis] = (acc[patient.condition_diagnosis] || 0) + 1;
            return acc;
          }, {});

        const commonConditions = Object.entries(conditions)
          .map(([condition, count]) => ({ condition, count }))
          .sort((a: any, b: any) => b.count - a.count)
          .slice(0, 10);

        setData({
          patientsPerMonth,
          ageDistribution,
          genderDistribution,
          commonConditions,
          totalStats: {
            totalPatients: patientsResult.count || 0,
            totalAppointments: appointmentsResult.count || 0,
            totalMedications: medicationsResult.count || 0,
            totalVisits: visitsResult.count || 0,
          },
        });
      }
    } catch (error) {
      console.error('Error fetching analytics data:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <div className="space-y-6">
        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
          {Array.from({ length: 4 }).map((_, i) => (
            <Card key={i}>
              <CardContent className="p-6">
                <div className="h-4 bg-muted rounded animate-pulse mb-2"></div>
                <div className="h-8 bg-muted rounded animate-pulse"></div>
              </CardContent>
            </Card>
          ))}
        </div>
      </div>
    );
  }

  if (!data) return null;

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-3xl font-bold">Analytics Dashboard</h1>
        <p className="text-muted-foreground">Practice insights and patient statistics</p>
      </div>

      {/* Summary Stats */}
      <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-4">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Patients</CardTitle>
            <Users className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalPatients}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Appointments</CardTitle>
            <Calendar className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalAppointments}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Active Medications</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalMedications}</div>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Total Visits</CardTitle>
            <TrendingUp className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{data.totalStats.totalVisits}</div>
          </CardContent>
        </Card>
      </div>

      {/* Charts */}
      <div className="grid gap-6 md:grid-cols-2">
        <Card>
          <CardHeader>
            <CardTitle>Patients Registered Per Month</CardTitle>
            <CardDescription>New patient registrations over time</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.patientsPerMonth}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="month" />
                  <YAxis />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="patients" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Age Distribution</CardTitle>
            <CardDescription>Patient age groups</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.ageDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ group, count }) => `${group}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.ageDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Gender Distribution</CardTitle>
            <CardDescription>Patient gender breakdown</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <PieChart>
                  <Pie
                    data={data.genderDistribution}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ gender, count }) => `${gender}: ${count}`}
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="count"
                  >
                    {data.genderDistribution.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                    ))}
                  </Pie>
                  <ChartTooltip content={<ChartTooltipContent />} />
                </PieChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Common Conditions</CardTitle>
            <CardDescription>Most frequently diagnosed conditions</CardDescription>
          </CardHeader>
          <CardContent>
            <ChartContainer config={{}} className="h-[300px]">
              <ResponsiveContainer width="100%" height="100%">
                <BarChart data={data.commonConditions} layout="horizontal">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" />
                  <YAxis dataKey="condition" type="category" width={100} />
                  <ChartTooltip content={<ChartTooltipContent />} />
                  <Bar dataKey="count" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </ChartContainer>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}