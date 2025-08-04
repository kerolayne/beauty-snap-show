import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { ArrowLeft, Clock, User, Star, Calendar } from "lucide-react";
import { HorarioSelector } from "@/components/HorarioSelector";
import { Trabalho, Horario } from "@/types/beauty";
import { formatPrice, formatDuration } from "@/lib/formatters";

interface TrabalhoDetailsProps {
  trabalho: Trabalho;
  onBack: () => void;
  onBooking: (trabalho: Trabalho, horario: Horario) => void;
}

export const TrabalhoDetails = ({ trabalho, onBack, onBooking }: TrabalhoDetailsProps) => {
  const [horarios, setHorarios] = useState<Horario[]>([]);
  const [selectedHorario, setSelectedHorario] = useState<Horario>();
  const [loading, setLoading] = useState(true);

  // Mock data para horários disponíveis
  useEffect(() => {
    const mockHorarios: Horario[] = [
      {
        id: "1",
        profissional_id: trabalho.profissional_id,
        trabalho_id: trabalho.id,
        data: "2024-08-05",
        hora: "09:00",
        disponivel: true
      },
      {
        id: "2",
        profissional_id: trabalho.profissional_id,
        trabalho_id: trabalho.id,
        data: "2024-08-05",
        hora: "14:00",
        disponivel: true
      },
      {
        id: "3",
        profissional_id: trabalho.profissional_id,
        trabalho_id: trabalho.id,
        data: "2024-08-06",
        hora: "10:00",
        disponivel: true
      },
      {
        id: "4",
        profissional_id: trabalho.profissional_id,
        trabalho_id: trabalho.id,
        data: "2024-08-06",
        hora: "15:30",
        disponivel: true
      },
      {
        id: "5",
        profissional_id: trabalho.profissional_id,
        trabalho_id: trabalho.id,
        data: "2024-08-07",
        hora: "11:00",
        disponivel: true
      },
      {
        id: "6",
        profissional_id: trabalho.profissional_id,
        trabalho_id: trabalho.id,
        data: "2024-08-07",
        hora: "16:00",
        disponivel: true
      }
    ];

    setTimeout(() => {
      setHorarios(mockHorarios);
      setLoading(false);
    }, 500);
  }, [trabalho.id, trabalho.profissional_id]);

  // Mock rating data
  const rating = {
    average: 4.8,
    total: 24,
    distribution: {
      5: 18,
      4: 4,
      3: 2,
      2: 0,
      1: 0
    }
  };

  const handleBooking = () => {
    if (selectedHorario) {
      onBooking(trabalho, selectedHorario);
    }
  };

  return (
    <div className="min-h-screen bg-background">
      <div className="container mx-auto px-4 py-8">
        {/* Header */}
        <div className="flex items-center gap-4 mb-8">
          <Button 
            variant="outline" 
            size="icon"
            onClick={onBack}
            className="shrink-0"
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <h1 className="text-3xl font-bold text-foreground">Detalhes do Serviço</h1>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-2 gap-8">
          {/* Informações do Trabalho */}
          <div className="space-y-6">
            {/* Imagem principal */}
            <div className="relative overflow-hidden rounded-lg">
              <img
                src={trabalho.imagem_url || '/placeholder.svg'}
                alt={trabalho.titulo}
                className="w-full h-64 object-cover"
              />
              <div className="absolute top-4 right-4">
                <Badge className="bg-primary text-primary-foreground text-lg px-3 py-1">
                  {formatPrice(trabalho.preco)}
                </Badge>
              </div>
            </div>

            {/* Informações básicas */}
            <Card>
              <CardHeader>
                <CardTitle className="text-2xl">{trabalho.titulo}</CardTitle>
              </CardHeader>
              <CardContent className="space-y-4">
                <p className="text-muted-foreground">{trabalho.descricao}</p>
                
                <div className="flex flex-wrap gap-4 text-sm">
                  <div className="flex items-center gap-2">
                    <Clock className="w-4 h-4 text-primary" />
                    <span>Duração: {formatDuration(trabalho.duracao_minutos)}</span>
                  </div>
                  
                  {trabalho.profissional && (
                    <div className="flex items-center gap-2">
                      <User className="w-4 h-4 text-primary" />
                      <span>
                        {trabalho.profissional.nome} - {trabalho.profissional.especialidade}
                      </span>
                    </div>
                  )}
                </div>

                {/* Avaliações */}
                <div className="border-t pt-4">
                  <div className="flex items-center gap-2 mb-3">
                    <Star className="w-5 h-5 fill-yellow-400 text-yellow-400" />
                    <span className="text-lg font-semibold">{rating.average}</span>
                    <span className="text-muted-foreground">
                      ({rating.total} avaliações)
                    </span>
                  </div>
                  
                  <div className="space-y-2">
                    {Object.entries(rating.distribution).reverse().map(([stars, count]) => (
                      <div key={stars} className="flex items-center gap-2 text-sm">
                        <span className="w-8">{stars}★</span>
                        <div className="flex-1 bg-muted rounded-full h-2">
                          <div 
                            className="bg-yellow-400 h-full rounded-full transition-all"
                            style={{ width: `${(count / rating.total) * 100}%` }}
                          />
                        </div>
                        <span className="w-8 text-muted-foreground">{count}</span>
                      </div>
                    ))}
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Agendamento */}
          <div className="space-y-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Calendar className="w-5 h-5 text-primary" />
                  Agendar Horário
                </CardTitle>
              </CardHeader>
              <CardContent>
                {loading ? (
                  <div className="animate-pulse space-y-4">
                    <div className="h-4 bg-muted rounded w-3/4"></div>
                    <div className="grid grid-cols-2 gap-2">
                      {Array.from({ length: 4 }).map((_, i) => (
                        <div key={i} className="h-10 bg-muted rounded"></div>
                      ))}
                    </div>
                  </div>
                ) : (
                  <HorarioSelector
                    horarios={horarios}
                    selectedHorario={selectedHorario}
                    onSelectHorario={setSelectedHorario}
                  />
                )}
              </CardContent>
            </Card>

            {/* Botão de agendamento */}
            <Button
              onClick={handleBooking}
              disabled={!selectedHorario}
              className="w-full h-12 text-lg bg-beauty-gradient hover:opacity-90 transition-opacity"
            >
              {selectedHorario ? "Continuar Agendamento" : "Selecione um horário"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
};