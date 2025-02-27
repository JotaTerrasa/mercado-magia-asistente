
import { useState } from "react";
import { useAI } from "./AIProvider";
import { Card, CardContent, CardDescription, CardFooter, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Key } from "lucide-react";

export const APIKeyForm = () => {
  const { apiKey, setApiKey } = useAI();
  const [inputKey, setInputKey] = useState(apiKey);
  const { toast } = useToast();

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (inputKey.trim()) {
      setApiKey(inputKey.trim());
      toast({
        title: "API Key guardada",
        description: "Tu API Key ha sido guardada correctamente",
      });
    } else {
      toast({
        title: "API Key requerida",
        description: "Por favor, introduce una API Key válida",
        variant: "destructive",
      });
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle className="flex items-center gap-2">
          <Key className="h-5 w-5" />
          API Key de Groq
        </CardTitle>
        <CardDescription>
          Para conectar con Llama 3, necesitas una API Key de Groq.
          Puedes obtener una en{" "}
          <a 
            href="https://console.groq.com/keys" 
            target="_blank" 
            rel="noopener noreferrer"
            className="text-indigo-600 hover:underline"
          >
            console.groq.com
          </a>
        </CardDescription>
      </CardHeader>
      <form onSubmit={handleSubmit}>
        <CardContent>
          <Input
            type="password"
            value={inputKey}
            onChange={(e) => setInputKey(e.target.value)}
            placeholder="Ingresa tu API Key de Groq"
            className="w-full"
          />
        </CardContent>
        <CardFooter>
          <Button type="submit" className="w-full">
            Guardar API Key
          </Button>
        </CardFooter>
      </form>
    </Card>
  );
};
