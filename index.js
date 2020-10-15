const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wghoc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
const PORT = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");
  app.post("/checkuser", (req, res) => {
    const email = req.body.email;
    adminCollection.findOne({ email }, (err, result) => {
      if (result) {
        res.send({ userType: "admin" });
        console.log("admin");
      } else {
        res.send({ userType: "client" });
        console.log("client");
      }
    });
  });
});

app.get("/", (req, res) => {
  res.send("hello world");
});

app.listen(port);
