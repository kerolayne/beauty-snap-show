import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { useAuth } from "@/lib/useAuth";

export default function ProviderDashboard() {
  const { user } = useAuth();

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Painel do Fornecedor</h1>
      
      <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
        <Card>
          <CardHeader>
            <CardTitle>Meus Serviços</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Gerenciar serviços oferecidos</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Disponibilidade</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Configurar horários disponíveis</p>
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Agendamentos</CardTitle>
          </CardHeader>
          <CardContent>
            <p>Ver próximos agendamentos</p>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}