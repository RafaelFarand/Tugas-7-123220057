import { Sequelize } from "sequelize";
import db from "../config/database.js";

const { DataTypes } = Sequelize;

const User = db.define("user", {
    email: Sequelize.STRING,
    username: Sequelize.STRING,
    password: Sequelize.STRING,
    refresh_token: {
        type: DataTypes.TEXT,  // Explicitly use TEXT type for longer data
        allowNull: true
    },
},
    { freezeTableName: true }
);

// Use alter:true to update existing table structure
db.sync({ alter: true }).then(() => console.log("Database User table synchronized"));

export default User;