import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Calendar, Clock } from "lucide-react";
import { Horario } from "@/types/beauty";
import { formatDate, formatTime } from "@/lib/formatters";

interface HorarioSelectorProps {
  horarios: Horario[];
  selectedHorario?: Horario;
  onSelectHorario: (horario: Horario) => void;
}

export const HorarioSelector = ({ 
  horarios, 
  selectedHorario, 
  onSelectHorario 
}: HorarioSelectorProps) => {
  const [selectedDate, setSelectedDate] = useState<string>("");

  // Agrupar horários por data
  const horariosPorData = horarios
    .filter(h => h.disponivel)
    .reduce((acc, horario) => {
      if (!acc[horario.data]) {
        acc[horario.data] = [];
      }
      acc[horario.data].push(horario);
      return acc;
    }, {} as Record<string, Horario[]>);

  const datasDisponiveis = Object.keys(horariosPorData).sort();

  if (horarios.length === 0) {
    return (
      <Card>
        <CardContent className="p-6 text-center">
          <Clock className="w-12 h-12 mx-auto mb-3 text-muted-foreground" />
          <h3 className="font-medium mb-2">Nenhum horário disponível</h3>
          <p className="text-sm text-muted-foreground">
            Entre em contato para verificar disponibilidade
          </p>
        </CardContent>
      </Card>
    );
  }

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Calendar className="w-5 h-5 text-primary" />
          Escolha um horário
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        {/* Seleção de data */}
        <div>
          <h4 className="font-medium mb-3">Datas disponíveis:</h4>
          <div className="grid grid-cols-2 gap-2">
            {datasDisponiveis.map((data) => (
              <Button
                key={data}
                variant={selectedDate === data ? "default" : "outline"}
                onClick={() => setSelectedDate(data)}
                className="text-sm"
              >
                {formatDate(data)}
              </Button>
            ))}
          </div>
        </div>

        {/* Seleção de horário */}
        {selectedDate && (
          <div>
            <h4 className="font-medium mb-3">Horários disponíveis:</h4>
            <div className="grid grid-cols-3 gap-2">
              {horariosPorData[selectedDate]?.map((horario) => (
                <Button
                  key={horario.id}
                  variant={selectedHorario?.id === horario.id ? "default" : "outline"}
                  onClick={() => onSelectHorario(horario)}
                  className="text-sm"
                  disabled={!horario.disponivel}
                >
                  {formatTime(horario.hora)}
                </Button>
              ))}
            </div>
          </div>
        )}

        {selectedHorario && (
          <div className="p-3 bg-accent rounded-md">
            <p className="text-sm font-medium">Horário selecionado:</p>
            <p className="text-sm text-muted-foreground">
              {formatDate(selectedHorario.data)} às {formatTime(selectedHorario.hora)}
            </p>
          </div>
        )}
      </CardContent>
    </Card>
  );
};