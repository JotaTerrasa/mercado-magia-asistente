
import { useState } from "react";
import { useAI } from "./AIProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { useToast } from "@/components/ui/use-toast";
import { MessageSquareText } from "lucide-react";

export const SystemPromptForm = () => {
  const { systemPrompt, setSystemPrompt } = useAI();
  const [inputPrompt, setInputPrompt] = useState(systemPrompt);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputPrompt.trim()) {
      setSystemPrompt(inputPrompt.trim());
      toast({
        title: "Prompt guardado",
        description: "Tu prompt del sistema ha sido guardado correctamente",
      });
    } else {
      toast({
        title: "Prompt requerido",
        description: "Por favor, introduce un prompt válido",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <MessageSquareText className="h-5 w-5" />
          Configurar Prompt del Sistema
        </CardTitle>
        <CardDescription>
          Personaliza cómo responde el asistente definiendo su comportamiento y estilo.
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Textarea
            value={inputPrompt}
            onChange={(e) => setInputPrompt(e.target.value)}
            placeholder="Escribe el prompt del sistema..."
            className="w-full min-h-[150px]"
          />
        </CardContent>
        <CardFooter className="flex gap-2">
          <Button 
            type="button" 
            variant="outline" 
            className="w-1/2"
            onClick={() => {
              const DEFAULT_PROMPT = 'Eres un asistente de compras y planificación de menús llamado Mercado Mágico. Ayudas a los usuarios a gestionar su lista de compras y a planificar sus menús semanales. Debes ser amable, servicial y dar respuestas concisas en español. Estructura tus respuestas en párrafos claros y ordenados, usando listas numeradas o con viñetas cuando sea apropiado.';
              setInputPrompt(DEFAULT_PROMPT);
            }}
          >
            Restaurar Predeterminado
          </Button>
          <Button type="submit" className="w-1/2">
            Guardar Prompt
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
