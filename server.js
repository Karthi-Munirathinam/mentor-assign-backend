import express from "express";
import cors from "cors";
import mongodb from "mongodb";
import dotenv from 'dotenv';

dotenv.config();

const app = express();
const PORT = process.env.PORT || 5000;

const mongoClient = mongodb.MongoClient;
const MONGO_URL = process.env.MONGO_URL;

//Middlewares
app.use(express.json());
app.use(cors({
    origin: "*"
}))

//Create a mentor
app.post('/savementor', async (req, res) => {
    try {
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let data = await db.collection("mentor").insertOne(req.body);
        await client.close();
        res.json({
            message: "Mentor created!"
        });
    } catch (error) {
        console.log(error);
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
})

//Create a student
app.post('/savestudent', async (req, res) => {
    try {
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let data = await db.collection("student").insertOne(req.body);
        await client.close();
        res.json({
            message: "Student created"
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
})

//Get students who don't have mentor
app.get('/getstudents', async (req, res) => {
    try {
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let data = await db.collection("student").find({ assignedmentor: false }).toArray();
        await client.close();
        res.send(data);
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong!"
        })
    }
})

//Get all the students
app.get('/getallstudents', async (req, res) => {
    try {
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let data = await db.collection("student").find().toArray();
        await client.close();
        res.send(data);
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong!"
        })
    }
})

//Get all the mentors
app.get('/getmentors', async (req, res) => {
    try {
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let data = await db.collection("mentor").find().toArray();
        await client.close();
        res.send(data);
    } catch (error) {
        res.status(400).json({
            message: "Something went wrong!"
        })
    }
})

//Assign mentor to each student with student id
app.put('/assignmentor/:id', async (req, res) => {
    try {
        // console.log(req.params.id)
        let studentid = req.params.id;
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let data = await db.collection("student").findOneAndUpdate({ _id: mongodb.ObjectId(studentid) }, { $set: { assignedmentor: req.body.assignedmentor, mentorID: mongodb.ObjectId(req.body.mentorId) } });
        await client.close();
        res.json({
            message: "Success!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
})

//Assign student to mentor
app.put('/assignstudent/:id', async (req, res) => {
    try {
        let mentorid = req.params.id;
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let userwithID = req.body.assignedStudents.map(student => mongodb.ObjectId(student));
        let data = await db.collection("mentor").findOneAndUpdate({ _id: mongodb.ObjectId(mentorid) }, { $addToSet: { assignedStudents: { $each: userwithID } } });
        await client.close();
        res.json({
            message: "success!"
        });
    } catch (error) {
        res.status(500).json({
            message: "Something went wrong!"
        })
    }
})

//get current mentor of a student
app.get('/getmentor/:id', async (req, res) => {
    try {
        let studentid = req.params.id;
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let mentorid = await db.collection("student").find({ _id: mongodb.ObjectId(studentid) }).toArray();
        let data = await db.collection("mentor").find({ _id: mentorid[0].mentorID }).toArray();
        // console.log(data);
        await client.close();
        res.send(data);
    } catch (error) {
        res.status(404).json({
            message: "Something went wrong!"
        })
    }
})

//Get students of a particular mentor
app.get('/getstudents/:id', async (req, res) => {
    try {
        let mentorid = req.params.id;
        let client = await mongoClient.connect(MONGO_URL);
        let db = client.db("mentor-assign");
        let studentid = await db.collection("student").find({ mentorID: mongodb.ObjectId(mentorid) }).toArray();
        await client.close();
        res.send(studentid);
    } catch (error) {
        res.status(404).json({
            message: "Something went wrong!"
        })
    }
})


app.listen(PORT, () => console.log(`app is listening in port::: ${PORT}`))