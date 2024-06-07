const express = require("express");
const { sequelize, Product } = require("./db/config");
const crypto = require("crypto");
const pug = require("pug");
const bodyParser = require("body-parser");

const app = express();
const PORT = process.env.PORT || 3001;

app.use(express.json());
app.use(express.static(__dirname + "/public"));

app.set("view engine", "pug");

app.use(bodyParser.json({ limit: "50mb" }));
app.use(bodyParser.urlencoded({ limit: "50mb", extended: true }));

// Sync the database
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
    const products = await Product.findAll();
    res.render("index", { products });
  } catch (error) {
    console.error("Error fetching data:", error);
    res.status(500).json({ error: "An error occurred while fetching data." });
  }
});

/**
 * Submit request - add new item
 * @name submit
 * @type POST
 */
app.post("/submit", async (req, res) => {
  const product = {
    id: crypto.randomUUID(),
    name: req.body.name,
    quantity: Number(req.body.quantity),
    unit: req.body.unit,
    value: Number(req.body.value),
  };

  const template = pug.compileFile("views/includes/product.pug");

  try {
    await Product.create(product);
    const markup = template({ product });
    res.send(markup);
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ error: "An error occurred while adding the product." });
  }
});

/**
 * Get by id request - get item by id
 * @name :id
 * @type GET
 */
app.get("/product/:id", async (req, res) => {
  const id = req.params.id;
  const template = pug.compileFile("views/includes/product.pug");

  try {
    const product = await Product.findByPk(id);
    if (product) {
      const markup = template({ product });
      res.send(markup);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ error: "An error occurred while fetching the product." });
  }
});

/**
 * Edit form by id request - return edit form
 * @name edit-form/:id
 * @type GET
 */
app.get("/edit-form/:id", async (req, res) => {
  const id = req.params.id;
  const template = pug.compileFile("views/includes/edit-product-form.pug");

  try {
    const product = await Product.findByPk(id);
    if (product) {
      const markup = template({ product });
      res.send(markup);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ error: "An error occurred while fetching the product for editing." });
  }
});

/**
 * Edit item by id request - return edited item
 * @name edit/:id
 * @type PUT
 */
app.put("/edit/:id", async (req, res) => {
  const id = req.params.id;
  const productData = {
    name: req.body.name,
    quantity: Number(req.body.quantity),
    unit: req.body.unit,
    value: Number(req.body.value),
  };

  const template = pug.compileFile("views/includes/edit-product.pug");

  try {
    const product = await Product.findByPk(id);
    if (product) {
      await product.update(productData);
      const markup = template({ product });
      res.send(markup);
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ error: "An error occurred while updating the product." });
  }
});

/**
 * Delete item by id request - delete item
 * @name delete/:id
 * @type DELETE
 */
app.delete("/delete/:id", async (req, res) => {
  const id = req.params.id;

  try {
    const product = await Product.findByPk(id);
    if (product) {
      await product.destroy();
      res.send("");
    } else {
      res.status(404).send("Product not found");
    }
  } catch (error) {
    console.log("ERROR", error);
    res.status(500).json({ error: "An error occurred while deleting the product." });
  }
});

app.listen(PORT, () => {
  console.log(`==================App listening on port ${PORT}!==================`);
});
