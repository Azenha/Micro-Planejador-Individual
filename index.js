const express = require("express");
const { sequelize, Product, GroceryList } = require("./db/config");
const crypto = require("crypto");
const pug = require("pug");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3000;

app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

sequelize.sync().then(() => {
  console.log('Database synced');
}).catch(err => {
  console.error('Error syncing database', err);
});

/**
 * Index request
 * @name index
 * @type GET
 */
app.get("/", async (_, res) => {
  try {
    res.render("index");
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

/**
 * Serve the grocery list management page
 * @name manageLists
 * @type GET
 */
app.get("/lists", async (_, res) => {
  try {
    const groceryLists = await GroceryList.findAll({
      include: [Product]
    });
    res.render("lists", { groceryLists });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

/**
 * Create a new grocery list
 * @name createList
 * @type POST
 */
app.post("/lists", async (req, res) => {
  const { name } = req.body;

  try {
    const newList = await GroceryList.create({ name });
    const template = pug.compileFile("views/includes/grocery-list.pug");
    const markup = template({ list: newList });
    res.send(markup);
  } catch (error) {
    console.error("Error creating grocery list:", error);
    res.status(500).json({ error: "An error occurred while creating the grocery list." });
  }
});

/**
 * Add a product to a grocery list
 * @name addProduct
 * @type POST
 */
app.post("/lists/:listId/products", async (req, res) => {
  const { listId } = req.params;
  const { name, quantity, unit, value } = req.body;

  try {
    const list = await GroceryList.findByPk(listId);
    if (!list) {
      return res.status(404).json({ error: "Grocery list not found." });
    }

    const product = await Product.create({
      id: crypto.randomUUID(),
      name,
      quantity: Number(quantity),
      unit,
      value: Number(value),
      GroceryListId: list.id,
    });

    res.json(product);
  } catch (error) {
    console.error("Error adding product to grocery list:", error);
    res.status(500).json({ error: "An error occurred while adding the product to the grocery list." });
  }
});

/**
 * Get all grocery lists
 * @name getAllLists
 * @type GET
 */
app.get("/lists", async (req, res) => {
  try {
    const lists = await GroceryList.findAll();
    res.json(lists);
  } catch (error) {
    console.error("Error fetching grocery lists:", error);
    res.status(500).json({ error: "An error occurred while fetching grocery lists." });
  }
});

/**
 * Get a single grocery list by ID
 * @name getList
 * @type GET
 */
app.get("/lists/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const list = await GroceryList.findByPk(id, {
      include: [Product]
    });
    if (!list) {
      return res.status(404).json({ error: "Grocery list not found." });
    }
    res.json(list);
  } catch (error) {
    console.error("Error fetching grocery list:", error);
    res.status(500).json({ error: "An error occurred while fetching the grocery list." });
  }
});

/**
 * Edit a grocery list by ID
 * @name editList
 * @type PUT
 */
app.put("/lists/:id", async (req, res) => {
  const { id } = req.params;
  const { name } = req.body;

  try {
    const list = await GroceryList.findByPk(id);
    if (!list) {
      return res.status(404).json({ error: "Grocery list not found." });
    }

    await list.update({ name });
    res.json(list);
  } catch (error) {
    console.error("Error updating grocery list:", error);
    res.status(500).json({ error: "An error occurred while updating the grocery list." });
  }
});

/**
 * Delete a grocery list by ID
 * @name deleteList
 * @type DELETE
 */
app.delete("/lists/:id", async (req, res) => {
  const { id } = req.params;

  try {
    const list = await GroceryList.findByPk(id);
    if (!list) {
      return res.status(404).json({ error: "Grocery list not found." });
    }

    await list.destroy();
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting grocery list:", error);
    res.status(500).json({ error: "An error occurred while deleting the grocery list." });
  }
});

/**
 * Edit product by ID
 * @name editProduct
 * @type PUT
 */
app.put("/lists/:listId/products/:productId", async (req, res) => {
  const { productId } = req.params;
  const { name, quantity, unit, value } = req.body;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    await product.update({ name, quantity: Number(quantity), unit, value: Number(value) });
    res.json(product);
  } catch (error) {
    console.error("Error updating product:", error);
    res.status(500).json({ error: "An error occurred while updating the product." });
  }
});

/**
 * Delete product by ID
 * @name deleteProduct
 * @type DELETE
 */
app.delete("/lists/:listId/products/:productId", async (req, res) => {
  const { productId } = req.params;

  try {
    const product = await Product.findByPk(productId);
    if (!product) {
      return res.status(404).json({ error: "Product not found." });
    }

    await product.destroy();
    res.sendStatus(204);
  } catch (error) {
    console.error("Error deleting product:", error);
    res.status(500).json({ error: "An error occurred while deleting the product." });
  }
});

app.listen(PORT, () => {
  console.log(`==================App listening on port ${PORT}!==================`);
});
