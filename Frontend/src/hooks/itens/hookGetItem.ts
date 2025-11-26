import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";

interface itemProps {
  id: number;
  name: string;
  description?: string;
  image_url ?: string;
}

export default function useHookGetItem() {
  const [getItem, setGetItem] = useState<itemProps>();
  const handlerGetItem = useCallback(async () => {
  const itemId = localStorage.getItem("itemId");
    try {
      if(!itemId){
        console.error("itemId is null or undefined");
      }
      const {data} = await api.get(`/item/${itemId}`);
      setGetItem(data); 
    } catch (error) {
      console.error("Erro ao obter item:", error);
    }
  }, []);

  useEffect(() => {
      handlerGetItem();
    }, [handlerGetItem]);

  return {
    getItem,
  };
}