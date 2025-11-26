import { View, FlatList, RefreshControl } from "react-native";

export default function ItemsGridProfile( {
  itemsWithLikes,
  ItemCard,
  navigation,
  refreshing,
  onRefresh,
  itemWidth,
  columns,
  GAP,
}: any) {
  return (
    <View>
      <FlatList
        data={itemsWithLikes}
        keyExtractor={(it) => String(it.id)}
        numColumns={columns}
        renderItem={({ item, index }) => {
          const isLastInRow = (index + 1) % columns === 0;
          return (
            <View
              className="mb-3"
              style={[{ width: itemWidth, marginRight: isLastInRow ? 0 : GAP }]}
            >
              <ItemCard
                item={item}
                onView={(id: number) =>
                  navigation.navigate("ItemDetails", { id })
                }
              />
            </View>
          );
        }}
        contentContainerStyle={{ paddingBottom: 36 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onRefresh}
            colors={["#6d28d9"]}
          />
        }
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
