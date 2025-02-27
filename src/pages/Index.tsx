
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/components/ui/use-toast";
import { Plus, X, Check, ChevronDown, ChevronUp } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
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

const Index = () => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("listaCompra");
  
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
  
  // Filtrar por categoría
  const [categoryFilter, setCategoryFilter] = useState<ShoppingItem["category"] | "todos">("todos");
  
  // Dialog abierto/cerrado
  const [isMenuDialogOpen, setIsMenuDialogOpen] = useState(false);

  // Función para agregar un nuevo ítem a la lista de compras
  const addShoppingItem = () => {
    if (newItemName.trim() === "") {
      toast({
        title: "Por favor, introduce un nombre para el ítem",
        variant: "destructive",
      });
      return;
    }

    const newItem: ShoppingItem = {
      id: Date.now().toString(),
      name: newItemName.trim(),
      checked: false,
      category: newItemCategory,
    };

    setShoppingItems([...shoppingItems, newItem]);
    setNewItemName("");
    
    toast({
      title: "Ítem añadido",
      description: `${newItemName} se ha añadido a tu lista de compras`,
    });
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

  // Función para agregar un ingrediente al nuevo menú
  const addIngredientToNewMenu = () => {
    if (newIngredient.trim() === "") return;
    
    setNewMenuIngredients([...newMenuIngredients, newIngredient.trim()]);
    setNewIngredient("");
  };

  // Función para eliminar un ingrediente del nuevo menú
  const removeIngredientFromNewMenu = (ingredient: string) => {
    setNewMenuIngredients(newMenuIngredients.filter((ing) => ing !== ingredient));
  };

  // Función para agregar un nuevo menú
  const addMenuItem = () => {
    if (newMenuName.trim() === "") {
      toast({
        title: "Por favor, introduce un nombre para el menú",
        variant: "destructive",
      });
      return;
    }

    if (newMenuIngredients.length === 0) {
      toast({
        title: "Por favor, añade al menos un ingrediente",
        variant: "destructive",
      });
      return;
    }

    const newMenu: MenuItem = {
      id: Date.now().toString(),
      name: newMenuName.trim(),
      type: newMenuType,
      ingredients: newMenuIngredients,
    };

    setMenuItems([...menuItems, newMenu]);
    
    // Agregar ingredientes a la lista de compras si no existen
    const newShoppingItems: ShoppingItem[] = [];
    
    newMenuIngredients.forEach((ingredient) => {
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
    setIsMenuDialogOpen(false);
    
    toast({
      title: "Menú añadido",
      description: `${newMenuName} se ha añadido a tus menús`,
    });
  };

  // Función para eliminar un menú
  const removeMenuItem = (id: string) => {
    setMenuItems(menuItems.filter((item) => item.id !== id));
  };

  // Filtrar elementos de la lista de compras por categoría
  const filteredShoppingItems = categoryFilter === "todos"
    ? shoppingItems
    : shoppingItems.filter((item) => item.category === categoryFilter);

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
    } else {
      toast({
        title: "Información",
        description: "Todos los ingredientes ya están en tu lista de compras",
      });
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

  return (
    <div className="min-h-screen bg-neutral-50 p-4 md:p-8">
      <div className="max-w-4xl mx-auto">
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

        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          className="w-full"
        >
          <TabsList className="grid grid-cols-2 mb-6 w-full max-w-md mx-auto">
            <TabsTrigger value="listaCompra" className="text-sm md:text-base">Lista de Compra</TabsTrigger>
            <TabsTrigger value="menus" className="text-sm md:text-base">Menús Semanales</TabsTrigger>
          </TabsList>

          <TabsContent value="listaCompra" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-neutral-200 shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl text-neutral-800 font-medium">
                    Tu Lista de Compras
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex items-end gap-3 mb-6">
                    <div className="flex-1">
                      <Input
                        type="text"
                        placeholder="Añadir un nuevo ítem..."
                        value={newItemName}
                        onChange={(e) => setNewItemName(e.target.value)}
                        onKeyDown={(e) => e.key === "Enter" && addShoppingItem()}
                        className="border-neutral-200 focus:border-neutral-300"
                      />
                    </div>
                    <Select
                      value={newItemCategory}
                      onValueChange={(value) => setNewItemCategory(value as ShoppingItem["category"])}
                    >
                      <SelectTrigger className="w-32 md:w-40 border-neutral-200">
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
                    <Button onClick={addShoppingItem} variant="outline" size="icon" className="h-10 w-10 rounded-full border-neutral-200">
                      <Plus className="h-4 w-4" />
                    </Button>
                  </div>

                  <div className="mb-4">
                    <Select
                      value={categoryFilter}
                      onValueChange={(value) => setCategoryFilter(value as ShoppingItem["category"] | "todos")}
                    >
                      <SelectTrigger className="w-full border-neutral-200">
                        <SelectValue placeholder="Filtrar por categoría" />
                      </SelectTrigger>
                      <SelectContent>
                        <SelectItem value="todos">Todos los ítems</SelectItem>
                        <SelectItem value="frutas">Frutas</SelectItem>
                        <SelectItem value="verduras">Verduras</SelectItem>
                        <SelectItem value="carnes">Carnes</SelectItem>
                        <SelectItem value="lácteos">Lácteos</SelectItem>
                        <SelectItem value="otros">Otros</SelectItem>
                      </SelectContent>
                    </Select>
                  </div>

                  <ScrollArea className="h-[400px] pr-4">
                    <AnimatePresence>
                      {filteredShoppingItems.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-8 text-neutral-400"
                        >
                          Tu lista está vacía. Añade algunos ítems.
                        </motion.div>
                      ) : (
                        <ul className="space-y-2">
                          {filteredShoppingItems.map((item) => (
                            <motion.li
                              key={item.id}
                              initial={{ opacity: 0, x: -10 }}
                              animate={{ opacity: 1, x: 0 }}
                              exit={{ opacity: 0, x: 10 }}
                              transition={{ duration: 0.2 }}
                              className={`flex items-center justify-between p-3 rounded-lg border ${
                                item.checked 
                                  ? "bg-neutral-50 border-neutral-100" 
                                  : "bg-white border-neutral-200"
                              }`}
                            >
                              <div className="flex items-center space-x-3 flex-1">
                                <Button
                                  variant="outline"
                                  size="icon"
                                  className={`h-6 w-6 rounded-full ${
                                    item.checked 
                                      ? "bg-emerald-100 text-emerald-600 border-emerald-200" 
                                      : "bg-white text-neutral-300 border-neutral-200"
                                  }`}
                                  onClick={() => toggleItemChecked(item.id)}
                                >
                                  {item.checked && <Check className="h-3 w-3" />}
                                </Button>
                                <span className={`${item.checked ? "line-through text-neutral-400" : "text-neutral-700"}`}>
                                  {item.name}
                                </span>
                              </div>
                              <div className="flex items-center gap-2">
                                <Badge className={`${getCategoryColor(item.category)} text-xs font-normal`}>
                                  {item.category}
                                </Badge>
                                <Button
                                  variant="ghost"
                                  size="icon"
                                  className="h-7 w-7 rounded-full text-neutral-400 hover:text-neutral-600"
                                  onClick={() => removeShoppingItem(item.id)}
                                >
                                  <X className="h-3.5 w-3.5" />
                                </Button>
                              </div>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>

          <TabsContent value="menus" className="mt-0">
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.3 }}
            >
              <Card className="border border-neutral-200 shadow-sm">
                <CardHeader className="pb-0">
                  <CardTitle className="text-xl text-neutral-800 font-medium">
                    Tus Menús Semanales
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="mb-6">
                    <Dialog open={isMenuDialogOpen} onOpenChange={setIsMenuDialogOpen}>
                      <DialogTrigger asChild>
                        <Button variant="outline" className="w-full border-dashed border-neutral-200 hover:border-neutral-300 text-neutral-600">
                          <Plus className="h-4 w-4 mr-2" /> Añadir nuevo menú
                        </Button>
                      </DialogTrigger>
                      <DialogContent className="sm:max-w-[425px]">
                        <DialogHeader>
                          <DialogTitle>Crear nuevo menú</DialogTitle>
                        </DialogHeader>
                        <div className="space-y-4 py-4">
                          <div className="space-y-2">
                            <Input
                              type="text"
                              placeholder="Nombre del menú..."
                              value={newMenuName}
                              onChange={(e) => setNewMenuName(e.target.value)}
                              className="border-neutral-200"
                            />
                          </div>
                          
                          <div className="space-y-2">
                            <Select
                              value={newMenuType}
                              onValueChange={(value) => setNewMenuType(value as MenuItem["type"])}
                            >
                              <SelectTrigger className="w-full border-neutral-200">
                                <SelectValue placeholder="Tipo de comida" />
                              </SelectTrigger>
                              <SelectContent>
                                <SelectItem value="desayuno">Desayuno</SelectItem>
                                <SelectItem value="comida">Comida</SelectItem>
                                <SelectItem value="cena">Cena</SelectItem>
                              </SelectContent>
                            </Select>
                          </div>
                          
                          <div className="space-y-2">
                            <div className="flex items-center gap-2">
                              <Input
                                type="text"
                                placeholder="Añadir ingrediente..."
                                value={newIngredient}
                                onChange={(e) => setNewIngredient(e.target.value)}
                                onKeyDown={(e) => e.key === "Enter" && addIngredientToNewMenu()}
                                className="border-neutral-200"
                              />
                              <Button onClick={addIngredientToNewMenu} variant="outline" size="icon" className="h-10 w-10 rounded-full border-neutral-200">
                                <Plus className="h-4 w-4" />
                              </Button>
                            </div>
                            
                            {newMenuIngredients.length > 0 && (
                              <div className="mt-3">
                                <p className="text-sm text-neutral-500 mb-2">Ingredientes:</p>
                                <div className="flex flex-wrap gap-2">
                                  {newMenuIngredients.map((ingredient, index) => (
                                    <Badge 
                                      key={index} 
                                      className="bg-neutral-100 text-neutral-700 border-neutral-200 cursor-pointer hover:bg-neutral-200"
                                      onClick={() => removeIngredientFromNewMenu(ingredient)}
                                    >
                                      {ingredient} <X className="h-3 w-3 ml-1" />
                                    </Badge>
                                  ))}
                                </div>
                              </div>
                            )}
                          </div>
                        </div>
                        <Button onClick={addMenuItem} className="w-full">
                          Crear menú
                        </Button>
                      </DialogContent>
                    </Dialog>
                  </div>

                  <ScrollArea className="h-[400px] pr-4">
                    <AnimatePresence>
                      {menuItems.length === 0 ? (
                        <motion.div
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-center py-8 text-neutral-400"
                        >
                          No has creado ningún menú todavía.
                        </motion.div>
                      ) : (
                        <ul className="space-y-3">
                          {menuItems.map((menu) => (
                            <motion.li
                              key={menu.id}
                              initial={{ opacity: 0, y: 10 }}
                              animate={{ opacity: 1, y: 0 }}
                              exit={{ opacity: 0, y: -10 }}
                              transition={{ duration: 0.2 }}
                              className="border border-neutral-200 rounded-lg overflow-hidden bg-white"
                            >
                              <div className="flex items-center justify-between p-4">
                                <div className="flex items-center space-x-3">
                                  <Badge className={`${getMenuTypeColor(menu.type)} text-xs font-normal`}>
                                    {menu.type}
                                  </Badge>
                                  <span className="font-medium text-neutral-700">{menu.name}</span>
                                </div>
                                <div className="flex items-center space-x-2">
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-600"
                                    onClick={() => addMenuIngredientsToShoppingList(menu)}
                                    title="Añadir ingredientes a la lista de compras"
                                  >
                                    <Plus className="h-4 w-4" />
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-neutral-400 hover:text-neutral-600"
                                    onClick={() => toggleMenuExpanded(menu.id)}
                                  >
                                    {expandedMenuId === menu.id ? (
                                      <ChevronUp className="h-4 w-4" />
                                    ) : (
                                      <ChevronDown className="h-4 w-4" />
                                    )}
                                  </Button>
                                  <Button
                                    variant="ghost"
                                    size="icon"
                                    className="h-8 w-8 rounded-full text-neutral-400 hover:text-red-500"
                                    onClick={() => removeMenuItem(menu.id)}
                                  >
                                    <X className="h-4 w-4" />
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
                                    className="px-4 pb-4 overflow-hidden"
                                  >
                                    <div className="pt-2 border-t border-neutral-100">
                                      <p className="text-sm text-neutral-500 mb-2">Ingredientes:</p>
                                      <div className="flex flex-wrap gap-2">
                                        {menu.ingredients.map((ingredient, index) => (
                                          <Badge 
                                            key={index} 
                                            className="bg-neutral-100 text-neutral-700 border-neutral-200"
                                          >
                                            {ingredient}
                                          </Badge>
                                        ))}
                                      </div>
                                    </div>
                                  </motion.div>
                                )}
                              </AnimatePresence>
                            </motion.li>
                          ))}
                        </ul>
                      )}
                    </AnimatePresence>
                  </ScrollArea>
                </CardContent>
              </Card>
            </motion.div>
          </TabsContent>
        </Tabs>
      </div>
    </div>
  );
};

export default Index;
