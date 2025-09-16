import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { Clock, User, Star } from "lucide-react";
import { Trabalho } from "@/types/beauty";
import { formatPrice, formatDuration } from "@/lib/formatters";
import { Link } from "react-router-dom";

interface TrabalhoCardProps {
  trabalho: Trabalho;
  averageRating?: number;
  totalReviews?: number;
}

export const TrabalhoCard = ({ 
  trabalho, 
  averageRating = 0, 
  totalReviews = 0 
}: TrabalhoCardProps) => {
  return (
    <Card className="group cursor-pointer transition-all duration-300 hover:shadow-card hover:-translate-y-1 bg-card-gradient border-border/50">
      <div className="relative overflow-hidden rounded-t-lg">
        <img
          src={trabalho.imagem_url || '/placeholder.svg'}
          alt={trabalho.titulo}
          className="w-full h-48 object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute top-3 right-3">
          <Badge variant="secondary" className="bg-background/90 backdrop-blur-sm">
            {formatPrice(trabalho.preco)}
          </Badge>
        </div>
      </div>
      
      <CardContent className="p-4 space-y-3">
        <div>
          <h3 className="font-semibold text-lg text-foreground group-hover:text-primary transition-colors">
            {trabalho.titulo}
          </h3>
          <p className="text-sm text-muted-foreground line-clamp-2">
            {trabalho.descricao}
          </p>
        </div>

        <div className="flex items-center gap-4 text-sm text-muted-foreground">
          <div className="flex items-center gap-1">
            <Clock className="w-4 h-4" />
            {formatDuration(trabalho.duracao_minutos)}
          </div>
          
          {trabalho.profissional && (
            <div className="flex items-center gap-1">
              <User className="w-4 h-4" />
              {trabalho.profissional.nome}
            </div>
          )}
        </div>

        {totalReviews > 0 && (
          <div className="flex items-center gap-1 text-sm">
            <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
            <span className="font-medium">{averageRating.toFixed(1)}</span>
            <span className="text-muted-foreground">({totalReviews} avaliações)</span>
          </div>
        )}

        <Button 
          asChild
          className="w-full mt-4 bg-beauty-gradient hover:opacity-90 transition-opacity"
        >
          <Link to={`/trabalho-details/${trabalho.id}`}>
            Ver Detalhes
          </Link>
        </Button>
      </CardContent>
    </Card>
  );
};