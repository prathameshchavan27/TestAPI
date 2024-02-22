const express = require('express');
const mongoose = require('mongoose');
const cors = require('cors');
const Record = require('./modals/record');
const Customers = require('./modals/Customers');

mongoose.connect("mongodb+srv://Cluster71972:patu2772@cluster71972.odih9tz.mongodb.net/Vendors",{useNewUrlParser:true}, {useUnifiedTopology:true}, ()=>{
    console.log("connected to mongodb");
});

const app = express();
app.use(express.json());
app.use(cors({ 
    origin: "http://localhost:3000", 
    credentials: true 
}));
function getFormattedDate(date){
    return date.toISOString().slice(0,10);
}

app.post("/",async (req,res)=>{
    const {name,collected,distributed} = req.body;
    console.log(req.body);
    const yest = new Date();
    yest.setDate(yest.getDate()-1);
    const targetDate = getFormattedDate(yest)
    const prev = await Record.findOne({
        "date": {
            "$gte":new Date(`${targetDate}T00:00:00.000Z`),
            "$lte": new Date(`${targetDate}T23:59:59.999Z`)
        },
        "name":name},
        {"balance":1});
    let prevbalance = 0;
    if(prev!=null){
        prevbalance = prev.balance
    }
    const total = distributed*1+prevbalance*1
    const bal = total-collected*1
    const fd = getFormattedDate(new Date());
    const today = new Date(`${fd}T00:00:00.000Z`)
    const customer = await Customers.find({"name": name});
    const data = {
        userId: customer._id,
        name: name,
        distributed: distributed,
        prevBal: prevbalance,
        total: total,
        collected: collected,
        balance: bal,
        date: today
    }
    // console.log(data);
    const record = new Record(data);
    console.log(record);
    try {
        const saveRecord = await record.save();
        res.status(200).json(saveRecord);
    } catch (error) {
        res.status(500).json(error);
    }
})

app.put("/update", async (req,res)=>{
    const data = req.body;
    console.log(data.userId);
    try {
        Record.findByIdAndUpdate({_id:data.userId},data).then(()=>{
            Record.findOne({_id: data.userId}).then((rec)=>{
                res.status(200).json(rec)
            })
        });
    } catch (error) {
        res.status(404).json(error);
    }
    res.status(200).json(data)
})

app.get("/today", async (req,res)=>{
    try {
        const yest = new Date();
        yest.setDate(yest.getDate()-1);
        const yestDate = getFormattedDate(yest)
        const prev = await Record.find({
            "date": {
                "$gte":new Date(`${yestDate}T00:00:00.000Z`),
                "$lte": new Date(`${yestDate}T23:59:59.999Z`)
            }},
            {"balance":1,"name":1,"date":1});
        const targetDate = getFormattedDate(new Date());
        const todaysRecords = await Record.find({
            "date": {
                "$gte": new Date(`${targetDate}T00:00:00.000Z`),
                "$lte": new Date(`${targetDate}T23:59:59.999Z`)
            },
        })
        if(todaysRecords.length===0){
            for(let i=0;i<prev.length;i++){
                prev[i].prevBal = prev[i].balance
                prev[i].balance = 0;
            }
            res.status(200).json(prev);
        }else
            res.status(200).json(todaysRecords);
    } catch (error) {
        res.status(400).json(error);
    }
})



app.listen(3001,()=>{
    console.log("Server running on port 3001")
});