const express = require("express");
const bodyParser = require("body-parser");
const cors = require("cors");
const { urlencoded } = require("body-parser");
require("dotenv").config();
const multer = require("multer");
const { ObjectId } = require("mongodb");
const MongoClient = require("mongodb").MongoClient;
const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.wghoc.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;

// multer
const storage = multer.diskStorage({
  destination: (req, file, cb) => {
    cb(null, "./public/services");
  },
  filename: (req, file, cb) => {
    cb(null, file.originalname);
  },
});
const upload = multer({ storage: storage });
//multer

const app = express();
const port = process.env.PORT || 5000;

app.use(cors());
app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: true }));

const client = new MongoClient(uri, {
  useNewUrlParser: true,
  useUnifiedTopology: true,
});
client.connect((err) => {
  // collections
  const adminCollection = client.db(process.env.DB_NAME).collection("admins");
  const serviceCollection = client
    .db(process.env.DB_NAME)
    .collection("services");
  const reviewCollection = client.db(process.env.DB_NAME).collection("reviews");
  const orderCollection = client.db(process.env.DB_NAME).collection("orders");

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

  // client section
  // client section

  //get service Data
  app.get("/services", (req, res) => {
    try {
      serviceCollection.find({}).toArray((err, docs) => {
        res.send(docs);
      });
    } catch (err) {
      res.send("error");
    }
  });

  // review data post and get start

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

  // ordered services get and post start

  app.post("/order", function (req, res) {
    upload(req, res, function (err) {
      if (err instanceof multer.MulterError) {
        return res.status(500).json(err);
      } else if (err) {
        return res.status(500).json(err);
      }
      const orderData = req.body;
      orderData.status = "pending";
      orderCollection.insertOne(orderData).then((result) => {
        return res.status(200).send(result.insertedCount > 0);
      });
    });
  });

  app.get("/orderedlist", (req, res) => {
    const { id } = req.query;
    orderCollection.find({ uid: id }).toArray((err, docs) => {
      res.send(docs);
    });
  });
  // ordered services get and post end

  // client section
  // client section end

  // admin portion
  // admin portion

  // project list for admin

  app.get("/projectlist", (req, res) => {
    try {
      orderCollection.find({}).toArray((err, docs) => {
        res.send(docs);
      });
    } catch (err) {
      res.send({ err: "could't find data." });
    }
  });

  // modify status of project start
  app.patch("/projectStatus", (req, res) => {
    const newStatus = req.body.status;
    const id = req.body.id;
    orderCollection
      .updateOne({ _id: ObjectId(id) }, { $set: { status: newStatus } })
      .then((result) => {
        if (result.modifiedCount === 1) {
          res.send(true);
        } else {
          res.send(false);
        }
      });
  });
  // modify status of project end

  // add service start
  app.post("/addservice", upload.single("iconFile"), (req, res) => {
    try {
      const data = req.body;
      data.image =
        "https://creative-agency-t.herokuapp.com/public/services" +
        req.file.originalname;
      serviceCollection.insertOne(data).then((result) => {
        if (result.insertedCount > 0) {
          res.send("Ok");
        }
      });
    } catch (err) {
      res.send("your data wasn't saved");
    }
  });
  // add service end

  // make admin start
  app.post("/makeadmin", (req, res) => {
    const email = req.body.email;
    adminCollection.insertOne({ email: email }).then((result) => {
      res.send(result.insertedCount > 0);
    });
  });
  // make admin end
});

app.listen(port);
