import { DataTypes, Model, Optional } from "sequelize";
import sequelize from "../config/database";
import bcrypt from "bcrypt";

export interface UserAttributes {
  id: number;
  name?: string | null;
  email: string;
  password: string;
  url_img?: string | null;
  description?: string | null;
  admin?: boolean; // <— ADD (se ainda não existir)
}

interface UserCreationAttributes
  extends Optional<UserAttributes, "id" | "url_img" | "description" | "name"> {}

class UserModel
  extends Model<UserAttributes, UserCreationAttributes>
  implements UserAttributes
{
  public id!: number;
  public name?: string | null;
  public email!: string;
  public password!: string;
  public url_img?: string | null;
  public description?: string | null;
  public admin?: boolean; // <— ADD (se ainda não existir)

  // Hash da senha antes de salvar
  public async hashPassword(): Promise<void> {
    if (this.password) {
      const salt = await bcrypt.genSalt(10);
      this.password = await bcrypt.hash(this.password, salt);
    }
  }

  // Validação de senha
  public async validatePassword(password: string): Promise<boolean> {
    if (!this.password) return false;
    return bcrypt.compare(password, this.password);
    
  }

  public toJSON() {
    const values = Object.assign({}, this.get());
    delete (values as any).password;
    return values;
  }
}

UserModel.init(
  {
    id: {
      type: DataTypes.INTEGER.UNSIGNED,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING(120),
      allowNull: true,
    },
    email: {
      type: DataTypes.STRING(200),
      allowNull: false,
      unique: true,
      validate: {
        isEmail: true,
      },
    },
    password: {
      type: DataTypes.STRING(200),
      allowNull: false,
    },
    url_img: {
      type: DataTypes.STRING,
      allowNull: true,
      defaultValue: null,
    },
    description: {
      type: DataTypes.TEXT,
      allowNull: true,
      defaultValue: null,
    },
    admin: {
      type: DataTypes.BOOLEAN,
      allowNull: false,
      defaultValue: false,
    },
  },
  {
    sequelize,
    modelName: "UserModel",
    tableName: "users",
    timestamps: true,
    defaultScope: {
      attributes: { exclude: ["password"] },
    },
    indexes: [{ fields: ["email"], unique: true }, { fields: ["name"] }],
  }
);

// Hooks para hash de senha
UserModel.beforeCreate(async (user: UserModel) => {
  if (user.password) {
    await user.hashPassword();
  }
});

UserModel.beforeUpdate(async (user: UserModel) => {
  if (user.changed("password")) {
    await user.hashPassword();
  }
});

export default UserModel;
