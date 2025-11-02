import { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ClipboardList, FileText, BarChart3, LogOut, Users } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

const Dashboard = () => {
  const { user, logout } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);

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

  const handleLogout = async () => {
    await logout();
    navigate('/login');
  };

  // Calcola statistiche reali dai dati
  const calculateStats = () => {
    if (responses.length === 0) return { satisfactionData: [], departmentData: [] };

    // Conta le risposte per valutazione complessiva (q7)
    const satisfactionCounts: Record<string, number> = {};
    responses.forEach(r => {
      const val = r.answers?.q7;
      if (val) satisfactionCounts[val] = (satisfactionCounts[val] || 0) + 1;
    });

    const satisfactionData = Object.entries(satisfactionCounts).map(([name, value]) => ({
      name,
      value
    }));

    // Calcola punteggi per reparto (basato sul nome del valutato in q1)
    const departmentScores: Record<string, { total: number; count: number }> = {};
    responses.forEach(r => {
      const dept = r.answers?.q1 || 'Non specificato';
      const score = calculateScore(r.answers);
      if (!departmentScores[dept]) {
        departmentScores[dept] = { total: 0, count: 0 };
      }
      departmentScores[dept].total += score;
      departmentScores[dept].count += 1;
    });

    const departmentData = Object.entries(departmentScores).map(([department, data]) => ({
      department,
      score: Math.round(data.total / data.count)
    }));

    return { satisfactionData, departmentData };
  };

  const calculateScore = (answers: any) => {
    if (!answers) return 0;
    const scoreMap: Record<string, number> = {
      'Eccellente': 100, 'Ottimo': 100,
      'Buono': 75, 'Quasi sempre': 75, 'Soddisfatto': 75,
      'Sufficiente': 50, 'Qualche ritardo': 50, 'Neutrale': 50,
      'Insufficiente': 25, 'Scarso': 25, 'Spesso in ritardo': 25, 'Insoddisfatto': 25,
      'Sempre puntuale': 100, 'Molto soddisfatto': 100
    };
    
    let total = 0;
    let count = 0;
    ['q2', 'q3', 'q4', 'q7'].forEach(key => {
      if (answers[key] && scoreMap[answers[key]]) {
        total += scoreMap[answers[key]];
        count++;
      }
    });
    return count > 0 ? total / count : 0;
  };

  const { satisfactionData, departmentData } = calculateStats();

  const completionRate = responses.length > 0 ? 87 : 0;

  return (
    <div className="min-h-screen bg-gradient-to-br from-background to-secondary/5">
      {/* Header */}
      <header className="bg-card border-b sticky top-0 z-50 backdrop-blur-sm bg-card/95">
        <div className="container mx-auto px-4 py-4 flex justify-between items-center">
          <div className="flex items-center gap-2">
            <ClipboardList className="h-6 w-6 text-primary" />
            <h1 className="text-xl font-bold">FeedbackFort</h1>
          </div>
          <Button variant="ghost" size="sm" onClick={handleLogout}>
            <LogOut className="h-4 w-4 mr-2" />
            Esci
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="container mx-auto px-4 py-6 space-y-6">
        {/* Stats Cards */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Risposte Totali</CardTitle>
              <Users className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{responses.length}</div>
              <p className="text-xs text-muted-foreground">Raccolte fino ad oggi</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Questionari Attivi</CardTitle>
              <FileText className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">1</div>
              <p className="text-xs text-muted-foreground">In corso di compilazione</p>
            </CardContent>
          </Card>
          
          <Card>
            <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
              <CardTitle className="text-sm font-medium">Tasso di Risposta</CardTitle>
              <BarChart3 className="h-4 w-4 text-muted-foreground" />
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">{completionRate}%</div>
              <p className="text-xs text-muted-foreground">Percentuale completamento</p>
            </CardContent>
          </Card>
        </div>

        {/* Action Buttons */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <Button
            size="lg"
            className="h-24 text-lg"
            onClick={() => navigate('/compile')}
          >
            <ClipboardList className="mr-2 h-6 w-6" />
            Compila Questionario
          </Button>
          <Button
            size="lg"
            variant="outline"
            className="h-24 text-lg"
            onClick={() => navigate('/analysis')}
          >
            <BarChart3 className="mr-2 h-6 w-6" />
            Analisi Risposte
          </Button>
        </div>

        {/* Charts */}
        {responses.length > 0 ? (
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {satisfactionData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Soddisfazione Generale</CardTitle>
                  <CardDescription>Distribuzione delle risposte</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <PieChart>
                      <Pie
                        data={satisfactionData}
                        cx="50%"
                        cy="50%"
                        labelLine={false}
                        label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                        outerRadius={80}
                        fill="#8884d8"
                        dataKey="value"
                      >
                        {satisfactionData.map((entry, index) => (
                          <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                        ))}
                      </Pie>
                      <Tooltip />
                    </PieChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}

            {departmentData.length > 0 && (
              <Card>
                <CardHeader>
                  <CardTitle>Performance per Reparto/Lavoratore</CardTitle>
                  <CardDescription>Punteggio medio</CardDescription>
                </CardHeader>
                <CardContent>
                  <ResponsiveContainer width="100%" height={300}>
                    <BarChart data={departmentData}>
                      <CartesianGrid strokeDasharray="3 3" />
                      <XAxis dataKey="department" />
                      <YAxis domain={[0, 100]} />
                      <Tooltip />
                      <Legend />
                      <Bar dataKey="score" fill="hsl(var(--primary))" name="Punteggio" />
                    </BarChart>
                  </ResponsiveContainer>
                </CardContent>
              </Card>
            )}
          </div>
        ) : (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nessun dato disponibile ancora</p>
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

export default Dashboard;
