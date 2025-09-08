import { View, FlatList, Text } from "react-native";

export default function ItemsGridEdit({
    items,
    renderItem,
    fetchItems,
    loading,
    numColumns,
    vw,
}: any) {
  return (
    <View>
      <FlatList
        data={items}
        keyExtractor={(item) => item.id.toString()}
        renderItem={renderItem}
        onRefresh={fetchItems}
        refreshing={loading}
        ListEmptyComponent={
          <Text className="text-center mt-8 text-[#d1cfe8]">
            Nenhum item encontrado.
          </Text>
        }
        contentContainerStyle={{ paddingBottom: 40, paddingTop: 12 }}
        numColumns={numColumns}
        columnWrapperStyle={
          numColumns > 1
            ? { justifyContent: "space-between", paddingHorizontal: 2 * vw }
            : undefined
        }
      />
    </View>
  );
}
