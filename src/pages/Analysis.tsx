import { useState, useEffect, useMemo } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from '@/components/ui/select';
import { Tabs, TabsContent, TabsList, TabsTrigger } from '@/components/ui/tabs';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, Legend, ResponsiveContainer, LineChart, Line, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, Radar, PieChart, Pie, Cell } from 'recharts';
import { collection, query, getDocs } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { ArrowLeft, Filter } from 'lucide-react';

const COLORS = ['hsl(var(--primary))', 'hsl(var(--secondary))', 'hsl(var(--accent))', 'hsl(var(--destructive))'];

const Analysis = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const [responses, setResponses] = useState<any[]>([]);
  const [loading, setLoading] = useState(true);
  const [filterWorker, setFilterWorker] = useState<string>('all');
  const [viewMode, setViewMode] = useState<'general' | 'worker' | 'question'>('general');

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

  // Estrai lista unica di lavoratori/reparti
  const workers = useMemo(() => {
    const unique = new Set(responses.map(r => r.answers?.q1).filter(Boolean));
    return Array.from(unique);
  }, [responses]);

  // Filtra risposte
  const filteredResponses = useMemo(() => {
    if (filterWorker === 'all') return responses;
    return responses.filter(r => r.answers?.q1 === filterWorker);
  }, [responses, filterWorker]);

  // Analisi generale
  const generalStats = useMemo(() => {
    const workerScores: Record<string, { total: number; count: number }> = {};
    
    filteredResponses.forEach(r => {
      const worker = r.answers?.q1 || 'Non specificato';
      const score = calculateScore(r.answers);
      if (!workerScores[worker]) {
        workerScores[worker] = { total: 0, count: 0 };
      }
      workerScores[worker].total += score;
      workerScores[worker].count += 1;
    });

    return Object.entries(workerScores).map(([worker, data]) => ({
      worker,
      score: Math.round(data.total / data.count),
      count: data.count
    })).sort((a, b) => b.score - a.score);
  }, [filteredResponses]);

  // Analisi per domanda
  const questionAnalysis = useMemo(() => {
    const questions = [
      { id: 'q2', label: 'Qualità lavoro' },
      { id: 'q3', label: 'Puntualità' },
      { id: 'q4', label: 'Collaborazione' },
      { id: 'q7', label: 'Valutazione complessiva' }
    ];

    return questions.map(q => {
      const counts: Record<string, number> = {};
      filteredResponses.forEach(r => {
        const answer = r.answers?.[q.id];
        if (answer) counts[answer] = (counts[answer] || 0) + 1;
      });

      const data = Object.entries(counts).map(([name, value]) => ({ name, value }));
      return { ...q, data };
    });
  }, [filteredResponses]);

  // Confronto temporale (ordina per data)
  const timelineData = useMemo(() => {
    const sorted = [...filteredResponses].sort((a, b) => {
      const dateA = a.createdAt?.toDate?.() || new Date(0);
      const dateB = b.createdAt?.toDate?.() || new Date(0);
      return dateA.getTime() - dateB.getTime();
    });

    return sorted.map((r, idx) => ({
      index: idx + 1,
      score: Math.round(calculateScore(r.answers)),
      worker: r.answers?.q1 || 'N/A'
    }));
  }, [filteredResponses]);

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
            <p className="text-muted-foreground">Analizza i dati reali dei questionari</p>
          </div>
          
          <div className="flex items-center gap-2 w-full md:w-auto">
            <Filter className="h-4 w-4 text-muted-foreground" />
            <Select value={filterWorker} onValueChange={setFilterWorker}>
              <SelectTrigger className="w-full md:w-[250px]">
                <SelectValue placeholder="Filtra per lavoratore/reparto" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Tutti</SelectItem>
                {workers.map(w => (
                  <SelectItem key={w} value={w}>{w}</SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>
        </div>

        {loading ? (
          <Card>
            <CardContent className="py-8 text-center text-muted-foreground">
              Caricamento dati in corso...
            </CardContent>
          </Card>
        ) : responses.length === 0 ? (
          <Card>
            <CardContent className="py-8 text-center">
              <p className="text-muted-foreground mb-4">Nessuna risposta disponibile ancora</p>
              <Button onClick={() => navigate('/compile')}>
                Compila il primo questionario
              </Button>
            </CardContent>
          </Card>
        ) : (
          <>
            <Tabs value={viewMode} onValueChange={(v: any) => setViewMode(v)} className="w-full">
              <TabsList className="grid w-full grid-cols-3">
                <TabsTrigger value="general">Generale</TabsTrigger>
                <TabsTrigger value="worker">Per Lavoratore</TabsTrigger>
                <TabsTrigger value="question">Per Domanda</TabsTrigger>
              </TabsList>

              <TabsContent value="general" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  <Card>
                    <CardHeader>
                      <CardTitle>Classifica Performance</CardTitle>
                      <CardDescription>Punteggio medio per lavoratore/reparto</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <BarChart data={generalStats} layout="vertical">
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis type="number" domain={[0, 100]} />
                          <YAxis dataKey="worker" type="category" width={120} />
                          <Tooltip />
                          <Bar dataKey="score" fill="hsl(var(--primary))" name="Punteggio" />
                        </BarChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>

                  <Card>
                    <CardHeader>
                      <CardTitle>Trend Temporale</CardTitle>
                      <CardDescription>Andamento punteggi nel tempo</CardDescription>
                    </CardHeader>
                    <CardContent>
                      <ResponsiveContainer width="100%" height={300}>
                        <LineChart data={timelineData}>
                          <CartesianGrid strokeDasharray="3 3" />
                          <XAxis dataKey="index" label={{ value: 'Questionario #', position: 'insideBottom', offset: -5 }} />
                          <YAxis domain={[0, 100]} />
                          <Tooltip 
                            formatter={(value: any) => [`${value}%`, 'Punteggio']}
                            labelFormatter={(label) => `Questionario #${label}`}
                          />
                          <Line type="monotone" dataKey="score" stroke="hsl(var(--primary))" strokeWidth={2} />
                        </LineChart>
                      </ResponsiveContainer>
                    </CardContent>
                  </Card>
                </div>
              </TabsContent>

              <TabsContent value="worker" className="space-y-6 mt-6">
                {generalStats.map(worker => (
                  <Card key={worker.worker}>
                    <CardHeader>
                      <CardTitle>{worker.worker}</CardTitle>
                      <CardDescription>
                        Punteggio medio: {worker.score}/100 ({worker.count} valutazioni)
                      </CardDescription>
                    </CardHeader>
                    <CardContent>
                      <div className="space-y-4">
                        {questionAnalysis.map(q => {
                          const workerResponses = responses
                            .filter(r => r.answers?.q1 === worker.worker)
                            .map(r => r.answers?.[q.id])
                            .filter(Boolean);
                          
                          if (workerResponses.length === 0) return null;

                          return (
                            <div key={q.id} className="border-b pb-4 last:border-0">
                              <h4 className="font-medium mb-2">{q.label}</h4>
                              <div className="grid grid-cols-2 gap-2 text-sm">
                                {workerResponses.map((answer, idx) => (
                                  <div key={idx} className="bg-muted p-2 rounded">
                                    {answer}
                                  </div>
                                ))}
                              </div>
                            </div>
                          );
                        })}
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </TabsContent>

              <TabsContent value="question" className="space-y-6 mt-6">
                <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
                  {questionAnalysis.map(q => (
                    q.data.length > 0 && (
                      <Card key={q.id}>
                        <CardHeader>
                          <CardTitle>{q.label}</CardTitle>
                          <CardDescription>Distribuzione delle risposte</CardDescription>
                        </CardHeader>
                        <CardContent>
                          <ResponsiveContainer width="100%" height={250}>
                            <PieChart>
                              <Pie
                                data={q.data}
                                cx="50%"
                                cy="50%"
                                labelLine={false}
                                label={({ name, percent }) => `${name}: ${(percent * 100).toFixed(0)}%`}
                                outerRadius={80}
                                dataKey="value"
                              >
                                {q.data.map((entry, index) => (
                                  <Cell key={`cell-${index}`} fill={COLORS[index % COLORS.length]} />
                                ))}
                              </Pie>
                              <Tooltip />
                            </PieChart>
                          </ResponsiveContainer>
                        </CardContent>
                      </Card>
                    )
                  ))}
                </div>
              </TabsContent>
            </Tabs>
          </>
        )}
      </main>
    </div>
  );
};

export default Analysis;
