const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
require("dotenv").config();
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wghoc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");

  // verify user as admin or client start
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
  // verify user as admin or client end

  // review data post and get start
  const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
  app.post("/review", (req, res) => {
    const reviewData = req.body;
    reviewCollection.insertOne(reviewData).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });

  app.get("/reviews", (req, res) => {
    reviewCollection
      .find({})
      .limit(6)
      .toArray((err, docs) => {
        res.send(docs);
      });
  });
  // review data post and get end
});

app.listen(port);
