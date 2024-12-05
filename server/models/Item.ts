import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';

class Item extends Model {
  public id!: number;
  public name!: string;
  public description!: string;
  public highestBid!: number;

  // Timestamps
  public readonly createdAt!: Date;
  public readonly updatedAt!: Date;
}

Item.init(
  {
    id: {
      type: DataTypes.INTEGER,
      autoIncrement: true,
      primaryKey: true,
    },
    name: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    description: {
      type: DataTypes.STRING,
      allowNull: false,
    },
    highestBid: {
      type: DataTypes.INTEGER,
      allowNull: false,
      defaultValue: 0,
    },
  },
  {
    sequelize,
    modelName: 'Item',
    tableName: 'items',
  }
);

export default Item;