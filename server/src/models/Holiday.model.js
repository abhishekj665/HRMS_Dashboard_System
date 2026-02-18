import { sequelize } from "../config/db.js";
import { DataTypes } from "sequelize";

const Holiday = sequelize.define("Holiday", {
    id : {
        type : DataTypes.UUID,
        defaultValue : DataTypes.UUIDV4,
        primaryKey : true,
        allowNull : false
    },
    name : {
        type : DataTypes.STRING,
        allowNull : false
    },
    date : {
        type : DataTypes.DATEONLY,
        allowNull : false
    },
    isOptional : {
        type : DataTypes.BOOLEAN,
        allowNull : false,
        defaultValue : false
    }
},{
    timestamps : true,
    tableName : "Holidays",
    paranoid : true
});
