import { Eye, Heart, User } from "lucide-react";
import type { Item } from "../interface/Item";

type ItemWithExtras = Item & {
  likes?: number;
  isLiked?: boolean;
  creator?: { name?: string; url_img?: string };
  image_url?: string;
};

interface Props {
  item: ItemWithExtras;
  onView?: (id: number) => void;
  onLike?: (id: number) => void;
}

const rarityColors: Record<string, string> = {
  comum: "bg-gray-200 text-gray-700",
  incomum: "bg-green-200 text-green-800",
  raro: "bg-blue-500 text-white",
  épico: "bg-purple-600 text-white",
  lendário: "bg-yellow-400 text-black shadow-lg",
};

export default function ItemCard({ item, onView, onLike }: Props) {
  const rarityKey = String(item.rarity ?? "").toLowerCase();
  const rarityClass = rarityColors[rarityKey] ?? rarityColors.comum;

  const priceText =
    item.price != null
      ? `${Number(item.price).toLocaleString("pt-BR")} mo`
      : "—";

  const creatorName = item.creator?.name || "Desconhecido";

  return (
    <div className="rounded-2xl shadow-md p-4 bg-white group transition-transform hover:shadow-lg hover:-translate-y-1 active:scale-95">
      {/* Cabeçalho */}
      <div className="flex items-start justify-between mb-3">
        <div className="space-y-2 min-w-0 flex-1">
          <h3 className="text-base md:text-lg font-semibold text-gray-900 group-hover:text-blue-600 transition-colors line-clamp-2">
            {item.name}
          </h3>

          <div className="flex items-center gap-2 flex-wrap">
            <span
              className={`px-2 py-0.5 rounded-md text-xs font-medium ${rarityClass}`}
            >
              {item.rarity}
            </span>
            <span className="px-2 py-0.5 rounded-md text-xs border border-gray-300">
              {item.type}
            </span>
          </div>
        </div>

        {item.image_url && (
          <div className="w-12 h-12 md:w-16 md:h-16 rounded-lg overflow-hidden border border-gray-200 ml-3 flex-shrink-0">
            <img
              src={item.image_url}
              alt={item.name}
              className="w-full h-full object-cover"
              loading="lazy"
            />
          </div>
        )}
      </div>

      {/* Conteúdo */}
      <div className="mb-3">
        <p className="text-sm text-gray-600 line-clamp-3 leading-relaxed">
          {item.description}
        </p>
        <p className="mt-3 text-sm font-medium text-gray-800">{priceText}</p>
      </div>

      {/* Rodapé */}
      <div className="flex items-center justify-between pt-2 border-t">
        <div className="flex items-center text-xs text-gray-500 min-w-0 flex-1">
          <User className="w-3 h-3 mr-1 flex-shrink-0" />
          <span className="truncate">por {creatorName}</span>
        </div>

        <div className="flex items-center gap-2 flex-shrink-0">
          <button
            onClick={() => onLike?.(item.id)}
            className={`flex items-center text-xs px-2 py-1 rounded-md transition ${
              item.isLiked
                ? "text-red-600 hover:bg-red-50"
                : "text-gray-600 hover:bg-gray-100"
            }`}
            title="Curtir"
          >
            <Heart
              className={`w-4 h-4 ${item.isLiked ? "fill-current" : ""}`}
            />
            <span className="ml-1">{item.likes ?? 0}</span>
          </button>

          <button
            onClick={() => onView?.(item.id)}
            className="flex items-center text-xs px-2 py-1 border rounded-md hover:bg-gray-100"
          >
            <Eye className="w-4 h-4 mr-1" />
            <span className="hidden sm:inline">Ver</span>
          </button>
        </div>
      </div>
    </div>
  );
}
