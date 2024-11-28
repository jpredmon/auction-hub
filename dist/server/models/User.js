import { DataTypes, Model } from 'sequelize';
import sequelize from '../config/database.js';
export var UserRole;
(function (UserRole) {
    UserRole["ADMIN"] = "admin";
    UserRole["BIDDER"] = "bidder";
})(UserRole || (UserRole = {}));
class User extends Model {
}
User.init({
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
}, {
    sequelize,
    modelName: 'User',
    tableName: 'users',
});
export default User;
