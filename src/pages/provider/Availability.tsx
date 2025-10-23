import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Select, SelectContent, SelectItem, SelectTrigger, SelectValue } from "@/components/ui/select";
import { useAuth } from "@/lib/useAuth";
import { updateProviderAvailability } from "@/lib/user-service";
import { UserProfile } from "@/types/auth";

const weekDays = [
  { value: "0", label: "Domingo" },
  { value: "1", label: "Segunda" },
  { value: "2", label: "Terça" },
  { value: "3", label: "Quarta" },
  { value: "4", label: "Quinta" },
  { value: "5", label: "Sexta" },
  { value: "6", label: "Sábado" },
];

const timeSlots = Array.from({ length: 24 }, (_, i) => {
  const hour = i.toString().padStart(2, "0");
  return {
    value: `${hour}:00`,
    label: `${hour}:00`,
  };
});

export default function ProviderAvailability() {
  const { user } = useAuth();
  const [availability, setAvailability] = useState<UserProfile['provider']['availability']>({});

  useEffect(() => {
    if (user?.profile?.provider?.availability) {
      setAvailability(user.profile.provider.availability);
    }
  }, [user]);

  const handleUpdateAvailability = async (day: string, field: 'start' | 'end', value: string) => {
    if (!user?.profile?.uid) return;

    const newAvailability = {
      ...availability,
      [day]: {
        ...availability[day],
        [field]: value,
      },
    };

    await updateProviderAvailability(user.profile.uid, newAvailability);
    setAvailability(newAvailability);
  };

  const handleToggleDay = async (day: string) => {
    if (!user?.profile?.uid) return;

    const newAvailability = { ...availability };
    if (newAvailability[day]) {
      delete newAvailability[day];
    } else {
      newAvailability[day] = {
        start: "09:00",
        end: "17:00",
      };
    }

    await updateProviderAvailability(user.profile.uid, newAvailability);
    setAvailability(newAvailability);
  };

  return (
    <div className="container mx-auto px-4 py-8">
      <h1 className="text-3xl font-bold mb-8">Gerenciar Disponibilidade</h1>

      <Card>
        <CardHeader>
          <CardTitle>Horários de Atendimento</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="space-y-6">
            {weekDays.map((day) => (
              <div key={day.value} className="grid grid-cols-1 md:grid-cols-3 gap-4 items-center">
                <div className="flex items-center gap-2">
                  <Button
                    variant={availability[day.value] ? "default" : "outline"}
                    onClick={() => handleToggleDay(day.value)}
                  >
                    {day.label}
                  </Button>
                </div>

                {availability[day.value] && (
                  <>
                    <div className="space-y-2">
                      <Label>Horário inicial</Label>
                      <Select
                        value={availability[day.value]?.start}
                        onValueChange={(value) => handleUpdateAvailability(day.value, 'start', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>

                    <div className="space-y-2">
                      <Label>Horário final</Label>
                      <Select
                        value={availability[day.value]?.end}
                        onValueChange={(value) => handleUpdateAvailability(day.value, 'end', value)}
                      >
                        <SelectTrigger>
                          <SelectValue placeholder="Selecione" />
                        </SelectTrigger>
                        <SelectContent>
                          {timeSlots.map((time) => (
                            <SelectItem key={time.value} value={time.value}>
                              {time.label}
                            </SelectItem>
                          ))}
                        </SelectContent>
                      </Select>
                    </div>
                  </>
                )}
              </div>
            ))}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}