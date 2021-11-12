const express = require('express');
const { MongoClient } = require('mongodb');
require('dotenv').config()
const cors = require('cors');
const ObjectId = require('mongodb').ObjectId;

const app = express();
const port = process.env.PORT || 5000;


app.use(cors());
app.use(express.json());


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.ehrxz.mongodb.net/myFirstDatabase?retryWrites=true&w=majority`;
const client = new MongoClient(uri, { useNewUrlParser: true, useUnifiedTopology: true });

async function run() {
    try {
        await client.connect();
        const database = client.db("bicycle");
        const servicesCollection = database.collection("products");
        const ordersCollection = database.collection("orders");
        const usersCollection = database.collection("users");
        const reviewCollection = database.collection("review");

        // GET API
        // Load all data in server site from services collection
        app.get('/products', async (req, res) => {
            const cursor = servicesCollection.find({});
            const services = await cursor.toArray();
            res.send(services);
        });

        // Load all data in server site from order collection
        app.get('/orders', async (req, res) => {
            const cursor = ordersCollection.find({});
            const orders = await cursor.toArray();
            res.send(orders);
        });

        // Load all review data from server
        app.get('/review', async (req, res) => {
            const cursor = reviewCollection.find({});
            const reviews = await cursor.toArray();
            res.send(reviews);
        })

        // Update API
        app.put('/orders/:id', async (req, res) => {
            const id = req.params.id;
            // const updatedProduct = req.body;
            const filter = { _id: ObjectId(id) };
            const options = { upsert: true };
            const updateDoc = {
                $set: {
                    status: "shipped"
                },
            };
            const result = await ordersCollection.updateOne(filter, updateDoc, options);
            console.log("updating Products ", id);
            res.json(result);
        })

        // POST API
        // Add data to service collection
        app.post('/addProduct', async (req, res) => {
            const service = req.body;
            // console.log('Hit the post API with data',service);
            const result = await servicesCollection.insertOne(service);
            console.log(result);
            res.json(result);
        });

        // Add data to orders collection
        app.post('/addOrder', async (req, res) => {
            const order = req.body;
            // console.log('Hit the post API with data',service);
            const result = await ordersCollection.insertOne(order);
            console.log(result);
            res.json(result);
        });

        // save users data to server
        app.post('/users', async (req, res) => {
            const user = req.body;
            const result = await usersCollection.insertOne(user);
            console.log(result);
            res.json(result);
        });

        // save review to database
        app.post('/addReview', async (req, res) => {
            const user = req.body;
            const result = await reviewCollection.insertOne(user);
            res.json(result);
        })

        // search user and set them a role
        app.put('/users/admin', async (req, res) => {
            const user = req.body;
            const filter = { email: user.email };
            const updateDoc = { $set: { role: 'admin' } };
            const result = await usersCollection.updateOne(filter, updateDoc);
            res.json(result);
        });

        // Get a single user data by email and check role
        app.get('/users/:email', async (req, res) => {
            const email = req.params.email;
            const query = { email: email };
            const user = await usersCollection.findOne(query);
            let isAdmin = false;
            if (user?.role === 'admin') {
                isAdmin = true;
            };
            res.json({ admin: isAdmin });
        })

        // DELETE users order data  API
        app.delete('/orders/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await ordersCollection.deleteOne(query);
            res.json(result);
        });

        // Delete from products
        app.delete('/products/:id', async (req, res) => {
            const id = req.params.id;
            const query = { _id: ObjectId(id) };
            const result = await servicesCollection.deleteOne(query);
            res.json(result);
        })

    } finally {
        // await client.close();
    }
}
run().catch(console.dir);


app.get('/', (req, res) => {
    res.send('Running Bicycle Server');
});

app.listen(port, () => {
    console.log('Running Delivery Server on Port', port);
});