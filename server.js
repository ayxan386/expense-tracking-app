require("dotenv").config();
//Importing dependencies
const express = require("express");
const app = express();

const bodyParser = require("body-parser");
const helmet = require("helmet");
const path = require("path");

const MongoClient = require("mongodb").MongoClient;
//Adding middleware

app.use(bodyParser.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use(express.static(path.join(__dirname, "./public")));

app.use(helmet());

MongoClient.connect(process.env.DB, (err, db) => {
  if (err) console.log(err);

  app.listen(process.env.PORT || 3000, err => {
    if (err) console.log(err);
    console.log("Server successfully started");
  });

  app.get("/", (req, res) => {
    res.sendFile(__dirname + "/view/index.html");
  });
  app
    .route("/expence")
    .post((req, res) => {
      db.collection("expences").insertOne(req.body, (err, doc) => {
        if (err) console.log(err);
        res.send("Success");
      });
    })
    .get((req, res) => {
      db.collection("expences").find({}, (err, cursor) => {
        cursor.toArray().then(docs => {
          //console.log(docs);
          res.send(docs);
        });
      });
    });
  app.get("/logo", (req, res) => {
    res.sendFile(path.join(__dirname, "./assets", "logo.png"));
  });
  app.use((req, res) => {
    res.send("Page not found");
  });
});
