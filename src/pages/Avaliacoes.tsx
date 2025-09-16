import { useState, useEffect } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { ArrowLeft, Star, MessageSquare } from "lucide-react";
import { AvaliacaoCard } from "@/components/AvaliacaoCard";
import { Avaliacao, Profissional } from "@/types/beauty";

export const Avaliacoes = () => {
  const { id } = useParams<{ id: string }>();
  const navigate = useNavigate();
  const [profissional, setProfissional] = useState<Profissional | null>(null);
  const [avaliacoes, setAvaliacoes] = useState<Avaliacao[]>([]);
  const [loading, setLoading] = useState(true);

  // Mock data para profissionais
  useEffect(() => {
    const mockProfissionais: Profissional[] = [
      {
        id: "1",
        nome: "Maria Silva",
        especialidade: "Cabeleireira"
      },
      {
        id: "2",
        nome: "Ana Costa",
        especialidade: "Massoterapeuta"
      },
      {
        id: "3",
        nome: "Sofia Oliveira",
        especialidade: "Esteticista"
      },
      {
        id: "4",
        nome: "Beatriz Santos",
        especialidade: "Designer de Sobrancelhas"
      }
    ];

    // Find profissional by ID
    const foundProfissional = mockProfissionais.find(p => p.id === id);
    if (foundProfissional) {
      setProfissional(foundProfissional);
    }
  }, [id]);

  // Mock data para avaliações
  useEffect(() => {
    if (!profissional) return;
    const mockAvaliacoes: Avaliacao[] = [
      {
        id: "1",
        agendamento_id: "1",
        nota: 5,
        comentario: "Excelente profissional! Serviço impecável e atendimento nota 10. Super recomendo!",
        data: "2024-08-01",
        agendamento: {
          id: "1",
          nome_cliente: "Ana Paula",
          telefone: "11999999999",
          trabalho_id: "1",
          horario_id: "1",
          status: "realizado" as const
        }
      },
      {
        id: "2",
        agendamento_id: "2",
        nota: 5,
        comentario: "Adorei o resultado! Muito caprichosa e profissional. Voltarei sempre!",
        data: "2024-07-28",
        agendamento: {
          id: "2",
          nome_cliente: "Carla Santos",
          telefone: "11888888888",
          trabalho_id: "1",
          horario_id: "2",
          status: "realizado" as const
        }
      },
      {
        id: "3",
        agendamento_id: "3",
        nota: 4,
        comentario: "Muito bom atendimento, ambiente agradável. Apenas o tempo de espera foi um pouco maior que o esperado.",
        data: "2024-07-25",
        agendamento: {
          id: "3",
          nome_cliente: "Fernanda Lima",
          telefone: "11777777777",
          trabalho_id: "2",
          horario_id: "3",
          status: "realizado" as const
        }
      },
      {
        id: "4",
        agendamento_id: "4",
        nota: 5,
        comentario: "Simplesmente perfeito! Superou minhas expectativas. Profissional muito competente.",
        data: "2024-07-22",
        agendamento: {
          id: "4",
          nome_cliente: "Juliana Rocha",
          telefone: "11666666666",
          trabalho_id: "1",
          horario_id: "4",
          status: "realizado" as const
        }
      },
      {
        id: "5",
        agendamento_id: "5",
        nota: 5,
        comentario: "Excelente trabalho! Muito atenciosa e cuidadosa. Recomendo de olhos fechados!",
        data: "2024-07-20",
        agendamento: {
          id: "5",
          nome_cliente: "Patricia Costa",
          telefone: "11555555555",
          trabalho_id: "2",
          horario_id: "5",
          status: "realizado" as const
        }
      }
    ];

    setTimeout(() => {
      setAvaliacoes(mockAvaliacoes);
      setLoading(false);
    }, 800);
  }, [profissional.id]);

  // Calcular estatísticas
  const totalAvaliacoes = avaliacoes.length;
  const mediaNotas = totalAvaliacoes > 0 
    ? (avaliacoes.reduce((sum, av) => sum + av.nota, 0) / totalAvaliacoes).toFixed(1)
    : "0.0";

  const distribuicaoNotas = {
    5: avaliacoes.filter(av => av.nota === 5).length,
    4: avaliacoes.filter(av => av.nota === 4).length,
    3: avaliacoes.filter(av => av.nota === 3).length,
    2: avaliacoes.filter(av => av.nota === 2).length,
    1: avaliacoes.filter(av => av.nota === 1).length,
  };

  const handleBack = () => {
    navigate(-1);
  };

  // Show loading if profissional is not found yet
  if (!profissional) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
        </div>
      </div>
    );
  }

  if (loading) {
    return (
      <div className="min-h-screen bg-background">
        <div className="container mx-auto px-4 py-8">
          <div className="animate-pulse space-y-6">
            <div className="h-8 bg-muted rounded w-64"></div>
            <div className="h-32 bg-muted rounded"></div>
            <div className="space-y-4">
              {Array.from({ length: 3 }).map((_, i) => (
                <div key={i} className="h-24 bg-muted rounded"></div>
              ))}
            </div>
          </div>
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
            onClick={handleBack}
          >
            <ArrowLeft className="w-4 h-4" />
          </Button>
          <div>
            <h1 className="text-3xl font-bold text-foreground">Avaliações</h1>
            <p className="text-muted-foreground">{profissional.nome}</p>
          </div>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Resumo das avaliações */}
          <div className="lg:col-span-1">
            <Card className="sticky top-4">
              <CardHeader>
                <CardTitle className="flex items-center gap-2">
                  <Star className="w-5 h-5 text-primary" />
                  Resumo das Avaliações
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="text-center">
                  <div className="text-4xl font-bold text-primary mb-2">{mediaNotas}</div>
                  <div className="flex justify-center gap-1 mb-2">
                    {Array.from({ length: 5 }, (_, index) => (
                      <Star
                        key={index}
                        className={`w-5 h-5 ${
                          index < Math.round(Number(mediaNotas))
                            ? "fill-yellow-400 text-yellow-400"
                            : "text-gray-300"
                        }`}
                      />
                    ))}
                  </div>
                  <p className="text-sm text-muted-foreground">
                    Baseado em {totalAvaliacoes} avaliações
                  </p>
                </div>

                <div className="space-y-3">
                  <h4 className="font-medium">Distribuição das notas:</h4>
                  {Object.entries(distribuicaoNotas).reverse().map(([stars, count]) => (
                    <div key={stars} className="flex items-center gap-2 text-sm">
                      <span className="w-8">{stars}★</span>
                      <div className="flex-1 bg-muted rounded-full h-2">
                        <div 
                          className="bg-yellow-400 h-full rounded-full transition-all"
                          style={{ 
                            width: totalAvaliacoes > 0 ? `${(count / totalAvaliacoes) * 100}%` : '0%' 
                          }}
                        />
                      </div>
                      <span className="w-8 text-muted-foreground">{count}</span>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Lista de avaliações */}
          <div className="lg:col-span-2 space-y-4">
            {totalAvaliacoes === 0 ? (
              <Card>
                <CardContent className="p-8 text-center">
                  <MessageSquare className="w-12 h-12 mx-auto mb-4 text-muted-foreground" />
                  <h3 className="font-medium mb-2">Nenhuma avaliação ainda</h3>
                  <p className="text-sm text-muted-foreground">
                    Este profissional ainda não possui avaliações.
                  </p>
                </CardContent>
              </Card>
            ) : (
              <>
                <div className="flex items-center justify-between">
                  <h2 className="text-xl font-semibold">
                    Todas as avaliações ({totalAvaliacoes})
                  </h2>
                </div>
                
                <div className="space-y-4">
                  {avaliacoes.map((avaliacao) => (
                    <AvaliacaoCard key={avaliacao.id} avaliacao={avaliacao} />
                  ))}
                </div>
              </>
            )}
          </div>
        </div>
      </div>
    </div>
  );
};