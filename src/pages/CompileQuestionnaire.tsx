import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '@/contexts/AuthContext';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from '@/components/ui/card';
import { Button } from '@/components/ui/button';
import { Input } from '@/components/ui/input';
import { Label } from '@/components/ui/label';
import { RadioGroup, RadioGroupItem } from '@/components/ui/radio-group';
import { Textarea } from '@/components/ui/textarea';
import { collection, addDoc, serverTimestamp } from 'firebase/firestore';
import { db } from '@/lib/firebase';
import { useToast } from '@/hooks/use-toast';
import { ArrowLeft, Send } from 'lucide-react';

interface Question {
  id: string;
  type: 'radio' | 'text' | 'textarea';
  question: string;
  options?: string[];
}

const questions: Question[] = [
  {
    id: 'q1',
    type: 'text',
    question: 'Nome del valutato (lavoratore o reparto)',
  },
  {
    id: 'q2',
    type: 'radio',
    question: 'Come valuti la qualità del lavoro svolto?',
    options: ['Eccellente', 'Buono', 'Sufficiente', 'Insufficiente'],
  },
  {
    id: 'q3',
    type: 'radio',
    question: 'Come valuti la puntualità e rispetto delle scadenze?',
    options: ['Sempre puntuale', 'Quasi sempre', 'Qualche ritardo', 'Spesso in ritardo'],
  },
  {
    id: 'q4',
    type: 'radio',
    question: 'Livello di collaborazione con il team',
    options: ['Ottimo', 'Buono', 'Sufficiente', 'Scarso'],
  },
  {
    id: 'q5',
    type: 'textarea',
    question: 'Punti di forza principali',
  },
  {
    id: 'q6',
    type: 'textarea',
    question: 'Aree di miglioramento',
  },
  {
    id: 'q7',
    type: 'radio',
    question: 'Valutazione complessiva',
    options: ['Molto soddisfatto', 'Soddisfatto', 'Neutrale', 'Insoddisfatto'],
  },
];

const CompileQuestionnaire = () => {
  const { user } = useAuth();
  const navigate = useNavigate();
  const { toast } = useToast();
  const [answers, setAnswers] = useState<Record<string, string>>({});
  const [submitting, setSubmitting] = useState(false);

  const handleAnswerChange = (questionId: string, value: string) => {
    setAnswers(prev => ({ ...prev, [questionId]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (Object.keys(answers).length !== questions.length) {
      toast({
        variant: "destructive",
        title: "Attenzione",
        description: "Rispondi a tutte le domande prima di inviare",
      });
      return;
    }

    setSubmitting(true);
    try {
      await addDoc(collection(db, 'responses'), {
        userId: user?.uid,
        userEmail: user?.email,
        answers,
        createdAt: serverTimestamp(),
      });

      toast({
        title: "Questionario inviato!",
        description: "Grazie per aver completato il questionario",
      });
      
      navigate('/dashboard');
    } catch (error) {
      console.error('Error submitting:', error);
      toast({
        variant: "destructive",
        title: "Errore",
        description: "Si è verificato un errore durante l'invio",
      });
    } finally {
      setSubmitting(false);
    }
  };

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

      <main className="container mx-auto px-4 py-6 max-w-2xl">
        <Card>
          <CardHeader>
            <CardTitle>Questionario di Valutazione</CardTitle>
            <CardDescription>
              Compila tutte le domande per valutare il lavoratore o reparto
            </CardDescription>
          </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-6">
              {questions.map((q, index) => (
                <div key={q.id} className="space-y-3 pb-6 border-b last:border-0">
                  <Label className="text-base font-semibold">
                    {index + 1}. {q.question}
                  </Label>
                  
                  {q.type === 'text' && (
                    <Input
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="La tua risposta..."
                      required
                    />
                  )}
                  
                  {q.type === 'textarea' && (
                    <Textarea
                      value={answers[q.id] || ''}
                      onChange={(e) => handleAnswerChange(q.id, e.target.value)}
                      placeholder="La tua risposta..."
                      rows={4}
                      required
                    />
                  )}
                  
                  {q.type === 'radio' && q.options && (
                    <RadioGroup
                      value={answers[q.id] || ''}
                      onValueChange={(value) => handleAnswerChange(q.id, value)}
                      required
                    >
                      {q.options.map((option) => (
                        <div key={option} className="flex items-center space-x-2">
                          <RadioGroupItem value={option} id={`${q.id}-${option}`} />
                          <Label htmlFor={`${q.id}-${option}`} className="font-normal cursor-pointer">
                            {option}
                          </Label>
                        </div>
                      ))}
                    </RadioGroup>
                  )}
                </div>
              ))}
              
              <Button type="submit" className="w-full" size="lg" disabled={submitting}>
                <Send className="mr-2 h-4 w-4" />
                {submitting ? 'Invio in corso...' : 'Invia Questionario'}
              </Button>
            </form>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default CompileQuestionnaire;
