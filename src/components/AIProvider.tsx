
import { createContext, useState, useContext, useEffect, ReactNode } from 'react';

interface AIContextType {
  generateResponse: (message: string) => Promise<string>;
  isLoading: boolean;
  apiKey: string;
  setApiKey: (key: string) => void;
  hasApiKey: boolean;
}

const AIContext = createContext<AIContextType | null>(null);

export const useAI = () => {
  const context = useContext(AIContext);
  if (!context) {
    throw new Error('useAI must be used within an AIProvider');
  }
  return context;
};

interface AIProviderProps {
  children: ReactNode;
}

export const AIProvider = ({ children }: AIProviderProps) => {
  const [apiKey, setApiKey] = useState<string>('');
  const [isLoading, setIsLoading] = useState(false);
  
  // Intenta cargar la API key del localStorage al inicio
  useEffect(() => {
    const savedApiKey = localStorage.getItem('groq_api_key');
    if (savedApiKey) {
      setApiKey(savedApiKey);
    }
  }, []);

  // Guarda la API key en localStorage cuando cambia
  useEffect(() => {
    if (apiKey) {
      localStorage.setItem('groq_api_key', apiKey);
    }
  }, [apiKey]);

  const generateResponse = async (message: string): Promise<string> => {
    if (!apiKey) {
      return "Por favor, introduce tu API key de Groq para continuar.";
    }

    setIsLoading(true);

    try {
      const response = await fetch('https://api.groq.com/openai/v1/chat/completions', {
        method: 'POST',
        headers: {
          'Authorization': `Bearer ${apiKey}`,
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({
          model: 'llama3-8b-8192',
          messages: [
            {
              role: 'system',
              content: 'Eres un asistente de compras y planificación de menús llamado Mercado Mágico. Ayudas a los usuarios a gestionar su lista de compras y a planificar sus menús semanales. Debes ser amable, servicial y dar respuestas concisas en español.'
            },
            {
              role: 'user',
              content: message
            }
          ],
          temperature: 0.2,
          max_tokens: 1000
        }),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error?.message || 'Error al comunicarse con la API');
      }

      const data = await response.json();
      return data.choices[0].message.content;
    } catch (error) {
      console.error('Error al generar respuesta:', error);
      return "Lo siento, ha ocurrido un error al procesar tu mensaje. Por favor, intenta de nuevo más tarde.";
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <AIContext.Provider 
      value={{ 
        generateResponse, 
        isLoading, 
        apiKey, 
        setApiKey, 
        hasApiKey: Boolean(apiKey) 
      }}
    >
      {children}
    </AIContext.Provider>
  );
};
