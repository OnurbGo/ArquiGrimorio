import { FlatList, View } from "react-native";
import ItemCard from "../ItemCard";

export default function ResultsGrid({
  items,
  itemLikes,
  handleLike,
  navigation,
  columns,
  itemWrapperWidth,
  GAP,
}: any) {
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
            <View
              className="mb-3"
              style={{
                width: itemWrapperWidth,
                marginRight: isLastInRow ? 0 : GAP,
              }}
            >
              <ItemCard
                item={{
                  ...item,
                  likes: likeState.likes,
                  isLiked: likeState.isLiked,
                }}
                onLike={handleLike}
                onView={(id) => navigation.navigate("ItemDetails", { id })}
              />
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 36 }}
        columnWrapperStyle={
          columns > 1
            ? { justifyContent: "flex-start", marginBottom: 12 }
            : undefined
        }
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
}
