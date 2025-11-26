import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
  Dimensions,
  View,
} from "react-native";
import Svg, {
  Circle,
  G,
  Line,
  Path,
  Rect,
  Text as SvgText,
} from "react-native-svg";

import Navigation from "../components/Navigation";

import type { Item } from "../interface/Item";
import type { RootStackParamList } from "../navigation/Routes";
import {
  getLikesByUser,
  getLikesForItem,
  // optional (if available): (itemId:number) => Promise<Array<{date:string, likes:number}>>
  // @ts-ignore
  getLikesHistory,
  toggleItemLike,
} from "../hooks/itens/itemLike";
import api from "../services/api";
import { useAuth } from "../utils/AuthContext";
import { useSafeAreaInsets } from "react-native-safe-area-context";

type ItemDetailsRouteProp = RouteProp<RootStackParamList, "ItemDetails">;

type ItemWithExtras = Item & {
  likes?: number;
  isLiked?: boolean;
  creator?: { id?: number; name?: string; url_img?: string };
  image_url?: string;
  created_at?: string;
};

export default function ItemDetails() {
  const route = useRoute<ItemDetailsRouteProp>();
  const navigation = useNavigation<any>();
  const { token, user: authUser } = useAuth();
  const rawId = route.params?.id as unknown;
  const id =
    rawId == null
      ? undefined
      : typeof rawId === "string"
      ? Number(rawId)
      : rawId;

  const [item, setItem] = useState<ItemWithExtras | null>(null);
  const [loading, setLoading] = useState<boolean>(true);
  const [error, setError] = useState<string | null>(null);
  const [likeLoading, setLikeLoading] = useState(false);
  const [likesHistory, setLikesHistory] = useState<
    { date: string; likes: number }[]
  >([]);
  const [selectedPoint, setSelectedPoint] = useState<{
    x: number;
    y: number;
    v: number;
    label: string;
  } | null>(null);
  const insets = useSafeAreaInsets();

  useEffect(() => {
    if (id == null || Number.isNaN(id)) {
      setError("ID do item inválido");
      setLoading(false);
      return;
    }

    let active = true;

    const fetchItem = async () => {
      try {
        setLoading(true);
        setError(null);

        const resp = await api.get(`/item/${id}`, {
          headers: token ? { Authorization: `Bearer ${token}` } : undefined,
        });
        if (!active) return;
        const data = resp.data as ItemWithExtras;

        let likes = 0;
        let isLiked = false;
        try {
          likes = await getLikesForItem(Number(id));
          if (token && authUser && authUser.id) {
            const userLikes = await getLikesByUser(authUser.id, token);
            isLiked = userLikes.some((like: any) => like.item_id === id);
          }
        } catch (err) {
          console.warn("Erro ao buscar likes:", err);
        }

        if (!active) return;
        setItem({ ...data, likes, isLiked });

        try {
          if (typeof getLikesHistory === "function") {
            const hist = await getLikesHistory(Number(id));
            if (Array.isArray(hist) && hist.length > 0) {
              const normalized = hist.map((p: any) => ({
                date: String(p.date),
                likes: Number(p.likes ?? 0),
              }));
              setLikesHistory(normalized);
            } else {
              throw new Error("empty history");
            }
          } else {
            throw new Error("no getLikesHistory");
          }
        } catch {
          const total = Math.max(0, likes ?? 0);
          const points = Math.min(10, Math.max(4, total > 0 ? 8 : 4));
          const arr = Array.from({ length: points }, (_, i) => {
            const pct = i / (points - 1);
            const val = Math.round(Math.pow(pct, 0.9) * total);
            const d = new Date();
            d.setDate(d.getDate() - (points - 1 - i));
            return { date: d.toISOString(), likes: val };
          });
          setLikesHistory(arr);
        }
      } catch (err: any) {
        console.error("ItemDetails fetch error:", err);
        const msg =
          err?.response?.data?.message ?? err?.message ?? "Erro ao buscar item";
        if (active) setError(msg);
      } finally {
        active && setLoading(false);
      }
    };

    fetchItem();

    return () => {
      active = false;
    };
  }, [id, token, authUser]);

  async function handleLikeToggle(itemId: number) {
    if (!token || likeLoading) return;
    setLikeLoading(true);
    try {
      const res = await toggleItemLike(itemId, token);
      setItem((prev) => {
        if (!prev) return prev;
        const isLiked =
          typeof res?.liked === "boolean" ? res.liked : !prev.isLiked;
        const likes =
          typeof res?.totalLikes === "number"
            ? res.totalLikes
            : isLiked
            ? (prev.likes ?? 0) + 1
            : Math.max((prev.likes ?? 0) - 1, 0);

        setLikesHistory((hist) => {
          try {
            const copy = [...hist];
            const last = copy[copy.length - 1];
            const todayISO = new Date().toISOString();
            if (last && last.date.slice(0, 10) === todayISO.slice(0, 10)) {
              copy[copy.length - 1] = { ...last, likes };
            } else {
              copy.push({ date: todayISO, likes });
              if (copy.length > 12) copy.shift();
            }
            return copy;
          } catch {
            return hist;
          }
        });

        return { ...prev, isLiked, likes };
      });
    } catch (err) {
      console.error("Erro ao curtir/descurtir:", err);
    } finally {
      setLikeLoading(false);
    }
  }
  const chart = useMemo(() => {
    const data = likesHistory || [];
    const WIN = Dimensions.get("window");
    const w = Math.min(WIN.width - 64, 420);
    const h = 140;
    const padding = 12;
    if (!data || data.length === 0)
      return { w, h, path: "", points: [], max: 1, padding };

    const values = data.map((d) => Math.max(0, Number(d.likes ?? 0)));
    const max = Math.max(1, ...values);
    const stepX = (w - padding * 2) / Math.max(1, data.length - 1);

    const points = data.map((d, i) => {
      const x = padding + i * stepX;
      const y = padding + (1 - values[i] / max) * (h - padding * 2);
      const label = new Date(d.date).toLocaleDateString();
      return { x, y, v: values[i], label };
    });

    const path = points
      .map(
        (p, i) => `${i === 0 ? "M" : "L"} ${p.x.toFixed(2)} ${p.y.toFixed(2)}`
      )
      .join(" ");

    return { w, h, path, points, max, padding };
  }, [likesHistory]);

  if (loading) {
    return (
      <SafeAreaView className="flex-1 justify-center items-center bg-white">
        <ActivityIndicator size="large" color="#6d28d9" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView
        className="flex-1 bg-white"
        style={[{ paddingTop: insets.top }]}
      >
        <Navigation />
        <View className="flex-1 items-center justify-center p-5">
          <View className="bg-white p-4 rounded-xl border border-[#eee]">
            <Text className="text-red-500 font-bold mb-2">
              {error ?? "Item não encontrado"}
            </Text>
            <TouchableOpacity
              className="mt-2 bg-indigo-50 px-3 py-2 rounded-lg"
              onPress={() => navigation.goBack()}
            >
              <Text className="text-indigo-600 font-semibold">Voltar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </SafeAreaView>
    );
  }

  const priceText =
    item.price != null
      ? `${Number(item.price).toLocaleString("pt-BR")} mo`
      : "—";

  function goToCreatorProfile() {
    if (!item || !item.creator) {
      console.warn(
        "Item ou creator ausente, não é possível navegar para o perfil"
      );
      return;
    }
    const creatorId = (item.creator as any)?.id;
    if (creatorId) navigation.navigate("UserProfile", { userId: creatorId });
    else
      console.warn("Creator id ausente, não é possível navegar para o perfil");
  }

  function toAbsoluteUrl(url?: string | null) {
    if (!url) return null;
    if (/^https?:\/\//i.test(url)) return url;
    const base = (api.defaults.baseURL || "").replace(/\/$/, "");
    const path = url.startsWith("/") ? url : `/${url}`;
    return `${base}${path}`;
  }

  console.log("ItemDetails - image_url:", item.image_url);
  return (
    <View className="flex-1 bg-white" style={[{ paddingTop: insets.top }]}>
      <Navigation />
      <ScrollView contentContainerClassName="p-4 pb-9 bg-white">
        <View className="bg-white rounded-2xl p-3 border border-indigo-50 shadow-sm mb-4">
          <View className="relative items-center justify-center">
            {toAbsoluteUrl(item.image_url) ? (
              <Image
                source={{ uri: toAbsoluteUrl(item.image_url)! }}
                className="w-full h-[220px] rounded-xl bg-slate-50"
                resizeMode="contain"
              />
            ) : (
              <View className="w-full h-[220px] rounded-xl bg-slate-50 items-center justify-center" />
            )}

            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleLikeToggle(item.id!)}
              className={`absolute top-3 right-3 bg-white px-3 py-2 rounded-full shadow-md ${
                likeLoading && "opacity-60"
              }`}
            >
              <Text
                className={`font-extrabold text-slate-700 ${
                  item.isLiked && "text-rose-800"
                }`}
              >
                ♥ {item.likes ?? 0}
              </Text>
            </TouchableOpacity>
          </View>
          <Text className="text-xl font-extrabold text-slate-900 mt-3 text-center">
            {item.name}
          </Text>

          <View className="flex-row justify-center gap-2 mt-2.5">
            <View className="bg-indigo-50 px-2.5 py-1.5 rounded-full mx-1.5">
              <Text className="text-indigo-600 font-bold">{item.rarity}</Text>
            </View>
            <View className="bg-white border border-[#e6e6f6] px-2.5 py-1.5 rounded-full mx-1.5">
              <Text className="text-slate-700 font-bold">{item.type}</Text>
            </View>
          </View>

          <Text className="text-center text-slate-500 mt-3 leading-5">
            {item.description || "—"}
          </Text>
          <View className="flex-row justify-between mt-4">
            <View className="flex-1 p-3 mx-1 rounded-lg bg-[#fbfbff] items-center">
              <Text className="text-slate-500 text-xs">Likes</Text>
              <Text className="text-lg font-bold text-slate-900 mt-1.5">
                {item.likes ?? 0}
              </Text>
            </View>
            <View className="flex-1 p-3 mx-1 rounded-lg bg-[#fbfbff] items-center">
              <Text className="text-slate-500 text-xs">Preço</Text>
              <Text className="text-lg font-bold text-slate-900 mt-1.5">
                {priceText}
              </Text>
            </View>
            <View className="flex-1 p-3 mx-1 rounded-lg bg-[#fbfbff] items-center">
              <Text className="text-slate-500 text-xs">Desc. (chars)</Text>
              <Text className="text-lg font-bold text-slate-900 mt-1.5">
                {(item.description || "").length}
              </Text>
            </View>
          </View>
          <View className="mt-4 md:flex-row gap-3 items-start justify-between">
            <View className="md:flex-[0.4] w-full">
              <TouchableOpacity
                onPress={goToCreatorProfile}
                className="flex-row items-center p-2 rounded-lg border border-slate-100 bg-white"
              >
                {item.creator?.url_img ? (
                  <Image
                    source={{ uri: `${api.defaults.baseURL}${item.creator.url_img}` }}
                    className="w-14 h-14 rounded-full mr-3"
                  />
                ) : (
                  <View className="w-14 h-14 rounded-full bg-indigo-50 mr-3" />
                )}
                <View>
                  <Text className="font-bold text-slate-900">
                    {item.creator?.name || "Desconhecido"}
                  </Text>
                  <Text className="text-slate-500 text-xs">
                    Ver perfil do criador
                  </Text>
                </View>
              </TouchableOpacity>
            </View>
            <View className="md:flex-[0.6] w-full">
              <Text className="font-bold text-slate-900 mb-2">
                Evolução de Likes
              </Text>

              <View
                className="rounded-xl p-2 border border-slate-100 bg-white"
                onStartShouldSetResponder={() => {
                  setSelectedPoint(null);
                  return false;
                }}
              >
                <Svg width={chart.w} height={chart.h}>
                  <G>
                    {[0, 0.5, 1].map((t, i) => {
                      const y =
                        chart.padding + t * (chart.h - chart.padding * 2);
                      return (
                        <Line
                          key={`g-${i}`}
                          x1={chart.padding}
                          x2={chart.w - chart.padding}
                          y1={y}
                          y2={y}
                          stroke="#f3f4f6"
                          strokeWidth={1}
                        />
                      );
                    })}
                    {chart.path ? (
                      <Path
                        d={chart.path}
                        stroke="#6d28d9"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                      />
                    ) : null}
                    {chart.points.map((p, idx) => (
                      <G key={`pt-${idx}`}>
                        <Circle
                          cx={p.x}
                          cy={p.y}
                          r={6}
                          fill="#fff"
                          stroke="#6d28d9"
                          strokeWidth={2}
                          onPress={() =>
                            setSelectedPoint({
                              x: p.x,
                              y: p.y,
                              v: p.v,
                              label: p.label,
                            })
                          }
                          accessible
                          accessibilityLabel={`Ponto ${p.label}: ${p.v} likes`}
                        />
                      </G>
                    ))}
                    {selectedPoint
                      ? (() => {
                          const text = String(selectedPoint.v);
                          const tooltipW = Math.max(36, text.length * 8 + 12);
                          const tx = Math.max(
                            chart.padding,
                            Math.min(
                              chart.w - chart.padding - tooltipW,
                              selectedPoint.x - tooltipW / 2
                            )
                          );
                          const ty = Math.max(4, selectedPoint.y - 36);
                          return (
                            <G key="tooltip">
                              <Rect
                                x={tx}
                                y={ty}
                                rx={6}
                                ry={6}
                                width={tooltipW}
                                height={28}
                                fill="#111827"
                                opacity={0.95}
                              />
                              <SvgText
                                x={tx + tooltipW / 2}
                                y={ty + 19}
                                fontSize="12"
                                fontWeight="700"
                                fill="#fff"
                                textAnchor="middle"
                              >
                                {text}
                              </SvgText>
                            </G>
                          );
                        })()
                      : null}
                  </G>
                </Svg>
                <View className="flex-row justify-between w-full mt-1.5">
                  <Text className="text-slate-500 text-[11px]">
                    {chart.points[0]?.label ?? ""}
                  </Text>
                  <Text className="text-slate-500 text-[11px]">
                    {chart.points[chart.points.length - 1]?.label ?? ""}
                  </Text>
                </View>
                <View className="mt-2.5 items-center">
                  <TouchableOpacity
                    onPress={() => handleLikeToggle(item.id!)}
                    disabled={likeLoading}
                    className={`bg-slate-100 px-4 py-2.5 rounded-lg ${
                      likeLoading && "opacity-60"
                    }`}
                  ></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>
        <View className="bg-white rounded-xl p-3.5 border border-indigo-50 mt-3">
          <Text className="font-extrabold text-base text-slate-900 mb-2">
            Detalhes
          </Text>
          <Text className="text-slate-600 leading-5">
            {item.description || "Sem descrição adicional."}
          </Text>
          <View className="flex-row mt-3">
            <TouchableOpacity
              className="bg-white px-3 py-2 rounded-lg border border-[#e6e6f6] mr-2"
              onPress={() =>
                navigation.navigate("ItemDetails", { id: item.id })
              }
            >
              <Text className="text-indigo-600 font-bold">Compartilhar</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="bg-white px-3 py-2 rounded-lg border border-[#e6e6f6] mr-2"
              onPress={() => {}}
            >
              <Text className="text-indigo-600 font-bold">Denunciar</Text>
            </TouchableOpacity>
          </View>
        </View>
  </ScrollView>
    </View>
  );
}
