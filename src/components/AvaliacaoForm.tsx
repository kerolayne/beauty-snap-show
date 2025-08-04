import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Star, MessageSquare } from "lucide-react";
import { Agendamento } from "@/types/beauty";
import { useToast } from "@/hooks/use-toast";

interface AvaliacaoFormProps {
  agendamento: Agendamento;
  onSubmit: (data: AvaliacaoData) => void;
  loading?: boolean;
}

export interface AvaliacaoData {
  nota: number;
  comentario?: string;
}

export const AvaliacaoForm = ({ agendamento, onSubmit, loading }: AvaliacaoFormProps) => {
  const [nota, setNota] = useState(0);
  const [comentario, setComentario] = useState("");
  const [hoveredStar, setHoveredStar] = useState(0);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (nota === 0) {
      toast({
        title: "Avaliação incompleta",
        description: "Por favor, selecione uma nota de 1 a 5 estrelas",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      nota,
      comentario: comentario.trim() || undefined
    });
  };

  const renderStars = () => {
    return Array.from({ length: 5 }, (_, index) => {
      const starValue = index + 1;
      const isActive = starValue <= (hoveredStar || nota);
      
      return (
        <Star
          key={index}
          className={`w-8 h-8 cursor-pointer transition-colors ${
            isActive 
              ? "fill-yellow-400 text-yellow-400" 
              : "text-gray-300 hover:text-yellow-300"
          }`}
          onClick={() => setNota(starValue)}
          onMouseEnter={() => setHoveredStar(starValue)}
          onMouseLeave={() => setHoveredStar(0)}
        />
      );
    });
  };

  return (
    <Card>
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Star className="w-5 h-5 text-primary" />
          Avaliar Serviço
        </CardTitle>
      </CardHeader>
      <CardContent>
        <div className="space-y-4">
          {/* Informações do agendamento */}
          <div className="p-3 bg-accent rounded-md">
            <h3 className="font-medium">{agendamento.trabalho?.titulo}</h3>
            <p className="text-sm text-muted-foreground">
              Profissional: {agendamento.trabalho?.profissional?.nome}
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Avaliação por estrelas */}
            <div>
              <label className="block text-sm font-medium mb-2">
                Como você avalia o serviço? *
              </label>
              <div className="flex gap-1">
                {renderStars()}
              </div>
              {nota > 0 && (
                <p className="text-sm text-muted-foreground mt-2">
                  Você deu {nota} estrela{nota > 1 ? 's' : ''} para este serviço
                </p>
              )}
            </div>

            {/* Comentário */}
            <div>
              <label htmlFor="comentario" className="block text-sm font-medium mb-2">
                Comentário (opcional)
              </label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="comentario"
                  value={comentario}
                  onChange={(e) => setComentario(e.target.value)}
                  placeholder="Conte-nos como foi sua experiência..."
                  className="pl-10"
                  rows={4}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-beauty-gradient hover:opacity-90 transition-opacity"
              disabled={loading || nota === 0}
            >
              {loading ? "Enviando..." : "Enviar Avaliação"}
            </Button>
          </form>
        </div>
      </CardContent>
    </Card>
  );
};