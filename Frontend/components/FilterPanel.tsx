import { useEffect, useState } from "react";
import type { ItemFilters } from "../interface/Item";
import { Button } from "./Button";
import { Card, CardContent } from "./Card";

interface Props {
  onChange: (next: ItemFilters) => void;
  initial?: ItemFilters;
}

const RARITIES = ["todas", "comum", "incomum", "raro", "épico", "lendário"];
const TYPES = ["todos", "arma", "armadura", "anel", "poção", "acessório"];

export default function FilterPanel({ onChange, initial }: Props) {
  const [q, setQ] = useState(initial?.q ?? "");
  const [rarity, setRarity] = useState(initial?.rarity ?? "todas");
  const [type, setType] = useState(initial?.type ?? "todos");

  useEffect(() => {
    // dispara inicialmente
    onChange({ q, rarity, type, page: 1 });
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  function apply() {
    onChange({ q: q.trim() || undefined, rarity, type, page: 1 });
  }

  function clearAll() {
    setQ("");
    setRarity("todas");
    setType("todos");
    onChange({ q: undefined, rarity: "todas", type: "todos", page: 1 });
  }

  return (
    <Card className="border border-gray-200 bg-white shadow-sm">
      <CardContent className="p-4 space-y-4">
        {/* Campo de busca */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">
            Busca (nome/descrição)
          </label>
          <input
            className="w-full rounded border px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            placeholder="ex.: invisibilidade, espada..."
            value={q}
            onChange={(e) => setQ(e.target.value)}
          />
        </div>

        {/* Select de raridade */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Raridade</label>
          <select
            className="w-full rounded border px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={rarity}
            onChange={(e) => setRarity(e.target.value)}
          >
            {RARITIES.map((r) => (
              <option key={r} value={r}>
                {r}
              </option>
            ))}
          </select>
        </div>

        {/* Select de tipo */}
        <div className="space-y-1">
          <label className="text-sm text-gray-600">Tipo</label>
          <select
            className="w-full rounded border px-3 py-2 bg-gray-50 focus:outline-none focus:ring-2 focus:ring-blue-500"
            value={type}
            onChange={(e) => setType(e.target.value)}
          >
            {TYPES.map((t) => (
              <option key={t} value={t}>
                {t}
              </option>
            ))}
          </select>
        </div>

        {/* Botões */}
        <div className="flex gap-2">
          <Button className="flex-1" onClick={apply}>
            Aplicar
          </Button>
          <Button className="flex-1" variant="outline" onClick={clearAll}>
            Limpar
          </Button>
        </div>
      </CardContent>
    </Card>
  );
}
