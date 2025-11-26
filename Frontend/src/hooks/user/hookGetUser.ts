import { useCallback, useEffect, useState } from "react";
import api from "@/services/api";
import { useAuth } from "@/utils/AuthContext";

interface userProps {
  id: number;
  name: string;
  email: string;
  description?: string;
  url_img?: string;
}

export default function useHookGetUser() {
  const [getUser, setGetUser] = useState<userProps>();
  const {userId} = useAuth();
  const handlerGetUser = useCallback(async () => {
    try {
      if(!userId){
        console.error("userId is null or undefined");
      }
      const {data} = await api.get(`/users/${userId}`);
      setGetUser(data); 
    } catch (error) {
      console.error("Erro ao obter usuário:", error);
    }
  }, [userId]);

  useEffect(() => {
      handlerGetUser();
    }, [handlerGetUser]);

  return {
    getUser,
  };
}