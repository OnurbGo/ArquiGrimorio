import { View, FlatList } from "react-native";
import ItemCard from "../ItemCard";

export default function ResultsGrid( { items, itemLikes, handleLike, navigation, columns, itemWrapperWidth, GAP }: any ) {
  return (
    <View>
        <FlatList
                      data={items}
                      keyExtractor={(it) => String(it.id)}
                      numColumns={columns}
                      renderItem={({ item, index }) => {
                        const likeState = itemLikes[item.id] ?? {
                          likes: 0,
                          isLiked: false,
                        };
                        const isLastInRow = (index + 1) % columns === 0;
                        return (
                          // INÍCIO COMPONENTE: GridItemWrapper
                          <View
                            style={[
                              {
                                width: columns === 1 ? "100%" : itemWrapperWidth,
                                marginRight: columns === 1 ? 0 : isLastInRow ? 0 : GAP,
                                alignItems: columns === 1 ? "center" : "flex-start",
                                paddingVertical: 8,
                              },
                            ]}
                          >
                            <ItemCard
                              item={{
                                ...item,
                                likes: likeState.likes,
                                isLiked: likeState.isLiked,
                              }}
                              onLike={handleLike} // pai gerencia o toggle agora
                              onView={(id) =>
                                navigation.navigate("ItemDetails", { id })
                              }
                            />
                          </View>
                          // FIM COMPONENTE: GridItemWrapper
                        );
                      }}
                      contentContainerStyle={[
                        { paddingBottom: 40, paddingTop: 6 },
                        columns === 1
                          ? { alignItems: "center" }
                          : { alignItems: "stretch" },
                      ]}
                      columnWrapperStyle={
                        columns > 1
                          ? { justifyContent: "flex-start", marginBottom: 16 }
                          : undefined
                      }
                      showsVerticalScrollIndicator={false}
                    />
    </View>
  );
}
