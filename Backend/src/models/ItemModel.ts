import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";

export interface ItemAttributes {
  id: number;
  user_id: number;
  name: string;
  rarity: string;
  type: string;
  description: string;
  price?: number | null;
  image_url?: string | null;
}

interface ItemCreationAttributes
  extends Optional<ItemAttributes, "id" | "price" | "image_url"> {}

class ItemModel
  extends Model<ItemAttributes, ItemCreationAttributes>
  implements ItemAttributes
{
  public id!: number;
  public user_id!: number;
  public name!: string;
  public rarity!: string;
  public type!: string;
  public description!: string;
  public price?: number | null;
  public image_url?: string | null;
}

ItemModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    user_id: {
      type: DataTypes.INTEGER.UNSIGNED,
      allowNull: false,
    },
    name: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    rarity: {
      type: DataTypes.STRING(50),
      allowNull: false,
    },
    type: {
      type: DataTypes.STRING(80),
      allowNull: false,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: false,
    },
    price: {
      type: DataTypes.FLOAT,
      allowNull: true,
      defaultValue: null,
    },
    image_url: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
  },
  {
    sequelize,
    modelName: "ItemModel",
    tableName: "items",
    timestamps: true,
    indexes: [
      { fields: ["name"] },
      { fields: ["type"] },
      { fields: ["rarity"] },
      { fields: ["user_id"] },
    ],
  }
);

export default ItemModel;
