import { useState, useEffect } from "react";
import { useParams, Link } from "react-router-dom";
import { Button } from "../components/Button";
import { Card, CardContent, CardHeader } from "../components/Card";
import { Badge } from "../components/Badge";
import Navigation from "../components/Navigation";
import ItemCard from "../components/ItemCard";
import { ArrowLeft, BookOpen, MapPin } from "lucide-react";
import { Item } from "../interface/Item";
import { User } from "../interface/User";

const UserProfile = () => {
  const { userId } = useParams();
  const [user, setUser] = useState<User | null>(null);
  const [userItems, setUserItems] = useState<Item[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const fetchUserData = async () => {
      try {
        setLoading(true);
        setError(null);

        const userRes = await fetch(`/api/users/${userId}`);
        if (!userRes.ok) throw new Error("Erro ao buscar usuário");
        const userData: User = await userRes.json();

        const itemsRes = await fetch(`/api/users/${userId}/items`);
        if (!itemsRes.ok) throw new Error("Erro ao buscar itens");
        const itemsData: Item[] = await itemsRes.json();

        setUser(userData);
        setUserItems(itemsData);
      } catch (err: any) {
        setError(err.message || "Ocorreu um erro");
      } finally {
        setLoading(false);
      }
    };

    if (userId) fetchUserData();
  }, [userId]);

  if (loading)
    return (
      <div className="min-h-screen flex items-center justify-center">
        Carregando...
      </div>
    );

  if (error || !user) {
    return (
      <div className="min-h-screen">
        <Navigation />
        <div className="container py-16 text-center">
          <h1 className="text-2xl font-bold text-foreground mb-4">
            {error || "Usuário não encontrado"}
          </h1>
          <Button className="mb-6">
            <Link to="/">Voltar ao Início</Link>
          </Button>
        </div>
      </div>
    );
  }

  const initials = user.name
    ? user.name
        .split(" ")
        .map((n) => n[0])
        .join("")
    : "U";

  return (
    <div className="min-h-screen">
      <Navigation />
      <div className="container py-8">
        <Button className="mb-6 hover:gradient-mystical transition-magical">
          <Link to="/">
            <ArrowLeft className="w-4 h-4 mr-2" />
            Voltar ao Grimório
          </Link>
        </Button>

        {/* Profile Header */}
        <Card className="mb-8 border-border/50 bg-gradient-to-br from-card to-card/80 shadow-elevated">
          <CardHeader className="pb-6 flex flex-col md:flex-row items-start md:items-center gap-6">
            <div className="w-24 h-24 md:w-32 md:h-32 rounded-full bg-gray-300 flex items-center justify-center text-2xl font-semibold text-white overflow-hidden">
              {user.url_img ? (
                <img
                  src={user.url_img}
                  alt={user.name || "Usuário"}
                  className="w-full h-full object-cover"
                />
              ) : (
                initials
              )}
            </div>

            <div className="flex-1 space-y-4">
              <div>
                <h1 className="text-3xl font-bold text-foreground mb-2">
                  {user.name || "Usuário"}
                </h1>
                <Badge className="gradient-mystical text-primary-foreground shadow-mystical">
                  Criador
                </Badge>
              </div>

              <p className="text-muted-foreground leading-relaxed max-w-2xl">
                {user.description || "Este usuário não adicionou descrição."}
              </p>

              <div className="flex flex-wrap items-center gap-4 text-sm text-muted-foreground">
                <div className="flex items-center">
                  <MapPin className="w-4 h-4 mr-1" />
                  Terra Desconhecida
                </div>
              </div>
            </div>
          </CardHeader>
        </Card>

        {/* Stats */}
        <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <BookOpen className="mx-auto h-8 w-8 text-primary mb-2" />
                <div className="text-2xl font-bold text-foreground">
                  {userItems.length}
                </div>
                <div className="text-sm text-muted-foreground">
                  Itens Criados
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary mb-2" />
                <div className="text-2xl font-bold text-foreground">—</div>
                <div className="text-sm text-muted-foreground">
                  Likes Totais
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="border-border/50 bg-gradient-to-br from-card to-card/80">
            <CardContent className="flex items-center justify-center p-6">
              <div className="text-center">
                <div className="mx-auto h-8 w-8 rounded-full bg-gradient-to-r from-primary to-secondary mb-2" />
                <div className="text-2xl font-bold text-foreground">—</div>
                <div className="text-sm text-muted-foreground">
                  Likes por Item
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* User Items */}
        <div className="space-y-6">
          <div className="flex items-center justify-between">
            <h2 className="text-2xl font-bold text-foreground">
              Itens Criados por {user.name || "Usuário"}
            </h2>
            <span className="text-sm text-muted-foreground">
              {userItems.length} {userItems.length === 1 ? "item" : "itens"}
            </span>
          </div>

          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4 md:gap-6">
            {userItems.map((item) => (
              <ItemCard
                key={item.id}
                item={item}
                onView={(id) => window.open(`/item/${id}`, "_self")}
                onLike={(id) => console.log("Like item:", id)}
              />
            ))}
          </div>

          {userItems.length === 0 && (
            <div className="text-center py-16">
              <BookOpen className="mx-auto h-16 w-16 text-muted-foreground mb-4" />
              <h3 className="text-xl font-semibold text-foreground mb-2">
                Nenhum item criado ainda
              </h3>
              <p className="text-muted-foreground">
                {user.name || "Este usuário"} ainda não criou nenhum item mágico
              </p>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default UserProfile;
