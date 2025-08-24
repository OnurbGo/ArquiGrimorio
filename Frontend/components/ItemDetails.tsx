import { useEffect, useState } from "react";
import { useParams } from "react-router-dom";
import { ItemDetails } from "../interface/Item";
import { getItemById } from "../services/api";

export default function ItemDetailsPage() {
  const { id } = useParams<{ id: string }>();
  const [item, setItem] = useState<ItemDetails | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!id) return;

    setLoading(true);
    getItemById(Number(id))
      .then((data) => {
        setItem(data as ItemDetails);
        setError(null);
      })
      .catch(() => setError("Não foi possível carregar o item."))
      .finally(() => setLoading(false));
  }, [id]);

  if (loading)
    return <p className="text-center text-gray-500">Carregando...</p>;
  if (error) return <p className="text-center text-red-500">{error}</p>;
  if (!item) return <p className="text-center">Item não encontrado.</p>;

  return (
    <div className="flex justify-center items-center py-10 px-4">
      <div className="bg-white shadow-lg rounded-2xl p-6 max-w-lg w-full">
        <h1 className="text-2xl font-bold text-gray-800 mb-4">{item.name}</h1>

        {item.image_url && (
          <img
            src={item.image_url}
            alt={item.name}
            className="w-60 h-60 object-cover rounded-xl mx-auto mb-4 shadow-md"
          />
        )}

        <div className="space-y-2 text-gray-700">
          <p>
            <strong>Descrição:</strong> {item.description}
          </p>
          <p>
            <strong>Raridade:</strong> {item.rarity}
          </p>
          <p>
            <strong>Tipo:</strong> {item.type}
          </p>
          {item.price && (
            <p>
              <strong>Preço:</strong> {item.price} PO
            </p>
          )}
        </div>

        <div className="mt-4">
          <h3 className="text-lg font-semibold text-gray-800">Criador</h3>
          <div className="flex items-center mt-2">
            {item.creator?.url_img && (
              <img
                src={item.creator.url_img}
                alt={item.creator.name}
                className="w-10 h-10 rounded-full mr-3 border"
              />
            )}
            <p className="font-medium">
              {item.creator?.name || "Desconhecido"}
            </p>
          </div>
        </div>

        <p className="mt-4 text-gray-700">
          <strong>Likes:</strong> {item.likes}
        </p>

        <div className="mt-6">
          <h3 className="text-lg font-semibold text-gray-800">Propriedades</h3>
          <ul className="list-disc list-inside mt-2 text-gray-600">
            {Object.entries(item.properties).map(([key, value]) => (
              <li key={key}>
                <strong>{key}:</strong> {value}
              </li>
            ))}
          </ul>
        </div>
      </div>
    </div>
  );
}
