const express = require('express');
const bodyParser = require('body-parser');
const cors = require('cors');
const { MongoClient } = require('mongodb');
const admin = require('firebase-admin');
require('dotenv').config();
// console.log(process.env.DB_USER);

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.kfttk.mongodb.net/burj?retryWrites=true&w=majority`;
const app = express();
app.use(cors());
app.use(bodyParser.json());



var serviceAccount = require("./configs/burj-al-arab-b6754-firebase-adminsdk-nx9b8-1cab9e3626.json");

admin.initializeApp({
  credential: admin.credential.cert(serviceAccount)
});




const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });
client.connect(err => {
  const collection = client.db("burj").collection("bookings");

  app.post("/addBooking", (req, res) => {
    const newBooking = req.body;
    collection.insertOne(newBooking)
      .then(result => {
        console.log(result)
        res.send(result.insertedCount > 0)
      })
    console.log(newBooking);
  });

  app.get('/bookings', (req, res) => {
    const bearer = req.headers.authorization;
    if (bearer && bearer.startsWith('Bearer ')) {
      const idToken = bearer.split(' ')[1];
      console.log({idToken});

      admin.auth().verifyIdToken(idToken)
        .then((decodedToken) => {
          // const uid = decodedToken.uid;
          const queryEmail=req.query.email;
          const tokenEmail = decodedToken.email;
            // console.log(tokenEmail);
            // console.log(queryEmail);
            if(tokenEmail==queryEmail){
              collection.find({ email: req.query.email })
              .toArray((err, documents) => {
                res.send(documents);
              })
            }
            else{
              res.statusCode(401).send('un-authorized access');
            }
        })
        .catch((error) => {
          res.statusCode(401).send('un-authorized access');
        });
    }
    else{
      res.statusCode(401).send('un-authorized access');
    }
  })

});


app.get('/', (req, res) => {
  res.send('hello.Now it is working!!!');
})

app.listen(7000);