const express = require('express');
const cors = require('cors');
const { MongoClient, ServerApiVersion, ObjectId } = require('mongodb');
require('dotenv').config()
const app = express();
require('colors')
const port = process.env.PORT || 5000;

// middleware
app.use(cors());
app.use(express.json());



const uri = `mongodb+srv://${process.env.DB_USER}:${process.env.DB_PASS}@cluster0.nbzul73.mongodb.net/?retryWrites=true&w=majority`;

// Create a MongoClient with a MongoClientOptions object to set the Stable API version
const client = new MongoClient(uri, {
  serverApi: {
    version: ServerApiVersion.v1,
    strict: true,
    deprecationErrors: true,
  }
});
client.connect()
.then(()=>{
  console.log('Mongodb Connected Successefully'.yellow.bold)
})
async function run() {
  try {

    const jobCollection = client.db('dreamJob').collection('jobcategory');
    const categoryCollection = client.db('dreamJob').collection('allCategory');
    const applyjobCollection = client.db('dreamJob').collection('applyjob')

    // jobcategory collection
    app.get('/jobcategories', async (req, res) => {
      const cursor = jobCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })

    // get single job category images
    app.get('/job-by-category/:name', async(req, res) => {
      const name = req.params.name;
      let query = {}
    if(name!=='all'){
      query =  { job_category: name }
    }
      const result = await categoryCollection.find(query).toArray();
      res.send(result);
  })

    // get single product
    app.get('/details/:id', async(req, res) => {
      const id = req.params.id;
      const query = {_id: new ObjectId(id)}
      const result = await categoryCollection.findOne(query);
      res.send(result);
  })


    app.get('/jobcategory/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }

      const options = {
        projection: { job_category: 1, image: 1 }
      }
      const result = await jobCollection.findOne(query, options);

      res.send(result);
    })


    // category collection
    app.post('/allCategory', async (req, res) => {
      const newJob = req.body;
      console.log(newJob);
      const result = await categoryCollection.insertOne(newJob);
      res.send(result);
    })


    app.get('/allCategory', async (req, res) => {
      const cursor = categoryCollection.find();
      const result = await cursor.toArray();
      res.send(result);
    })


    // applyjob

    app.get('/applyjob', async (req, res) => {
      console.log(req.query.email);
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await applyjobCollection.find(query).toArray();
      res.send(result);
    })

    // all my jobs 
    app.get('/myjob', async (req, res) => {
      let query = {}
      if (req.query?.email) {
        query = { email: req.query.email }
      }
      const result = await applyjobCollection.find(query).toArray();
      res.send(result);
    })

    app.post('/applyjob', async (req, res) => {
      const applyjob = req.body;
      const exist = await applyjobCollection.findOne({
        email:applyjob.email,
        jobId:applyjob.jobId
      });

      
       if (exist)return res.send({success:false,message:'Already appplied this  job'});

      const result = await applyjobCollection.insertOne(applyjob);
      res.send({success:true,...result});
    });

    app.patch('/applyjob/:id', async (req, res) => {
      const id = req.params.id;
      const filter = { _id: new ObjectId(id) };
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
    app.delete('/applyjob/:id', async (req, res) => {
      const id = req.params.id;
      const query = { _id: new ObjectId(id) }
      const result = await applyjobCollection.deleteOne(query);
      res.send(result);
    })



  } finally {
    // Ensures that the client will close when you finish/error
    // await client.close();
  }
}
run().catch(console.dir);


app.get('/', (req, res) => {
  res.send('dream job is running')
})

app.listen(port, () => {
  console.log(`dream job server is running on port ${port}`)
})
