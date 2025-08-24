import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface ItemLikeAttributes {
  id: number;
  item_id: number;
  user_id: number;
}

interface ItemLikeCreationAttributes
  extends Optional<ItemLikeAttributes, "id"> {}

class ItemLikeModel
  extends Model<ItemLikeAttributes, ItemLikeCreationAttributes>
  implements ItemLikeAttributes
{
  public id!: number;
  public item_id!: number;
  public user_id!: number;
}

ItemLikeModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    item_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
  },
  {
    sequelize,
    modelName: "ItemLikeModel",
    tableName: "item_likes",
    timestamps: true,
    updatedAt: false,
    indexes: [
      { unique: true, fields: ["item_id", "user_id"] },
      { fields: ["user_id"] },
    ],
  }
);

export default ItemLikeModel;
