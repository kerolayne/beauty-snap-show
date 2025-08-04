import { useState } from "react";
import { Button } from "@/components/ui/button";
import { ArrowLeft, CheckCircle } from "lucide-react";
import { AgendamentoForm, AgendamentoData } from "@/components/AgendamentoForm";
import { Trabalho, Horario } from "@/types/beauty";
import { useToast } from "@/hooks/use-toast";

interface BookingProps {
  trabalho: Trabalho;
  horario: Horario;
  onBack: () => void;
  onSuccess: () => void;
}

export const Booking = ({ trabalho, horario, onBack, onSuccess }: BookingProps) => {
  const [loading, setLoading] = useState(false);
  const [success, setSuccess] = useState(false);
  const { toast } = useToast();

  const handleSubmit = async (data: AgendamentoData) => {
    setLoading(true);
    
    try {
      // Simular chamada à API
      await new Promise(resolve => setTimeout(resolve, 2000));
      
      // Mock success response
      console.log('Agendamento criado:', {
        trabalho_id: trabalho.id,
        horario_id: horario.id,
        ...data
      });

      setSuccess(true);
      
      toast({
        title: "Agendamento confirmado!",
        description: "Você receberá uma confirmação em breve.",
      });

      // Redirecionar após alguns segundos
      setTimeout(() => {
        onSuccess();
      }, 3000);
      
    } catch (error) {
      toast({
        title: "Erro no agendamento",
        description: "Não foi possível confirmar seu agendamento. Tente novamente.",
        variant: "destructive"
      });
    } finally {
      setLoading(false);
    }
  };

  if (success) {
    return (
      <div className="min-h-screen bg-background flex items-center justify-center">
        <div className="text-center space-y-6 max-w-md mx-auto px-4">
          <div className="w-20 h-20 bg-green-100 rounded-full flex items-center justify-center mx-auto">
            <CheckCircle className="w-12 h-12 text-green-600" />
          </div>
          
          <div>
            <h1 className="text-2xl font-bold text-foreground mb-2">
              Agendamento Confirmado!
            </h1>
            <p className="text-muted-foreground">
              Seu agendamento foi realizado com sucesso. Você receberá uma confirmação por WhatsApp.
            </p>
          </div>

          <div className="p-4 bg-accent rounded-lg text-left">
            <h3 className="font-medium mb-2">Detalhes do agendamento:</h3>
            <div className="text-sm space-y-1">
              <p><strong>Serviço:</strong> {trabalho.titulo}</p>
              <p><strong>Profissional:</strong> {trabalho.profissional?.nome}</p>
              <p><strong>Data:</strong> {new Date(horario.data).toLocaleDateString('pt-BR')}</p>
              <p><strong>Horário:</strong> {horario.hora}</p>
            </div>
          </div>

          <Button 
            onClick={onSuccess}
            className="w-full bg-beauty-gradient hover:opacity-90 transition-opacity"
          >
            Voltar ao Início
          </Button>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            disabled={loading}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Finalizar Agendamento</h1>
        </div>

        <div className="max-w-2xl mx-auto">
          <AgendamentoForm
            trabalho={trabalho}
            horario={horario}
            onSubmit={handleSubmit}
            loading={loading}
          />
        </div>
      </div>
    </div>
  );
};