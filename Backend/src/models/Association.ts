import UserModel from "./UserModel";
import ItemModel from "./ItemModel";
import ItemLikeModel from "./ItemLikeModel";

let TeachersModel: any = null;
try {
  TeachersModel = require("./TeachersModel").default;
} catch (err) {
  TeachersModel = null;
}

UserModel.hasMany(ItemModel, {
  foreignKey: "user_id",
  as: "items",
  onDelete: "CASCADE",
});
ItemModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "creator",
});

UserModel.hasMany(ItemLikeModel, {
  foreignKey: "user_id",
  as: "likes",
  onDelete: "CASCADE",
});
ItemLikeModel.belongsTo(UserModel, {
  foreignKey: "user_id",
  as: "user",
});

ItemModel.hasMany(ItemLikeModel, {
  foreignKey: "item_id",
  as: "likes",
  onDelete: "CASCADE",
});
ItemLikeModel.belongsTo(ItemModel, {
  foreignKey: "item_id",
  as: "item",
});

if (TeachersModel) {
  UserModel.hasOne(TeachersModel, {
    foreignKey: "user_id",
    as: "teacher",
    onDelete: "CASCADE",
  });
  TeachersModel.belongsTo(UserModel, { foreignKey: "user_id", as: "user" });
}

export { UserModel, ItemModel, ItemLikeModel, TeachersModel };
