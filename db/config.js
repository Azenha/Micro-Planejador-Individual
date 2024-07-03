const { Sequelize } = require('sequelize');

const sequelize = new Sequelize({
  dialect: 'sqlite',
  storage: 'database/database.sqlite',
  logging: false,
});

const Product = sequelize.define('Product', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  quantity: {
    type: Sequelize.INTEGER,
    allowNull: false,
  },
  unit: {
    type: Sequelize.STRING,
    allowNull: false,
  },
  value: {
    type: Sequelize.REAL,
    allowNull: true,
  },
}, {
  tableName: 'products',
  timestamps: false,
});

const GroceryList = sequelize.define('GroceryList', {
  id: {
    type: Sequelize.UUID,
    defaultValue: Sequelize.UUIDV4,
    primaryKey: true,
  },
  name: {
    type: Sequelize.STRING,
    allowNull: false,
  },
}, {
  tableName: 'grocery_lists',
  timestamps: false,
});

Product.belongsTo(GroceryList);
GroceryList.hasMany(Product);

module.exports = { sequelize, Product, GroceryList };