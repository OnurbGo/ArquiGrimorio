import { useEffect, useState } from "react";
import { useNavigate } from "react-router-dom";
import FilterPanel from "../components/FilterPanel";
import ItemCard from "../components/ItemCard";
import Navigation from "../components/Navigation";
import { Item, ItemFilters } from "../interface/Item";
import { getItems } from "../services/api";

const INITIAL_FILTERS: ItemFilters = {
  q: "",
  rarity: "todas",
  type: "todos",
  page: 1,
};

type UIFilters = {
  search?: string;
  rarity?: string;
  type?: string;
};

// fallback de normalização caso o getItems ainda não tenha sido ajustado
function normalizeItemsResponse(data: unknown): Item[] {
  if (Array.isArray(data)) return data as Item[];
  if (data && typeof data === "object" && Array.isArray((data as any).items)) {
    return (data as any).items as Item[];
  }
  return [];
}

export default function Home() {
  const navigate = useNavigate();
  const [filters, setFilters] = useState<ItemFilters>(INITIAL_FILTERS);
  const [items, setItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(false);
  const [errorMsg, setErrorMsg] = useState<string | null>(null);

  useEffect(() => {
    let active = true;

    (async () => {
      try {
        setLoading(true);
        setErrorMsg(null);

        // chame a API (se seu backend aceitar, você pode passar os filtros via query)
        const raw = await getItems({
          q: filters.q || undefined,
          rarity:
            filters.rarity && filters.rarity !== "todas"
              ? filters.rarity
              : undefined,
          type:
            filters.type && filters.type !== "todos" ? filters.type : undefined,
          page: filters.page,
        });

        // se o getItems já normaliza, 'raw' já é um array;
        // se não, garantimos aqui:
        let result = normalizeItemsResponse(raw);

        // filtros no frontend (caso o backend não trate)
        if (filters.q) {
          const qLower = filters.q.toLowerCase();
          result = result.filter(
            (item) =>
              item.name?.toLowerCase().includes(qLower) ||
              item.description?.toLowerCase().includes(qLower)
          );
        }
        if (filters.rarity && filters.rarity !== "todas") {
          result = result.filter(
            (item) =>
              String(item.rarity).toLowerCase() ===
              String(filters.rarity).toLowerCase()
          );
        }
        if (filters.type && filters.type !== "todos") {
          result = result.filter(
            (item) =>
              String(item.type).toLowerCase() ===
              String(filters.type).toLowerCase()
          );
        }

        if (!active) return;
        setItems(result);
      } catch (err: any) {
        if (!active) return;
        setErrorMsg(err?.message ?? "Erro ao carregar itens");
      } finally {
        active && setLoading(false);
      }
    })();

    return () => {
      active = false;
    };
  }, [filters]);

  function handleFilterChange(next: UIFilters) {
    setFilters((prev) => ({
      ...prev,
      q: next.search?.trim() || "",
      rarity: next.rarity ?? prev.rarity,
      type: next.type ?? prev.type,
      page: 1,
    }));
  }

  function handleView(id: number) {
    navigate(`/item/${id}`);
  }

  return (
    <div className="min-h-screen bg-gray-950 text-gray-100">
      <Navigation />

      {/* Cabeçalho */}
      <header className="px-4">
        <div className="max-w-7xl mx-auto pt-10">
          <div className="rounded-2xl p-6 md:p-8 border border-gray-800 shadow-lg bg-gray-900/70 backdrop-blur-sm">
            <h1 className="text-2xl md:text-3xl font-extrabold tracking-tight bg-gradient-to-r from-purple-400 via-pink-500 to-yellow-400 bg-clip-text text-transparent">
              Grimório de Itens
            </h1>
            <p className="mt-2 text-sm md:text-base text-gray-400">
              Explore, filtre e descubra itens místicos criados pela comunidade.
            </p>
          </div>
        </div>
      </header>

      {/* Conteúdo */}
      <section id="items" className="py-10 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-1 lg:grid-cols-4 gap-6">
            {/* Filtros */}
            <aside className="lg:col-span-1">
              <div className="rounded-2xl border border-gray-800 bg-gray-900/70 shadow-lg p-4 sticky top-24">
                <FilterPanel onChange={handleFilterChange} />
              </div>
            </aside>

            {/* Itens */}
            <main className="lg:col-span-3">
              {errorMsg && (
                <div
                  role="alert"
                  className="mb-6 rounded-xl border border-red-500/30 bg-red-950/50 p-3 text-red-400"
                >
                  {errorMsg}
                </div>
              )}

              {loading && !items.length ? (
                <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                  {[...Array(6)].map((_, i) => (
                    <div
                      key={i}
                      className="h-48 rounded-2xl border border-gray-800 bg-gray-900/70 shadow-lg animate-pulse"
                    />
                  ))}
                </div>
              ) : (
                <>
                  <div className="grid grid-cols-1 sm:grid-cols-2 xl:grid-cols-3 gap-4 md:gap-6">
                    {items.map((item) => (
                      <ItemCard
                        key={item.id}
                        item={item}
                        onView={handleView}
                        onLike={() => {}}
                      />
                    ))}
                  </div>

                  {!loading && items.length === 0 && (
                    <div className="text-center py-16 rounded-2xl border border-gray-800 bg-gray-900/70 shadow-lg">
                      <p className="text-sm text-gray-400">
                        Nenhum item encontrado com os filtros atuais.
                      </p>
                    </div>
                  )}
                </>
              )}
            </main>
          </div>
        </div>
      </section>
    </div>
  );
}
