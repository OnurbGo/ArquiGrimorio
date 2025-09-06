// ItemDetails.tsx
import { RouteProp, useNavigation, useRoute } from "@react-navigation/native";
import { useEffect, useMemo, useState } from "react";
import {
  ActivityIndicator,
  Image,
  SafeAreaView,
  ScrollView,
  Text,
  TouchableOpacity,
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
import { useSafeAreaInsets } from "react-native-safe-area-context"; // import styles from separate file
import { styles, WIN } from "../style/itemDetail";

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

        // likes + isLiked
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

        // TRY: fetch history if api provides it; fallback if not
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
          // fallback: create a smooth series from 0..likes
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

        // update history optimistically
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

  // line chart path generation + points
  const chart = useMemo(() => {
    const data = likesHistory || [];
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
      <SafeAreaView style={styles.loadingContainer}>
        <ActivityIndicator size="large" color="#6d28d9" />
      </SafeAreaView>
    );
  }

  if (error || !item) {
    return (
      <SafeAreaView style={[styles.containerRoot, { backgroundColor: "#fff" }]}>
        <Navigation />
        <View style={styles.centerBox}>
          <View style={styles.errorCard}>
            <Text style={styles.errorText}>
              {error ?? "Item não encontrado"}
            </Text>
            <TouchableOpacity
              style={styles.backButton}
              onPress={() => navigation.goBack()}
            >
              <Text style={styles.backButtonText}>Voltar</Text>
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

  return (
    <View style={[styles.containerRoot, { backgroundColor: "#fff" }, { paddingTop: insets.top }]}>
      <Navigation />
      <ScrollView contentContainerStyle={styles.container}>
        <View style={styles.heroCard}>
          {/* --- TOP: IMAGE with like overlay --- */}
          <View style={styles.imageWrap}>
            {item.image_url ? (
              <Image
                source={{ uri: item.image_url }}
                style={styles.heroImage}
                resizeMode="contain"
              />
            ) : (
              <View style={[styles.heroImage, styles.heroImagePlaceholder]} />
            )}

            {/* overlay like (kept on image) */}
            <TouchableOpacity
              activeOpacity={0.85}
              onPress={() => handleLikeToggle(item.id!)}
              style={[
                styles.overlayLike,
                likeLoading && styles.overlayLikeDisabled,
              ]}
            >
              <Text
                style={[
                  styles.overlayLikeText,
                  item.isLiked && styles.overlayLikeTextActive,
                ]}
              >
                ♥ {item.likes ?? 0}
              </Text>
            </TouchableOpacity>
          </View>

          {/* --- NAME and BADGES (filters) --- */}
          <Text style={styles.itemTitle}>{item.name}</Text>

          <View style={styles.badgesRow}>
            <View style={styles.badge}>
              <Text style={styles.badgeText}>{item.rarity}</Text>
            </View>
            <View style={[styles.badge, styles.badgeOutline]}>
              <Text style={[styles.badgeText, styles.badgeOutlineText]}>
                {item.type}
              </Text>
            </View>
          </View>

          {/* --- DESCRIPTION --- */}
          <Text style={styles.description}>{item.description || "—"}</Text>

          {/* --- STATS LINE: likes | price | desc chars --- */}
          <View style={styles.statsRow}>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Likes</Text>
              <Text style={styles.statNumber}>{item.likes ?? 0}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Preço</Text>
              <Text style={styles.statNumber}>{priceText}</Text>
            </View>
            <View style={styles.statCard}>
              <Text style={styles.statLabel}>Desc. (chars)</Text>
              <Text style={styles.statNumber}>
                {(item.description || "").length}
              </Text>
            </View>
          </View>

          {/* --- CREATOR (left) and CHART (right) --- */}
          <View style={styles.creatorChartRow}>
            {/* left: creator */}
            <View style={styles.creatorColumn}>
              <TouchableOpacity
                onPress={goToCreatorProfile}
                style={styles.creatorRow}
              >
                {item.creator?.url_img ? (
                  <Image
                    source={{ uri: item.creator.url_img }}
                    style={styles.creatorImg}
                  />
                ) : (
                  <View style={styles.creatorPlaceholder} />
                )}
                <View>
                  <Text style={styles.creatorName}>
                    {item.creator?.name || "Desconhecido"}
                  </Text>
                  <Text style={styles.creatorSubtitle}>
                    Ver perfil do criador
                  </Text>
                </View>
              </TouchableOpacity>

              {/* removed the smallLikeBtn that was next to creator (as requested) */}
            </View>

            {/* right: interactive chart + aligned like button */}
            <View style={styles.chartColumn}>
              <Text style={styles.chartTitle}>Evolução de Likes</Text>

              <View
                style={styles.chartTouchWrap}
                onStartShouldSetResponder={() => {
                  setSelectedPoint(null);
                  return false;
                }}
              >
                <Svg width={chart.w} height={chart.h}>
                  <G>
                    {/* grid lines */}
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

                    {/* path */}
                    {chart.path ? (
                      <Path
                        d={chart.path}
                        stroke="#6d28d9"
                        strokeWidth={2}
                        fill="none"
                        strokeLinecap="round"
                      />
                    ) : null}

                    {/* points */}
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

                    {/* tooltip */}
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

                {/* axis labels: first and last */}
                <View style={styles.chartLabelsRow}>
                  <Text style={styles.chartLabelText}>
                    {chart.points[0]?.label ?? ""}
                  </Text>
                  <Text style={styles.chartLabelText}>
                    {chart.points[chart.points.length - 1]?.label ?? ""}
                  </Text>
                </View>

                {/* HERE: aligned like button under the chart (replaces the old smallLikeBtn by creator) */}
                <View style={styles.chartLikeWrap}>
                  <TouchableOpacity
                    onPress={() => handleLikeToggle(item.id!)}
                    disabled={likeLoading}
                    style={[
                      styles.chartLikeBtn,
                      likeLoading && styles.likeButtonDisabled,
                    ]}
                  ></TouchableOpacity>
                </View>
              </View>
            </View>
          </View>
        </View>

        {/* extra details */}
        <View style={styles.extraCard}>
          <Text style={styles.sectionTitle}>Detalhes</Text>
          <Text style={styles.sectionText}>
            {item.description || "Sem descrição adicional."}
          </Text>

          <View style={styles.actionsRow}>
            <TouchableOpacity
              style={styles.secondaryBtn}
              onPress={() =>
                navigation.navigate("ItemDetails", { id: item.id })
              }
            >
              <Text style={styles.secondaryBtnText}>Compartilhar</Text>
            </TouchableOpacity>
            <TouchableOpacity style={styles.secondaryBtn} onPress={() => {}}>
              <Text style={styles.secondaryBtnText}>Denunciar</Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </View>
  );
}
