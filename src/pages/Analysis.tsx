import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar } from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Filter } from 'lucide-react';

const Analysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterDepartment, setFilterDepartment] = useState<string>('all');

  useEffect(() => {
    if (!user) {
      navigate('/login');
      return;
    }
    loadResponses();
  }, [user, navigate]);

  const loadResponses = async () => {
    try {
      const q = query(collection(db, 'responses'));
      const querySnapshot = await getDocs(q);
      const data = querySnapshot.docs.map(doc => ({
        id: doc.id,
        ...doc.data()
      }));
      setResponses(data);
    } catch (error) {
      console.error('Error loading responses:', error);
    } finally {
      setLoading(false);
    }
  };

  // Sample comparative data
  const comparisonData = [
    { name: 'Gen', reparto_A: 78, reparto_B: 85, reparto_C: 82 },
    { name: 'Feb', reparto_A: 82, reparto_B: 88, reparto_C: 79 },
    { name: 'Mar', reparto_A: 85, reparto_B: 90, reparto_C: 86 },
    { name: 'Apr', reparto_A: 88, reparto_B: 87, reparto_C: 89 },
  ];

  const radarData = [
    { subject: 'Qualità', A: 85, B: 90, fullMark: 100 },
    { subject: 'Puntualità', A: 90, B: 85, fullMark: 100 },
    { subject: 'Collaborazione', A: 88, B: 92, fullMark: 100 },
    { subject: 'Autonomia', A: 82, B: 88, fullMark: 100 },
    { subject: 'Innovazione', A: 78, B: 85, fullMark: 100 },
  ];

  const performanceData = [
    { worker: 'Mario R.', score: 92 },
    { worker: 'Laura B.', score: 88 },
    { worker: 'Giovanni P.', score: 85 },
    { worker: 'Sara M.', score: 90 },
    { worker: 'Andrea T.', score: 87 },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4">
          <Button variant="ghost" size="sm" onClick={() => navigate('/dashboard')}>
            <ArrowLeft className="h-4 w-4 mr-2" />
            Torna alla Dashboard
          </Button>
        </div>
      </header>

      <main className="container mx-auto px-4 py-6 space-y-6">
        <div className="flex flex-col md:flex-row justify-between items-start md:items-center gap-4">
          <div>
            <h1 className="text-3xl font-bold">Analisi e Confronto</h1>
            <p className="text-muted-foreground">Confronta le risposte e analizza i trend</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterDepartment} onValueChange={setFilterDepartment}>
              <SelectTrigger className="w-full md:w-[200px]">
                <SelectValue placeholder="Filtra per reparto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti i reparti</SelectItem>
                <SelectItem value="it">IT</SelectItem>
                <SelectItem value="hr">HR</SelectItem>
                <SelectItem value="sales">Vendite</SelectItem>
                <SelectItem value="marketing">Marketing</SelectItem>
              </SelectContent>
            </Select>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle>Trend Temporale per Reparto</CardTitle>
              <CardDescription>Confronto performance negli ultimi mesi</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={comparisonData}>
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis dataKey="name" />
                  <YAxis />
                  <Tooltip />
                  <Legend />
                  <Line type="monotone" dataKey="reparto_A" stroke="hsl(var(--primary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="reparto_B" stroke="hsl(var(--secondary))" strokeWidth={2} />
                  <Line type="monotone" dataKey="reparto_C" stroke="hsl(var(--accent))" strokeWidth={2} />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Performance Individuale</CardTitle>
              <CardDescription>Top 5 lavoratori per punteggio</CardDescription>
            </CardHeader>
            <CardContent>
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={performanceData} layout="vertical">
                  <CartesianGrid strokeDasharray="3 3" />
                  <XAxis type="number" domain={[0, 100]} />
                  <YAxis dataKey="worker" type="category" width={100} />
                  <Tooltip />
                  <Bar dataKey="score" fill="hsl(var(--primary))" />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="lg:col-span-2">
            <CardHeader>
              <CardTitle>Analisi Multi-dimensionale</CardTitle>
              <CardDescription>Confronto competenze tra reparti A e B</CardDescription>
            </CardHeader>
            <CardContent className="flex justify-center">
              <ResponsiveContainer width="100%" height={400}>
                <RadarChart data={radarData}>
                  <PolarGrid />
                  <PolarAngleAxis dataKey="subject" />
                  <PolarRadiusAxis angle={90} domain={[0, 100]} />
                  <Radar name="Reparto A" dataKey="A" stroke="hsl(var(--primary))" fill="hsl(var(--primary))" fillOpacity={0.6} />
                  <Radar name="Reparto B" dataKey="B" stroke="hsl(var(--secondary))" fill="hsl(var(--secondary))" fillOpacity={0.6} />
                  <Legend />
                  <Tooltip />
                </RadarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {loading && (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Caricamento dati in corso...
            </CardContent>
          </Card>
        )}

        {!loading && responses.length === 0 && (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nessuna risposta disponibile ancora</p>
              <Button onClick={() => navigate('/compile')}>
                Compila il primo questionario
              </Button>
            </CardContent>
          </Card>
        )}
      </main>
    </div>
  );
};

export default Analysis;
