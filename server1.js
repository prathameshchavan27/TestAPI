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
// app.use(cors({ 
//     origin: "exp://192.168.31.142:8081", 
//     credentials: true 
// }));
function getFormattedDate(date){
    return date.toISOString().slice(0,10);
}

app.post("/customer", async(req,res)=>{
    const {name,address,phone} = req.body;
    const customers = await Customers.find();
    const customer = new Customers({
        userId: customers.length+1,
        name: name,
        address: address,
        phone: phone
    });
    try {
        const saveCustomer = await customer.save();
        res.status(200).json(saveCustomer);
    } catch (error) {
        res.status(400).json(error);
    }
});

app.get("/customer", async(req,res)=>{
    const customers = await Customers.find();
    try {
        res.status(200).json(customers);
    } catch (error) {
        res.status(400).json(error);
    }
})

app.put("/updateCustomer", async(req,res)=>{
    const {id,customer} = req.body;
    console.log(data);
    try {
        const updateCustomer = await findByIdAndUpdate(
            {_id: id},
            {
                name: customer.name,
                address: customer.address,
                phone: customer.phone
            },
            { new: true } 
        )
        res.status(200).json(updateCustomer)
    } catch (error) {
        res.status(404).json(error);

    }
})

app.get("/records", async(req,res)=>{
    const customers = await Customers.find();
    const records = [];
    for(let i=0;i<customers.length;i++){
        const userId = customers[i].userId;
        const rec = await Record.find({"userId": userId}).sort({rid:-1}).limit(1);
        if(rec.length!=0){
            records.push(rec[0]);
        }else{
            console.log("customer",customers[i]);
            records.push(customers[i]);
        }
        console.log("record",records[i]);
    }
    try {
        res.status(200).json(records);
    } catch (error) {
        res.status(400).json(error);
    }
})

app.get("/records/:date", async(req,res)=>{
    console.log(req.params.date)
    try {
        // const date = getFormattedDate(new Date(req.params.date));
        const date = req.params.date;
        console.log("todayDate:",date);
        const response = await Record.find({
            "date": {
                "$gte": new Date(`${date}T00:00:00.000Z`),
                "$lte": new Date(`${date}T23:59:59.999Z`)
            },
        });
        res.status(200).json(response);
    } catch (error) {
        res.status(400).json(error);
    }
})

app.post("/records", async(req,res)=>{
    const {name,distributed,collected,prevBal,rid} = req.body;
    const total = distributed*1+prevBal*1
    const bal = total-collected*1
    const fd = getFormattedDate(new Date());
    const today = new Date(`${fd}T00:00:00.000Z`)
    const customer = await Customers.find({"name": name});
    console.log("userId",customer[0].userId)
    const data = new Record({
        userId: customer[0].userId,
        name: name,
        distributed: distributed,
        prevBal: prevBal,
        total: total,
        collected: collected,
        balance: bal,
        rid: rid,
        date: today
    })
    try {
        console.log("Server record",data.date);
        const savedRecord = data.save()
        res.status(200).json(savedRecord);
    } catch (error) {
        res.status(400).json(error);
    }
})

app.put("/updaterecord", async (req, res) => {
    console.log("update", req.body);
    const data = req.body;
    console.log(data.userId);
    try {
        // Update the record and await the result
        const res = await Record.find({"userId":data.userId,"rid":data.rid},{"_id":1});
        const id = res[0]._id;
        console.log(id);
        const updatedRecord = await Record.findByIdAndUpdate(
            { _id: id }, // Filter condition
            {
                balance: data.balance,
                collected: data.collected,
                distributed: data.distributed,
                prevBal: data.prevBal,
                total: data.total
            }, // Data to update
            { new: true } // To return the updated document
        );
        // Record.findByIdAndUpdate({"_id":id},data).then(()=>{
        //     Record.findOne({rid: data.rid}).then((rec)=>{
        //         res.status(200).json(rec)
        //     })
        // });
        // Send the updated record as response
        res.status(200).json(updatedRecord);
    } catch (error) {
        // Handle errors
        res.status(404).json(error);
    }
});



app.listen(3001,()=>{
    console.log("Server running on port 3001")
});
