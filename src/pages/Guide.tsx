import { useNavigate } from "react-router-dom";
import { Card, CardContent, CardHeader, CardTitle, CardDescription } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Accordion, AccordionItem, AccordionTrigger, AccordionContent } from "@/components/ui/accordion";
import { ArrowLeft, Users } from "lucide-react";

const FAQS = [
  {
    question: "Cos'è QuestHub?",
    answer: "QuestHub è un'applicazione per la gestione e l'analisi dei questionari di valutazione VDT."
  },
  {
    question: "Come posso compilare un nuovo questionario?",
    answer: "Clicca su 'Nuovo Questionario' nella dashboard e compila tutte le sezioni richieste."
  },
  {
    question: "Come visualizzo le analisi dei dati?",
    answer: "Clicca su 'Analisi Dati' nella dashboard per vedere statistiche, grafici e distribuzioni per domanda."
  },
  {
    question: "Posso esportare i report in PDF?",
    answer: "Sì, dalle pagine di analisi puoi esportare PDF dei report per ogni reparto o globale."
  },
  {
    question: "Chi può accedere all'app?",
    answer: "Solo gli utenti registrati possono accedere, gestiti tramite login e autenticazione."
  }
];

const Guide = () => {
  const navigate = useNavigate();

  return (
    <div className="min-h-screen bg-gradient-to-br from-background via-primary/5 to-accent/5">
      {/* HEADER */}
      <header className="border-b bg-card/80 backdrop-blur-md shadow-md sticky top-0 z-50">
        <div className="container mx-auto px-4 py-5 flex flex-col sm:flex-row sm:justify-between sm:items-center gap-4">
          <div className="flex flex-col sm:flex-row sm:items-center gap-3 text-center sm:text-left">
            <div className="flex justify-center sm:justify-start">
              <div className="p-2 rounded-lg bg-gradient-to-br from-primary to-primary-glow">
                <Users className="h-6 w-6 text-white" />
              </div>
            </div>
            <h1 className="text-xl font-bold leading-tight">Guida / FAQ</h1>
          </div>

          <div className="flex justify-center sm:justify-end">
            <Button variant="outline" onClick={() => navigate("/dashboard")} className="gap-2 w-full sm:w-auto">
              <ArrowLeft className="h-4 w-4" /> Dashboard
            </Button>
          </div>
        </div>
      </header>

      {/* MAIN CONTENT */}
      <main className="container mx-auto px-4 py-8 max-w-5xl">
        <Card className="shadow-lg border-2">
          <CardHeader className="bg-gradient-to-r from-primary/10 to-accent/10 border-b">
            <CardTitle className="text-2xl">Guida e FAQ</CardTitle>
            <CardDescription>Scopri come utilizzare QuestHub e trova le risposte alle domande frequenti</CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <Accordion type="single" collapsible>
              {FAQS.map((faq, idx) => (
                <AccordionItem key={idx} value={`item-${idx}`}>
                  <AccordionTrigger>{faq.question}</AccordionTrigger>
                  <AccordionContent>{faq.answer}</AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </CardContent>
        </Card>
      </main>
    </div>
  );
};

export default Guide;