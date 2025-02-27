
import { useState, useRef, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Check, ChevronDown, ChevronUp, Send, ShoppingCart, Calendar } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Badge } from "@/components/ui/badge";
import { motion, AnimatePresence } from "framer-motion";
import { Card, CardContent } from "@/components/ui/card";

interface MenuItem {
  id: string;
  name: string;
  type: "desayuno" | "comida" | "cena";
  ingredients: string[];
}

interface ShoppingItem {
  id: string;
  name: string;
  checked: boolean;
  category: "frutas" | "verduras" | "carnes" | "lácteos" | "otros";
}

interface Message {
  id: string;
  content: string;
  type: "user" | "assistant";
  action?: "addItem" | "showShoppingList" | "addMenu" | "showMenus" | "toggleItem" | null;
  data?: any;
}

const Index = () => {
  const { toast } = useToast();
  const messageEndRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  
  // Estado para la lista de compras
  const [shoppingItems, setShoppingItems] = useState<ShoppingItem[]>([]);
  const [newItemName, setNewItemName] = useState("");
  const [newItemCategory, setNewItemCategory] = useState<ShoppingItem["category"]>("otros");
  
  // Estado para los menús
  const [menuItems, setMenuItems] = useState<MenuItem[]>([]);
  const [newMenuName, setNewMenuName] = useState("");
  const [newMenuType, setNewMenuType] = useState<MenuItem["type"]>("comida");
  const [newMenuIngredients, setNewMenuIngredients] = useState<string[]>([]);
  const [newIngredient, setNewIngredient] = useState("");

  // Estado para mostrar u ocultar ingredientes
  const [expandedMenuId, setExpandedMenuId] = useState<string | null>(null);
  
  // Estado para el chat
  const [messages, setMessages] = useState<Message[]>([
    {
      id: "welcome",
      content: "¡Hola! Soy tu asistente de Mercado Mágico. Puedo ayudarte a gestionar tu lista de compras y tus menús semanales. ¿Qué te gustaría hacer hoy?",
      type: "assistant",
      action: null
    }
  ]);
  const [inputValue, setInputValue] = useState("");
  
  // Estado para mostrar diferentes vistas 
  const [showShoppingInput, setShowShoppingInput] = useState(false);
  const [showMenuInput, setShowMenuInput] = useState(false);
  const [showShoppingList, setShowShoppingList] = useState(false);
  const [showMenuList, setShowMenuList] = useState(false);

  // Auto scroll al último mensaje
  useEffect(() => {
    messageEndRef.current?.scrollIntoView({ behavior: "smooth" });
  }, [messages]);

  // Función para enviar un mensaje
  const sendMessage = (text: string, action: Message["action"] = null, data: any = null) => {
    if (text.trim() === "") return;
    
    const newMessage: Message = {
      id: Date.now().toString(),
      content: text,
      type: "user",
      action,
      data
    };
    
    setMessages(prev => [...prev, newMessage]);
    setInputValue("");
    
    // Procesar mensaje del usuario
    setTimeout(() => {
      processUserMessage(newMessage);
    }, 500);
  };

  // Función para añadir un mensaje del asistente
  const addAssistantMessage = (content: string, action: Message["action"] = null, data: any = null) => {
    const newMessage: Message = {
      id: Date.now().toString(),
      content,
      type: "assistant",
      action,
      data
    };
    
    setMessages(prev => [...prev, newMessage]);
  };

  // Procesar mensaje del usuario
  const processUserMessage = (message: Message) => {
    const lowerContent = message.content.toLowerCase();
    
    // Si ya hay una acción asociada al mensaje
    if (message.action) {
      handleAction(message.action, message.data);
      return;
    }
    
    // Detectar intención del usuario
    if (lowerContent.includes("añadir") && (lowerContent.includes("producto") || lowerContent.includes("item") || lowerContent.includes("artículo") || lowerContent.includes("compra"))) {
      addAssistantMessage("¿Qué producto quieres añadir a tu lista de compras?", "addItem");
      setShowShoppingInput(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }
    
    if (lowerContent.includes("ver") && lowerContent.includes("lista")) {
      handleAction("showShoppingList");
      return;
    }
    
    if (lowerContent.includes("añadir") && lowerContent.includes("menú")) {
      addAssistantMessage("Vamos a crear un nuevo menú. ¿Cómo quieres llamarlo?", "addMenu");
      setShowMenuInput(true);
      setTimeout(() => {
        inputRef.current?.focus();
      }, 100);
      return;
    }
    
    if (lowerContent.includes("ver") && lowerContent.includes("menú")) {
      handleAction("showMenus");
      return;
    }
    
    // Respuesta genérica si no se detecta intención específica
    addAssistantMessage("Puedo ayudarte a gestionar tu lista de compras y tus menús. Puedes pedirme que añada productos, que cree menús o que te muestre tu lista de compras o tus menús existentes.");
  };

  // Manejar acciones específicas
  const handleAction = (action: Message["action"], data?: any) => {
    switch (action) {
      case "addItem":
        if (data) {
          addShoppingItem(data.name, data.category);
          addAssistantMessage(`He añadido "${data.name}" a tu lista de compras en la categoría "${data.category}".`);
          setShowShoppingInput(false);
        } else {
          // Ya se mostró el mensaje de solicitud
        }
        break;
        
      case "showShoppingList":
        setShowShoppingList(true);
        setShowMenuList(false);
        addAssistantMessage("Aquí tienes tu lista de compras:", "showShoppingList");
        break;
        
      case "addMenu":
        if (data) {
          if (data.step === "name") {
            setNewMenuName(data.name);
            addAssistantMessage(`¿Qué tipo de comida es "${data.name}"?`, "addMenu", { step: "type", name: data.name });
          } else if (data.step === "type") {
            setNewMenuType(data.type);
            setNewMenuName(data.name);
            addAssistantMessage(`Ahora añade los ingredientes para "${data.name}". ¿Cuál es el primer ingrediente?`, "addMenu", { step: "ingredients", name: data.name, type: data.type, ingredients: [] });
          } else if (data.step === "ingredients") {
            if (data.ingredient && data.ingredient !== "listo") {
              const updatedIngredients = [...data.ingredients, data.ingredient];
              addAssistantMessage(`He añadido "${data.ingredient}". ¿Quieres añadir otro ingrediente? (escribe "listo" cuando hayas terminado)`, "addMenu", { 
                step: "ingredients", 
                name: data.name, 
                type: data.type, 
                ingredients: updatedIngredients 
              });
            } else {
              createNewMenu(data.name, data.type, data.ingredients);
              addAssistantMessage(`¡Perfecto! He creado el menú "${data.name}" con ${data.ingredients.length} ingredientes.`);
              setShowMenuInput(false);
            }
          }
        } else {
          // Ya se mostró el mensaje de solicitud
        }
        break;
        
      case "showMenus":
        setShowMenuList(true);
        setShowShoppingList(false);
        addAssistantMessage("Aquí tienes tus menús:", "showMenus");
        break;
        
      case "toggleItem":
        if (data && data.id) {
          toggleItemChecked(data.id);
          const item = shoppingItems.find(item => item.id === data.id);
          if (item) {
            addAssistantMessage(`He ${item.checked ? 'desmarcado' : 'marcado'} "${item.name}" como ${item.checked ? 'pendiente' : 'comprado'}.`);
          }
        }
        break;
        
      default:
        break;
    }
  };

  // Función para agregar un nuevo ítem a la lista de compras
  const addShoppingItem = (name: string = newItemName, category: ShoppingItem["category"] = newItemCategory) => {
    if (name.trim() === "") {
      toast({
        title: "Por favor, introduce un nombre para el ítem",
        variant: "destructive",
      });
      return false;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: name.trim(),
      checked: false,
      category,
    };

    setShoppingItems([...shoppingItems, newItem]);
    setNewItemName("");
    
    toast({
      title: "Ítem añadido",
      description: `${name} se ha añadido a tu lista de compras`,
    });
    
    return true;
  };

  // Crear un nuevo menú con todos los datos
  const createNewMenu = (name: string, type: MenuItem["type"], ingredients: string[]) => {
    const newMenu: MenuItem = {
      id: Date.now().toString(),
      name: name.trim(),
      type,
      ingredients,
    };

    setMenuItems([...menuItems, newMenu]);
    
    // Agregar ingredientes a la lista de compras si no existen
    const newShoppingItems: ShoppingItem[] = [];
    
    ingredients.forEach((ingredient) => {
      // Verificar si el ingrediente ya está en la lista de compras
      const exists = shoppingItems.some(
        (item) => item.name.toLowerCase() === ingredient.toLowerCase()
      );
      
      if (!exists) {
        newShoppingItems.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: ingredient,
          checked: false,
          category: "otros",
        });
      }
    });
    
    if (newShoppingItems.length > 0) {
      setShoppingItems([...shoppingItems, ...newShoppingItems]);
      toast({
        title: "Ingredientes añadidos a la lista de compras",
        description: `${newShoppingItems.length} ingredientes nuevos se han añadido a tu lista`,
      });
    }
    
    // Restablecer el estado
    setNewMenuName("");
    setNewMenuIngredients([]);
    
    toast({
      title: "Menú añadido",
      description: `${name} se ha añadido a tus menús`,
    });
    
    return true;
  };

  // Función para eliminar un ítem de la lista de compras
  const removeShoppingItem = (id: string) => {
    setShoppingItems(shoppingItems.filter((item) => item.id !== id));
  };

  // Función para marcar un ítem como comprado
  const toggleItemChecked = (id: string) => {
    setShoppingItems(
      shoppingItems.map((item) =>
        item.id === id ? { ...item, checked: !item.checked } : item
      )
    );
  };

  // Función para eliminar un menú
  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  // Función para expandir/contraer los ingredientes de un menú
  const toggleMenuExpanded = (id: string) => {
    setExpandedMenuId(expandedMenuId === id ? null : id);
  };

  // Agregar todos los ingredientes de un menú a la lista de compras
  const addMenuIngredientsToShoppingList = (menu: MenuItem) => {
    const newShoppingItems: ShoppingItem[] = [];
    
    menu.ingredients.forEach((ingredient) => {
      // Verificar si el ingrediente ya está en la lista de compras
      const exists = shoppingItems.some(
        (item) => item.name.toLowerCase() === ingredient.toLowerCase()
      );
      
      if (!exists) {
        newShoppingItems.push({
          id: Date.now().toString() + Math.random().toString(36).substr(2, 9),
          name: ingredient,
          checked: false,
          category: "otros",
        });
      }
    });
    
    if (newShoppingItems.length > 0) {
      setShoppingItems([...shoppingItems, ...newShoppingItems]);
      toast({
        title: "Ingredientes añadidos",
        description: `${newShoppingItems.length} ingredientes de ${menu.name} añadidos a tu lista`,
      });
      
      addAssistantMessage(`He añadido ${newShoppingItems.length} ingredientes de "${menu.name}" a tu lista de compras.`);
    } else {
      toast({
        title: "Información",
        description: "Todos los ingredientes ya están en tu lista de compras",
      });
      
      addAssistantMessage("Todos los ingredientes de este menú ya están en tu lista de compras.");
    }
  };

  // Obtener el color de la categoría
  const getCategoryColor = (category: ShoppingItem["category"]) => {
    switch (category) {
      case "frutas":
        return "bg-green-100 text-green-800 border-green-200";
      case "verduras":
        return "bg-emerald-100 text-emerald-800 border-emerald-200";
      case "carnes":
        return "bg-red-100 text-red-800 border-red-200";
      case "lácteos":
        return "bg-blue-100 text-blue-800 border-blue-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Obtener el color del tipo de menú
  const getMenuTypeColor = (type: MenuItem["type"]) => {
    switch (type) {
      case "desayuno":
        return "bg-amber-100 text-amber-800 border-amber-200";
      case "comida":
        return "bg-indigo-100 text-indigo-800 border-indigo-200";
      case "cena":
        return "bg-purple-100 text-purple-800 border-purple-200";
      default:
        return "bg-gray-100 text-gray-800 border-gray-200";
    }
  };

  // Manejar la finalización de ingresar un elemento a la lista de compras
  const handleShoppingItemSubmit = () => {
    const success = addShoppingItem();
    if (success) {
      addAssistantMessage(`He añadido "${newItemName}" a tu lista de compras en la categoría "${newItemCategory}".`);
      setShowShoppingInput(false);
    }
  };

  // Manejar el envío del formulario
  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (showShoppingInput) {
      handleShoppingItemSubmit();
    } else if (showMenuInput) {
      // Aquí se manejaría la lógica de creación de menús, pero es más compleja
      // y está delegada a los mensajes específicos
    } else {
      sendMessage(inputValue);
    }
  };

  return (
    <div className="min-h-screen bg-neutral-50 px-4 py-8 md:py-12">
      <div className="max-w-3xl mx-auto">
        <motion.div
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5 }}
          className="mb-8 text-center"
        >
          <h1 className="text-3xl md:text-4xl font-light tracking-tight text-neutral-800 mb-2">
            Mercado Mágico
          </h1>
          <p className="text-neutral-500 text-sm md:text-base">
            Tu asistente personal para planificar menús y listas de compras
          </p>
        </motion.div>

        <div className="bg-white rounded-xl shadow-lg overflow-hidden border border-neutral-200">
          <div className="h-[500px] md:h-[600px] flex flex-col">
            <ScrollArea className="flex-grow p-4">
              <div className="space-y-4">
                <AnimatePresence>
                  {messages.map((message) => (
                    <motion.div
                      key={message.id}
                      initial={{ opacity: 0, y: 10 }}
                      animate={{ opacity: 1, y: 0 }}
                      exit={{ opacity: 0 }}
                      transition={{ duration: 0.2 }}
                      className={`flex ${message.type === "user" ? "justify-end" : "justify-start"}`}
                    >
                      <div 
                        className={`max-w-[80%] rounded-2xl px-4 py-3 ${
                          message.type === "user" 
                            ? "bg-indigo-500 text-white" 
                            : "bg-neutral-100 text-neutral-800"
                        }`}
                      >
                        {message.content}

                        {/* Mostrar lista de compras si está activada */}
                        {message.action === "showShoppingList" && showShoppingList && shoppingItems.length > 0 && (
                          <Card className="mt-3 bg-white overflow-hidden">
                            <CardContent className="p-3">
                              <div className="text-sm font-medium mb-2 text-neutral-700">Tu lista de compras:</div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {shoppingItems.map((item) => (
                                  <div 
                                    key={item.id}
                                    className={`flex items-center justify-between p-2 rounded-lg border ${
                                      item.checked 
                                        ? "bg-neutral-50 border-neutral-100" 
                                        : "bg-white border-neutral-200"
                                    }`}
                                  >
                                    <div className="flex items-center space-x-2 flex-1">
                                      <Button
                                        variant="outline"
                                        size="icon"
                                        className={`h-5 w-5 rounded-full ${
                                          item.checked 
                                            ? "bg-emerald-100 text-emerald-600 border-emerald-200" 
                                            : "bg-white text-neutral-300 border-neutral-200"
                                        }`}
                                        onClick={() => {
                                          sendMessage(`Marca ${item.name} como ${item.checked ? "pendiente" : "comprado"}`, "toggleItem", { id: item.id });
                                        }}
                                      >
                                        {item.checked && <Check className="h-3 w-3" />}
                                      </Button>
                                      <span className={`text-xs ${item.checked ? "line-through text-neutral-400" : "text-neutral-700"}`}>
                                        {item.name}
                                      </span>
                                    </div>
                                    <Badge className={`${getCategoryColor(item.category)} text-[10px] font-normal`}>
                                      {item.category}
                                    </Badge>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}

                        {/* Mostrar menús si está activado */}
                        {message.action === "showMenus" && showMenuList && menuItems.length > 0 && (
                          <Card className="mt-3 bg-white overflow-hidden">
                            <CardContent className="p-3">
                              <div className="text-sm font-medium mb-2 text-neutral-700">Tus menús semanales:</div>
                              <div className="space-y-2 max-h-48 overflow-y-auto">
                                {menuItems.map((menu) => (
                                  <div 
                                    key={menu.id}
                                    className="border border-neutral-200 rounded-lg overflow-hidden bg-white"
                                  >
                                    <div className="flex items-center justify-between p-2">
                                      <div className="flex items-center space-x-2">
                                        <Badge className={`${getMenuTypeColor(menu.type)} text-[10px] font-normal`}>
                                          {menu.type}
                                        </Badge>
                                        <span className="text-xs font-medium text-neutral-700">{menu.name}</span>
                                      </div>
                                      <div className="flex items-center space-x-1">
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-full text-neutral-400 hover:text-neutral-600"
                                          onClick={() => addMenuIngredientsToShoppingList(menu)}
                                          title="Añadir ingredientes a la lista de compras"
                                        >
                                          <Plus className="h-3 w-3" />
                                        </Button>
                                        <Button
                                          variant="ghost"
                                          size="icon"
                                          className="h-6 w-6 rounded-full text-neutral-400 hover:text-neutral-600"
                                          onClick={() => toggleMenuExpanded(menu.id)}
                                        >
                                          {expandedMenuId === menu.id ? (
                                            <ChevronUp className="h-3 w-3" />
                                          ) : (
                                            <ChevronDown className="h-3 w-3" />
                                          )}
                                        </Button>
                                      </div>
                                    </div>
                                    
                                    <AnimatePresence>
                                      {expandedMenuId === menu.id && (
                                        <motion.div
                                          initial={{ height: 0, opacity: 0 }}
                                          animate={{ height: "auto", opacity: 1 }}
                                          exit={{ height: 0, opacity: 0 }}
                                          transition={{ duration: 0.2 }}
                                          className="px-2 pb-2 overflow-hidden"
                                        >
                                          <div className="pt-1 border-t border-neutral-100">
                                            <p className="text-[10px] text-neutral-500 mb-1">Ingredientes:</p>
                                            <div className="flex flex-wrap gap-1">
                                              {menu.ingredients.map((ingredient, index) => (
                                                <Badge 
                                                  key={index} 
                                                  className="bg-neutral-100 text-neutral-700 border-neutral-200 text-[10px]"
                                                >
                                                  {ingredient}
                                                </Badge>
                                              ))}
                                            </div>
                                          </div>
                                        </motion.div>
                                      )}
                                    </AnimatePresence>
                                  </div>
                                ))}
                              </div>
                            </CardContent>
                          </Card>
                        )}
                      </div>
                    </motion.div>
                  ))}
                </AnimatePresence>
                <div ref={messageEndRef} />
              </div>
            </ScrollArea>

            <div className="p-4 border-t border-neutral-200 bg-white">
              <form onSubmit={handleSubmit} className="flex items-end gap-2">
                <div className="flex-1 space-y-2">
                  {showShoppingInput ? (
                    <div className="flex flex-col space-y-2">
                      <div className="text-xs text-neutral-500">Añadiendo producto a la lista</div>
                      <div className="flex gap-2">
                        <Input
                          ref={inputRef}
                          type="text"
                          placeholder="Nombre del producto..."
                          value={newItemName}
                          onChange={(e) => setNewItemName(e.target.value)}
                          className="border-neutral-200 text-sm"
                        />
                        <Select
                          value={newItemCategory}
                          onValueChange={(value) => setNewItemCategory(value as ShoppingItem["category"])}
                        >
                          <SelectTrigger className="w-32 md:w-40 border-neutral-200 text-sm">
                            <SelectValue placeholder="Categoría" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="frutas">Frutas</SelectItem>
                            <SelectItem value="verduras">Verduras</SelectItem>
                            <SelectItem value="carnes">Carnes</SelectItem>
                            <SelectItem value="lácteos">Lácteos</SelectItem>
                            <SelectItem value="otros">Otros</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  ) : showMenuInput ? (
                    <div className="flex flex-col space-y-2">
                      <div className="text-xs text-neutral-500">Creando un nuevo menú</div>
                      <Input
                        ref={inputRef}
                        type="text"
                        placeholder="¿Qué quieres hacer?"
                        value={inputValue}
                        onChange={(e) => setInputValue(e.target.value)}
                        className="border-neutral-200 text-sm"
                      />
                    </div>
                  ) : (
                    <Input
                      ref={inputRef}
                      type="text"
                      placeholder="Escribe un mensaje..."
                      value={inputValue}
                      onChange={(e) => setInputValue(e.target.value)}
                      className="border-neutral-200 text-sm"
                    />
                  )}
                </div>
                
                <div className="flex gap-2">
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline"
                    onClick={() => {
                      setShowShoppingList(prev => !prev);
                      setShowMenuList(false);
                      if (!showShoppingList) {
                        sendMessage("Ver mi lista de compras", "showShoppingList");
                      }
                    }}
                    className={`rounded-full ${showShoppingList ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
                  >
                    <ShoppingCart className="h-4 w-4" />
                  </Button>
                  
                  <Button 
                    type="button" 
                    size="icon" 
                    variant="outline"
                    onClick={() => {
                      setShowMenuList(prev => !prev);
                      setShowShoppingList(false);
                      if (!showMenuList) {
                        sendMessage("Ver mis menús", "showMenus");
                      }
                    }}
                    className={`rounded-full ${showMenuList ? 'bg-indigo-50 text-indigo-600 border-indigo-200' : ''}`}
                  >
                    <Calendar className="h-4 w-4" />
                  </Button>
                  
                  <Button type="submit" size="icon" className="rounded-full bg-indigo-500 hover:bg-indigo-600">
                    <Send className="h-4 w-4" />
                  </Button>
                </div>
              </form>
              
              <div className="mt-3 flex justify-center">
                <div className="flex gap-1 text-xs text-neutral-400">
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => {
                      sendMessage("Añadir producto", "addItem");
                      setShowShoppingInput(true);
                    }}
                  >
                    Añadir producto
                  </Button>
                  <Button
                    type="button"
                    variant="ghost"
                    size="sm"
                    className="h-auto py-1 px-2 text-xs"
                    onClick={() => {
                      sendMessage("Añadir menú", "addMenu");
                      setShowMenuInput(true);
                    }}
                  >
                    Añadir menú
                  </Button>
                </div>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Index;
