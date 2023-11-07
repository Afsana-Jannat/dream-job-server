const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());


console.log(process.env.DB_PASS)


const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbzul73.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});

async function run() {
  try {
    // Connect the client to the server	(optional starting in v4.7)
    // await client.connect();

    const jobCollection = client.db('dreamJob').collection('jobcategory');
    const categoryCollection = client.db('dreamJob').collection('allCategory');
    const applyjobCollection = client.db('dreamJob').collection('applyjob')

    // jobcategory collection
    app.get('/jobcategory', async(req, res) =>{
        const cursor = jobCollection.find();
        const result = await cursor.toArray();
        res.send(result);
    })

    app.get('/jobcategory/:id', async(req, res) =>{
        const id = req.params.id;
        const query = { _id: new ObjectId(id) }

        const options = {
            projection: {job_category : 1, image: 1 }
        }
        const result = await jobCollection.findOne(query, options);
        res.send(result);
    })


    // category collection
    app.get('/allCategory', async(req, res) =>{
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // applyjob

    app.get('/applyjob', async(req, res) =>{
      console.log(req.query.email);
      let query = {}
      if (req.query?.email){
        query = { email: req.query.email }
      }
      const result = await applyjobCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/applyjob', async(req, res) =>{
      const applyjob = req.body;
      console.log(applyjob);
      const result = await applyjobCollection.insertOne(applyjob);
      res.send(result);
    });

    app.patch('/applyjob/:id', async(req, res) => {
      const id = req.params.id;
      const filter = {_id: new ObjectId(id)};
      const updatedApplyjob = req.body;
      console.log(updatedApplyjob);
      const updateDoc = {
        $set: {
          status: updatedApplyjob.status
        }
      };
      const result = await applyjobCollection.updateOne(filter, updateDoc);
      res.send(result);

    })
    app.delete('/applyjob/:id', async (req, res) =>{
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await applyjobCollection.deleteOne(query);
      res.send(result);
    })


    // Send a ping to confirm a successful connection
    await client.db("admin").command({ ping: 1 });
    console.log("Pinged your deployment. You successfully connected to MongoDB!");
  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) =>{
    res.send('dream job is running')
})

app.listen(port, () => {
    console.log(`dream job server is running on port ${port}`)
})
