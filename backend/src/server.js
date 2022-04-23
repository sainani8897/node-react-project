const express = require("express");
var cors = require("cors");
const app = express();
const { MongoClient, ObjectId } = require("mongodb");
const port = 8080;
const multer = require("multer");
const upload = multer(); // for parsing multipart/form-data
const bcrypt = require("bcrypt");

app.use(cors());

app.use(express.urlencoded({ extended: true }));
app.use(express.json());

/** Mongo Client */
const client = new MongoClient("mongodb://localhost:27017/test_crud");

const collection = client.db().collection("users");

const baseUrl = `http://localhost:${port}/`;

app.get("/", (req, res) => {
  res.send("Hello World!");
});

app.post("/user", upload.array(), async (req, res) => {
  try {
    console.log(req);
    if (req.body) {
      const data = req.body;
      console.log(req.body);

      const user = await collection.findOne({
        email: data.email,
      });

      if (data) {
        const response = await collection.insertOne(data);
        return res.send({
          status: 200,
          data: response,
        });
      } else {
        return res.send({
          error: "give a Data",
        });
      }
    }
  } catch (error) {
    return res.status(500).send({ error });
  }
});

/** Login  */
app.post("/register", upload.array(), async (req, res) => {
  try {
    if (req.body) {
      const data = req.body;

      const user = await collection.findOne({
        email: data.email,
      });

      const salt = await bcrypt.genSalt(10);
      data.password = await bcrypt.hash(data.password, salt);
      console.log(data);
      if (data) {
        const response = await collection.insertOne(data);
        return res.send({
          status: 200,
          data: response,
        });
      } else {
        return res.send({
          error: "give a Data",
        });
      }
    }
  } catch (error) {
    return res.status(500).send({ message: error.message });
  }
});

/** Register */

app.post("/login", upload.array(), async (req, res) => {
  try {
    if (req.body) {
      const data = req.body;

      const user = await collection.findOne({
        email: data.email,
      });

      if (user) {
        const validPassword = await bcrypt.compare(
          data.password,
          user.password
        );

        if (!validPassword) {
          res.status(401).json({ error: "Invalid Password" });
        }

        return res.send({
          status: 200,
          data: user,
        });
      } else {
        return res.status(401).send({
          status: 401,
          message: "Invalid User Does not Exits",
        });
      }
    }
  } catch (error) {
    return res.status(500).send({ message:error.message });
  }
});

app.get("/user", async (req, res) => {
  try {
    const users = await collection.find().toArray();
    console.log(users);
    if (users) {
      return res.send({
        status: 200,
        data: users,
      });
    } else {
      return res.send({
        error: "No Data Found",
      });
    }
  } catch (error) {
    return res.status(500).send({ error });
  }
});

client
  .connect()
  .then(function (client) {
    app.listen(port, () => {
      console.log("Server Started at Port " + port);
    });
  })
  .catch((err) => {
    console.log(err);
  });
