import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

export enum UserRole {
  ADMIN = 'admin',
  BIDDER = 'bidder',
}

class User extends Model {
  public id!: number;
  public username!: string;
  public password!: string; // Password should be hashed
  public role!: UserRole;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

User.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    username: {
      type: DataTypes.STRING,
      allowNull: false,
      unique: true,
    },
    password: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    role: {
      type: DataTypes.ENUM(...Object.values(UserRole)),
      allowNull: false,
      defaultValue: UserRole.BIDDER,
    },
  },
  {
    sequelize,
    modelName: 'User',
    tableName: 'users',
  }
);

export default User;
