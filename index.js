
import express from "express";

import { MongoClient } from "mongodb";

const app = express();
const PORT = 9000;

//middleware
app.use(express.json())

const MONGO_URL="mongodb://localhost:27017";
//takes some time to connect so using async and await
async function createConnection(){
    const client = new MongoClient(MONGO_URL);
    await client.connect();
    console.log("Mongo DB connected");
    return client;
}
const client = await createConnection();

//get mentor list
app.get("/mentor",async (request,response)=>{
    let mentors = await client.db("practise").collection("mentor").find({}).toArray(); 
    response.send(mentors)   
});

//get student list
app.get("/student",async (request,response)=>{
    let students = await client.db("practise").collection("student").find({}).toArray(); 
    response.send(students)   
});

//get student array for particular mentor
app.get("/mentorstudents",async (request,response)=>{
    console.log(request.query)
    let mentors = await client.db("practise").collection("student").find(request.query).toArray(); 
    response.send(mentors)   
});


//update mentor for multiple students
app.put("/students-for-mentor",async (request,response)=>{
    const {mentor_name,students}= request.body; 
    const responsearr=[];
    console.log(mentor_name,students);

    //map through array of students and send message accordingly
    //if sudent does not have mentor already can add mentor
    students.map(async (ele)=>{
        let student = await getstudentbyname(ele);
        if(student[0].mentor_name!==""){
            responsearr.push({message:ele+" already has mentor"});
        }else{
           await updatementor(ele,mentor_name)
            responsearr.push({message:ele+"'s mentor is "+mentor_name });
        }
        //if we have message for all students can send the response
        if(students.length===responsearr.length){
        response.send(responsearr);
        }
    
    })
    
   
});

//uppdate mentor of single student
app.put("/student-for-mentor",async (request,response)=>{
    const {mentor_name,student_name}= request.body; 

    await updatementor(student_name,mentor_name);
   response.send({message:"updated"});
});

//create new mentor
app.post("/mentor",async (request,response)=>{
    let mentor = await client.db("practise").collection("mentor").insertOne(request.body); 
    response.send(mentor)   
});

//create new student
app.post("/student",async (request,response)=>{
    let student = await client.db("practise").collection("student").insertOne(request.body); 
    response.send(student)   
});



async function getstudentbyname(name){
   return await client.db("practise").collection("student").find({"student_name":name}).toArray();
}

async function updatementor(student,mentor_name){
    ( await client.db("practise").collection("student").updateOne({"student_name":student},{$set:{mentor_name:mentor_name}}))
}


app.listen(PORT,()=>{console.log("Server started in port "+PORT)})