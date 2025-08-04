import { Card, CardContent } from "@/components/ui/card";
import { Star, User } from "lucide-react";
import { Avaliacao } from "@/types/beauty";
import { formatDate } from "@/lib/formatters";

interface AvaliacaoCardProps {
  avaliacao: Avaliacao;
}

export const AvaliacaoCard = ({ avaliacao }: AvaliacaoCardProps) => {
  const renderStars = (rating: number) => {
    return Array.from({ length: 5 }, (_, index) => (
      <Star
        key={index}
        className={`w-4 h-4 ${
          index < rating 
            ? "fill-yellow-400 text-yellow-400" 
            : "text-gray-300"
        }`}
      />
    ));
  };

  return (
    <Card>
      <CardContent className="p-4">
        <div className="flex items-start gap-3">
          <div className="w-10 h-10 bg-accent rounded-full flex items-center justify-center">
            <User className="w-5 h-5 text-accent-foreground" />
          </div>
          
          <div className="flex-1 space-y-2">
            <div className="flex items-center gap-2">
              <span className="font-medium">
                {avaliacao.agendamento?.nome_cliente || "Cliente"}
              </span>
              <div className="flex gap-1">
                {renderStars(avaliacao.nota)}
              </div>
            </div>
            
            {avaliacao.comentario && (
              <p className="text-sm text-muted-foreground">
                "{avaliacao.comentario}"
              </p>
            )}
            
            <p className="text-xs text-muted-foreground">
              {formatDate(avaliacao.data)}
            </p>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};