import { useState, useEffect } from "react";
import { TrabalhoCard } from "@/components/TrabalhoCard";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Search, Sparkles, Star } from "lucide-react";
import { Trabalho } from "@/types/beauty";
import { useToast } from "@/hooks/use-toast";
import heroImage from "@/assets/beauty-hero.jpg";

export const Home = () => {
  const [trabalhos, setTrabalhos] = useState<Trabalho[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [loading, setLoading] = useState(true);
  const { toast } = useToast();

  // Mock data para demonstração
  useEffect(() => {
    const mockTrabalhos: Trabalho[] = [
      {
        id: "1",
        profissional_id: "1",
        titulo: "Corte Feminino + Escova",
        descricao: "Corte moderno com escova modeladora, perfeito para realçar sua beleza natural",
        preco: 85.00,
        imagem_url: "https://images.unsplash.com/photo-1562322140-8baeececf3df?w=500",
        duracao_minutos: 90,
        profissional: {
          id: "1",
          nome: "Maria Silva",
          especialidade: "Cabeleireira"
        }
      },
      {
        id: "2",
        profissional_id: "1",
        titulo: "Manicure + Pedicure",
        descricao: "Cuidado completo para suas unhas com esmaltação perfeita",
        preco: 45.00,
        imagem_url: "https://images.unsplash.com/photo-1604654894610-df63bc536371?w=500",
        duracao_minutos: 60,
        profissional: {
          id: "1",
          nome: "Maria Silva",
          especialidade: "Manicure"
        }
      },
      {
        id: "3",
        profissional_id: "2",
        titulo: "Massagem Relaxante",
        descricao: "Massagem terapêutica para alívio do stress e tensões musculares",
        preco: 120.00,
        imagem_url: "https://images.unsplash.com/photo-1544161515-4ab6ce6db874?w=500",
        duracao_minutos: 60,
        profissional: {
          id: "2",
          nome: "Ana Costa",
          especialidade: "Massoterapeuta"
        }
      },
      {
        id: "4",
        profissional_id: "3",
        titulo: "Limpeza de Pele",
        descricao: "Limpeza profunda com extração de cravos e aplicação de máscara hidratante",
        preco: 95.00,
        imagem_url: "https://images.unsplash.com/photo-1570172619644-dfd03ed5d881?w=500",
        duracao_minutos: 75,
        profissional: {
          id: "3",
          nome: "Sofia Oliveira",
          especialidade: "Esteticista"
        }
      },
      {
        id: "5",
        profissional_id: "4",
        titulo: "Design de Sobrancelhas",
        descricao: "Modelagem perfeita com técnica de fio a fio e coloração",
        preco: 65.00,
        imagem_url: "https://images.unsplash.com/photo-1522337360788-8b13dee7a37e?w=500",
        duracao_minutos: 45,
        profissional: {
          id: "4",
          nome: "Beatriz Santos",
          especialidade: "Designer de Sobrancelhas"
        }
      },
      {
        id: "6",
        profissional_id: "2",
        titulo: "Depilação com Cera",
        descricao: "Depilação completa com cera quente e pós-depilação hidratante",
        preco: 75.00,
        imagem_url: "https://images.unsplash.com/photo-1515377905703-c4788e51af15?w=500",
        duracao_minutos: 50,
        profissional: {
          id: "2",
          nome: "Ana Costa",
          especialidade: "Depiladora"
        }
      }
    ];

    setTimeout(() => {
      setTrabalhos(mockTrabalhos);
      setLoading(false);
    }, 1000);
  }, []);

  const filteredTrabalhos = trabalhos.filter(trabalho =>
    trabalho.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trabalho.descricao.toLowerCase().includes(searchTerm.toLowerCase()) ||
    trabalho.profissional?.nome.toLowerCase().includes(searchTerm.toLowerCase())
  );

  // Mock ratings - em uma aplicação real, isso viria da API
  const getTrabalhoRating = (trabalhoId: string) => {
    const ratings = {
      "1": { average: 4.8, total: 24 },
      "2": { average: 4.9, total: 31 },
      "3": { average: 4.7, total: 18 },
      "4": { average: 4.9, total: 22 },
      "5": { average: 4.8, total: 27 },
      "6": { average: 4.6, total: 15 }
    };
    return ratings[trabalhoId as keyof typeof ratings] || { average: 0, total: 0 };
  };

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-8">
            <div className="h-32 bg-muted rounded-lg"></div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {Array.from({ length: 6 }).map((_, i) => (
                <div key={i} className="h-80 bg-muted rounded-lg"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-background">
      {/* Hero Section */}
      <section className="relative bg-hero-gradient text-white py-20 overflow-hidden">
        {/* Background Image */}
        <div 
          className="absolute inset-0 bg-cover bg-center opacity-20"
          style={{ backgroundImage: `url(${heroImage})` }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black/40 to-transparent" />
        
        <div className="relative container mx-auto px-4 text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Sparkles className="w-8 h-8" />
            <h1 className="text-4xl md:text-6xl font-bold">Beauty Hub</h1>
            <Sparkles className="w-8 h-8" />
          </div>
          <p className="text-xl md:text-2xl mb-8 opacity-90">
            Encontre os melhores profissionais de beleza da sua região
          </p>
          
          {/* Search Bar */}
          <div className="max-w-2xl mx-auto relative">
            <Search className="absolute left-4 top-1/2 transform -translate-y-1/2 w-5 h-5 text-gray-400" />
            <Input
              placeholder="Buscar por serviço, profissional..."
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              className="pl-12 h-14 text-lg bg-white/10 backdrop-blur-sm border-white/20 text-white placeholder:text-white/70"
            />
          </div>
        </div>
      </section>

      {/* Trabalhos Section */}
      <section className="py-16">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between mb-8">
            <div>
              <h2 className="text-3xl font-bold text-foreground mb-2">
                Serviços Disponíveis
              </h2>
              <p className="text-muted-foreground">
                {filteredTrabalhos.length} serviços encontrados
              </p>
            </div>
            
            <div className="flex items-center gap-2 text-sm text-muted-foreground">
              <Star className="w-4 h-4 fill-yellow-400 text-yellow-400" />
              Avaliações verificadas
            </div>
          </div>

          {filteredTrabalhos.length === 0 ? (
            <div className="text-center py-12">
              <Search className="w-16 h-16 mx-auto mb-4 text-muted-foreground" />
              <h3 className="text-xl font-medium mb-2">Nenhum serviço encontrado</h3>
              <p className="text-muted-foreground">
                Tente ajustar sua busca ou navegue por todos os serviços
              </p>
              <Button 
                onClick={() => setSearchTerm("")}
                variant="outline"
                className="mt-4"
              >
                Ver todos os serviços
              </Button>
            </div>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredTrabalhos.map((trabalho) => {
                const rating = getTrabalhoRating(trabalho.id);
                return (
                  <TrabalhoCard
                    key={trabalho.id}
                    trabalho={trabalho}
                    averageRating={rating.average}
                    totalReviews={rating.total}
                  />
                );
              })}
            </div>
          )}
        </div>
      </section>
    </div>
  );
};