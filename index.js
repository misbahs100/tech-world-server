const express = require('express')
const cors = require('cors')
const bodyParser = require('body-parser')
require('dotenv').config()
const MongoClient = require('mongodb').MongoClient;
const { ObjectId } = require('bson');

const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.lqubf.mongodb.net/${process.env.DB_NAME}?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

const app = express()
app.use(cors())
app.use(bodyParser.json())

client.connect(err => {
  const serviceCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION1}`);
  const adminCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION2}`);
  const ordersCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION3}`);
  const testimonialCollection = client.db(`${process.env.DB_NAME}`).collection(`${process.env.DB_COLLECTION4}`);

  // create an admin
  app.post('/addAnAdmin', (req, res) => {
    const admin = req.body;
    console.log("admin: ", admin);
    adminCollection.insertOne(admin)
      .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount > 0);
      })
  })

  // create a service
  app.post('/addService', (req, res) => {
    const service = req.body;
    console.log("admin: ", service);
    serviceCollection.insertOne(service)
      .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount > 0);
      })
  })

  // read a (matched id) service
  app.get('/service/:id', (req, res) => {
    serviceCollection.find({ _id: ObjectId(req.params.id) })
      .toArray((err, documents) => {
        res.send(documents[0]);
      })
  })
 
  // read all services
  app.get('/services', (req, res) => {
    serviceCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  // update a (matched id) service
  app.post('/updateService', (req, res) => {
    console.log(req.body)
    const name = req.body.name;
    const price = req.body.price;
    const description = req.body.description;
    const imageURL = req.body.imageURL;
    serviceCollection.updateOne({ _id: ObjectId(req.body.id) },
      { $set: { name: name, price: price, description: description, imageURL: imageURL } }
    )
      .then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      })
  })

  // delete one service
  app.delete('/deleteService/:id', (req, res) => {
    serviceCollection.deleteOne({ _id: ObjectId(req.params.id) })
      .then(result => {
        console.log(result);
        res.send(result.deletedCount > 0);
      })
  })

  // create an order
  app.post('/addOrder', (req, res) => {
    const order = req.body;
    ordersCollection.insertOne(order)
      .then(result => {
        console.log("order: ", result.insertedCount)
        res.send(result.insertedCount > 0)
      })
  })

  // read some(matched email) orders from database
  app.get('/orders/:email', (req, res) => {
    console.log(req.params.email);
    ordersCollection.find({ email: req.params.email })
      .toArray((err, documents) => {
        console.log("docss: ", documents)
        res.send(documents)
      })
  })

  // read all orders
  app.get('/orders', (req, res) => {
    ordersCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  // read a loggedInUser is an admin or not by checking email
  app.post('/isAdmin', (req, res) => {
    const email = req.body.email;
    adminCollection.find({ email: email })
      .toArray((err, admins) => {
        res.send(admins.length > 0);
      })
  })

  // create a testimonial
  app.post('/addTestimonial', (req, res) => {
    const testimonial = req.body;
    console.log("testimonial: ", testimonial);
    testimonialCollection.insertOne(testimonial)
      .then(result => {
        console.log(result.insertedCount)
        res.send(result.insertedCount > 0);
      })
  })

  // read all testimonials
  app.get('/testimonials', (req, res) => {
    testimonialCollection.find({})
      .toArray((err, documents) => {
        res.send(documents);
      })
  })

  // update state
  app.post('/updateState/:id', (req, res) => {
    ordersCollection.updateOne({ _id: ObjectId(req.params.id) },
      { $set: { state: req.body.state } }
    )
      .then(result => {
        console.log(result);
        res.send(result.modifiedCount > 0);
      })
  })




});


app.get('/', (req, res) => {
  res.send('Welcome to Webpage Service Database!')
})

const port = process.env.PORT || 5000;
app.listen(port)