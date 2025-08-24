// src/screens/CreateItem.tsx
import { useState } from "react";
import { useNavigate } from "react-router-dom";
import Navigation from "../components/Navigation";
import { Button } from "../components/Button";
import { Wand2 } from "lucide-react";

const RARITIES = [
  { value: "comum", label: "Comum" },
  { value: "incomum", label: "Incomum" },
  { value: "raro", label: "Raro" },
  { value: "muito-raro", label: "Muito Raro" },
  { value: "lendario", label: "Lendário" },
  { value: "artefato", label: "Artefato" },
];

const ITEM_TYPES = [
  { value: "arma", label: "Arma" },
  { value: "armadura", label: "Armadura" },
  { value: "escudo", label: "Escudo" },
  { value: "pergaminho", label: "Pergaminho" },
  { value: "pocao", label: "Poção" },
  { value: "anel", label: "Anel" },
  { value: "amuleto", label: "Amuleto" },
  { value: "varinha", label: "Varinha" },
  { value: "cajado", label: "Cajado" },
  { value: "outros", label: "Outros" },
];

export default function CreateItem() {
  const navigate = useNavigate();
  const [isSubmitting, setIsSubmitting] = useState(false);
  const [formData, setFormData] = useState({
    name: "",
    rarity: "",
    type: "",
    description: "",
    price: "",
    imageUrl: "",
  });

  const handleInputChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setIsSubmitting(true);
    try {
      await new Promise((resolve) => setTimeout(resolve, 1000)); // Mock
      alert(`Item "${formData.name}" criado com sucesso!`);
      navigate("/");
    } catch {
      alert("Erro ao criar item. Tente novamente.");
    } finally {
      setIsSubmitting(false);
    }
  };

  const isFormValid =
    formData.name && formData.rarity && formData.type && formData.description;

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto py-8">
        <div className="max-w-2xl mx-auto bg-white p-6 rounded shadow">
          <div className="text-center mb-8">
            <div className="flex items-center justify-center mb-4">
              <div className="rounded-full p-3 bg-gradient-to-r from-purple-500 to-indigo-500 shadow">
                <Wand2 className="h-8 w-8 text-white" />
              </div>
            </div>
            <h1 className="text-3xl font-bold mb-2">Criar Novo Item Mágico</h1>
            <p className="text-gray-600">
              Compartilhe suas criações mágicas com a comunidade
            </p>
          </div>

          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Nome */}
            <div className="space-y-2">
              <label htmlFor="name" className="block font-medium">
                Nome do Item *
              </label>
              <input
                id="name"
                type="text"
                placeholder="Ex: Espada Flamejante do Dragão"
                className="w-full border rounded px-3 py-2"
                value={formData.name}
                onChange={(e) => handleInputChange("name", e.target.value)}
                required
              />
            </div>

            {/* Raridade e Tipo */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label className="block font-medium">Raridade *</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.rarity}
                  onChange={(e) => handleInputChange("rarity", e.target.value)}
                  required
                >
                  <option value="">Selecione a raridade</option>
                  {RARITIES.map((r) => (
                    <option key={r.value} value={r.value}>
                      {r.label}
                    </option>
                  ))}
                </select>
              </div>
              <div className="space-y-2">
                <label className="block font-medium">Tipo *</label>
                <select
                  className="w-full border rounded px-3 py-2"
                  value={formData.type}
                  onChange={(e) => handleInputChange("type", e.target.value)}
                  required
                >
                  <option value="">Selecione o tipo</option>
                  {ITEM_TYPES.map((t) => (
                    <option key={t.value} value={t.value}>
                      {t.label}
                    </option>
                  ))}
                </select>
              </div>
            </div>

            {/* Descrição */}
            <div className="space-y-2">
              <label htmlFor="description" className="block font-medium">
                Descrição e Efeitos *
              </label>
              <textarea
                id="description"
                placeholder="Descreva os efeitos mágicos, lore e características especiais do item..."
                className="w-full border rounded px-3 py-2 min-h-[120px]"
                value={formData.description}
                onChange={(e) =>
                  handleInputChange("description", e.target.value)
                }
                required
              />
            </div>

            {/* Preço e Imagem */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <label htmlFor="price" className="block font-medium">
                  Preço (Opcional)
                </label>
                <input
                  id="price"
                  type="number"
                  step="0.01"
                  placeholder="0.00"
                  className="w-full border rounded px-3 py-2"
                  value={formData.price}
                  onChange={(e) => handleInputChange("price", e.target.value)}
                />
              </div>
              <div className="space-y-2">
                <label htmlFor="imageUrl" className="block font-medium">
                  URL da Imagem (Opcional)
                </label>
                <input
                  id="imageUrl"
                  type="url"
                  placeholder="https://exemplo.com/imagem.jpg"
                  className="w-full border rounded px-3 py-2"
                  value={formData.imageUrl}
                  onChange={(e) =>
                    handleInputChange("imageUrl", e.target.value)
                  }
                />
              </div>
            </div>

            {/* Prévia da imagem */}
            {formData.imageUrl && (
              <div className="space-y-2">
                <label className="block font-medium">Prévia da Imagem</label>
                <div className="relative aspect-video max-w-md mx-auto border rounded-lg overflow-hidden">
                  <img
                    src={formData.imageUrl}
                    alt="Prévia"
                    className="w-full h-full object-cover"
                    onError={(e) => {
                      (e.target as HTMLImageElement).style.display = "none";
                    }}
                  />
                </div>
              </div>
            )}

            {/* Botões */}
            <div className="flex gap-4 pt-4">
              <Button
                type="submit"
                disabled={!isFormValid || isSubmitting}
                className="flex-1"
              >
                {isSubmitting ? "Criando..." : "Criar Item"}
              </Button>
              <Button
                type="button"
                className="flex-1 border"
                onClick={() => navigate("/")}
              >
                Cancelar
              </Button>
            </div>
          </form>
        </div>
      </main>
    </div>
  );
}
