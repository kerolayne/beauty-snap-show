import { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useAuth } from "@/lib/useAuth";
import { updateProviderSpecialties } from "@/lib/user-service";

export default function ProviderServices() {
  const { user } = useAuth();
  const [services, setServices] = useState(user?.profile?.provider?.specialties || []);
  const [newService, setNewService] = useState("");

  const handleAddService = async () => {
    if (!newService.trim() || !user?.profile) return;

    const updatedServices = [...services, newService.trim()];
    await updateProviderSpecialties(user.profile.uid, updatedServices);
    setServices(updatedServices);
    setNewService("");
  };

  const handleRemoveService = async (index: number) => {
    if (!user?.profile) return;

    const updatedServices = services.filter((_, i) => i !== index);
    await updateProviderSpecialties(user.profile.uid, updatedServices);
    setServices(updatedServices);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Serviços</h1>

      <Card className="mb-6">
        <CardHeader>
          <CardTitle>Adicionar Novo Serviço</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex gap-4">
            <div className="flex-1">
              <Label htmlFor="newService">Nome do serviço</Label>
              <Input
                id="newService"
                value={newService}
                onChange={(e) => setNewService(e.target.value)}
                placeholder="Ex: Corte de cabelo, Manicure, etc."
              />
            </div>
            <div className="flex items-end">
              <Button onClick={handleAddService}>Adicionar</Button>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardHeader>
          <CardTitle>Meus Serviços</CardTitle>
        </CardHeader>
        <CardContent>
          {services.length === 0 ? (
            <p className="text-muted-foreground">Nenhum serviço cadastrado.</p>
          ) : (
            <ul className="space-y-2">
              {services.map((service, index) => (
                <li key={index} className="flex justify-between items-center border-b py-2">
                  <span>{service}</span>
                  <Button
                    variant="destructive"
                    size="sm"
                    onClick={() => handleRemoveService(index)}
                  >
                    Remover
                  </Button>
                </li>
              ))}
            </ul>
          )}
        </CardContent>
      </Card>
    </div>
  );
}