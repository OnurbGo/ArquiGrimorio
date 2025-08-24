import { useState, useEffect } from "react";
import Navigation from "../components/Navigation";
import { Button } from "../components/Button";
import ItemCard from "../components/ItemCard";
import { getItems } from "../services/api";
import { Item, ItemFilters } from "../interface/Item";
import { Search as SearchIcon, X } from "lucide-react";

const RARITIES = [
  { value: "todas", label: "Todas" },
  { value: "comum", label: "Comum" },
  { value: "incomum", label: "Incomum" },
  { value: "raro", label: "Raro" },
  { value: "muito-raro", label: "Muito Raro" },
  { value: "lendario", label: "Lendário" },
  { value: "artefato", label: "Artefato" },
];

const TYPES = [
  { value: "todos", label: "Todos" },
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

export default function Search() {
  const [filters, setFilters] = useState<ItemFilters>({
    q: "",
    rarity: "todas",
    type: "todos",
    page: 1,
  });
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;
    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        let allItems = await getItems();
        if (!active) return;

        // Filtrar localmente com base nos filtros
        allItems = allItems.filter((item) => {
          const matchesQ =
            !filters.q ||
            item.name.toLowerCase().includes(filters.q.toLowerCase()) ||
            item.description?.toLowerCase().includes(filters.q.toLowerCase());
          const matchesRarity =
            filters.rarity === "todas" || item.rarity === filters.rarity;
          const matchesType =
            filters.type === "todos" || item.type === filters.type;
          return matchesQ && matchesRarity && matchesType;
        });

        setItems(allItems);
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message ?? "Erro ao buscar itens");
      } finally {
        active && setLoading(false);
      }
    })();
    return () => {
      active = false;
    };
  }, [filters]);

  function handleLike(id: number) {
    console.log("Curtir item:", id);
  }

  function clearFilters() {
    setFilters({ q: "", rarity: "todas", type: "todos", page: 1 });
  }

  return (
    <div className="min-h-screen bg-gray-100">
      <Navigation />
      <main className="container mx-auto py-8">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold mb-2">Buscar Itens</h1>
          <p className="text-gray-600">
            Encontre o item perfeito para sua aventura
          </p>
        </div>

        {/* Search and Filters */}
        <div className="bg-white p-6 rounded shadow mb-8 grid gap-4 md:grid-cols-4">
          <div className="md:col-span-2 space-y-2">
            <label htmlFor="search" className="block font-medium">
              Buscar
            </label>
            <input
              id="search"
              type="text"
              placeholder="Digite o nome ou descrição..."
              className="w-full border rounded px-3 py-2"
              value={filters.q}
              onChange={(e) =>
                setFilters((f) => ({ ...f, q: e.target.value, page: 1 }))
              }
            />
          </div>
          <div>
            <label className="block font-medium">Raridade</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filters.rarity}
              onChange={(e) =>
                setFilters((f) => ({ ...f, rarity: e.target.value, page: 1 }))
              }
            >
              {RARITIES.map((r) => (
                <option key={r.value} value={r.value}>
                  {r.label}
                </option>
              ))}
            </select>
          </div>
          <div>
            <label className="block font-medium">Tipo</label>
            <select
              className="w-full border rounded px-3 py-2"
              value={filters.type}
              onChange={(e) =>
                setFilters((f) => ({ ...f, type: e.target.value, page: 1 }))
              }
            >
              {TYPES.map((t) => (
                <option key={t.value} value={t.value}>
                  {t.label}
                </option>
              ))}
            </select>
          </div>
        </div>

        {/* Results */}
        {errorMsg && <div className="text-red-500 mb-4">{errorMsg}</div>}

        {loading ? (
          <div className="text-center py-16">Carregando itens...</div>
        ) : items.length > 0 ? (
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            {items.map((item) => (
              <ItemCard key={item.id} item={item} onLike={handleLike} />
            ))}
          </div>
        ) : (
          <div className="bg-white p-6 rounded shadow text-center py-12">
            <SearchIcon className="mx-auto h-12 w-12 text-gray-400 mb-4" />
            <h3 className="text-lg font-semibold mb-2">
              Nenhum item encontrado
            </h3>
            <p className="text-gray-500 mb-4">Tente ajustar os filtros</p>
            <Button onClick={clearFilters}>
              <X className="inline mr-2 h-4 w-4" /> Limpar Filtros
            </Button>
          </div>
        )}
      </main>
    </div>
  );
}
