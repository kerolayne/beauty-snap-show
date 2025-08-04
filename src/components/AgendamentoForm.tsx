import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Calendar, User, Phone, MessageSquare } from "lucide-react";
import { Trabalho, Horario } from "@/types/beauty";
import { formatPrice, formatDate, formatTime, isValidPhone } from "@/lib/formatters";
import { useToast } from "@/hooks/use-toast";

interface AgendamentoFormProps {
  trabalho: Trabalho;
  horario: Horario;
  onSubmit: (data: AgendamentoData) => void;
  loading?: boolean;
}

export interface AgendamentoData {
  nomeCliente: string;
  telefone: string;
  observacoes?: string;
}

export const AgendamentoForm = ({ trabalho, horario, onSubmit, loading }: AgendamentoFormProps) => {
  const [nomeCliente, setNomeCliente] = useState("");
  const [telefone, setTelefone] = useState("");
  const [observacoes, setObservacoes] = useState("");
  const [errors, setErrors] = useState<Record<string, string>>({});
  const { toast } = useToast();

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!nomeCliente.trim()) {
      newErrors.nomeCliente = "Nome é obrigatório";
    }

    if (!telefone.trim()) {
      newErrors.telefone = "Telefone é obrigatório";
    } else if (!isValidPhone(telefone)) {
      newErrors.telefone = "Telefone deve ter 10 ou 11 dígitos";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!validateForm()) {
      toast({
        title: "Erro no formulário",
        description: "Por favor, corrija os campos destacados",
        variant: "destructive"
      });
      return;
    }

    onSubmit({
      nomeCliente: nomeCliente.trim(),
      telefone: telefone.replace(/\D/g, ''),
      observacoes: observacoes.trim() || undefined
    });
  };

  return (
    <div className="space-y-6">
      {/* Resumo do agendamento */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Calendar className="w-5 h-5 text-primary" />
            Resumo do Agendamento
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div>
            <h3 className="font-medium">{trabalho.titulo}</h3>
            <p className="text-sm text-muted-foreground">{trabalho.descricao}</p>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Data e hora:</span>
            <span className="font-medium">
              {formatDate(horario.data)} às {formatTime(horario.hora)}
            </span>
          </div>
          
          <div className="flex justify-between items-center">
            <span className="text-sm">Preço:</span>
            <span className="font-medium text-primary">{formatPrice(trabalho.preco)}</span>
          </div>
        </CardContent>
      </Card>

      {/* Formulário */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <User className="w-5 h-5 text-primary" />
            Seus Dados
          </CardTitle>
        </CardHeader>
        <CardContent>
          <form onSubmit={handleSubmit} className="space-y-4">
            <div>
              <Label htmlFor="nome">Nome completo *</Label>
              <Input
                id="nome"
                value={nomeCliente}
                onChange={(e) => setNomeCliente(e.target.value)}
                placeholder="Seu nome completo"
                className={errors.nomeCliente ? "border-destructive" : ""}
              />
              {errors.nomeCliente && (
                <p className="text-sm text-destructive mt-1">{errors.nomeCliente}</p>
              )}
            </div>

            <div>
              <Label htmlFor="telefone">Telefone *</Label>
              <div className="relative">
                <Phone className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-muted-foreground" />
                <Input
                  id="telefone"
                  value={telefone}
                  onChange={(e) => setTelefone(e.target.value)}
                  placeholder="(11) 99999-9999"
                  className={`pl-10 ${errors.telefone ? "border-destructive" : ""}`}
                />
              </div>
              {errors.telefone && (
                <p className="text-sm text-destructive mt-1">{errors.telefone}</p>
              )}
            </div>

            <div>
              <Label htmlFor="observacoes">Observações</Label>
              <div className="relative">
                <MessageSquare className="absolute left-3 top-3 w-4 h-4 text-muted-foreground" />
                <Textarea
                  id="observacoes"
                  value={observacoes}
                  onChange={(e) => setObservacoes(e.target.value)}
                  placeholder="Alguma observação especial..."
                  className="pl-10"
                  rows={3}
                />
              </div>
            </div>

            <Button 
              type="submit" 
              className="w-full bg-beauty-gradient hover:opacity-90 transition-opacity"
              disabled={loading}
            >
              {loading ? "Agendando..." : "Confirmar Agendamento"}
            </Button>
          </form>
        </CardContent>
      </Card>
    </div>
  );
};