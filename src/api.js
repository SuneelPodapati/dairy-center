var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");

var db = mongo.connect("mongodb://localhost:27017/DairyCenter", function (err, response) {
    if (err) { console.log(err); }
    else { console.log('Connected to db'); }
});


var app = express()
app.use(bodyParser());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', 'http://localhost:4200');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var Schema = mongo.Schema;

var ProducersSchema = new Schema({
    code: { type: String },
    name: { type: String },
    active: { type: Boolean },
    contactNumber: { type: String },
    bankAccountNumber: { type: String },
    bankIfscCode: { type: String },
}, { versionKey: false });

var producer = mongo.model('producer', ProducersSchema, 'Producers');

app.post("/api/Producer", function (req, res) {
    var mod = new producer(req.body);
    mod.save(function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Inserted..!!" });
        }
    });
})

app.put("/api/Producer", function (req, res) {
    var mod = new producer(req.body);
    mod.updateOne(req.body, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            setTimeout(() => {
                res.send({ data: "Record has been Updated..!!" });
            }, 2000);
        }
    });
})

app.get("/api/Producer", function (req, res) {
    producer.find({}, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data.sort((a, b) => a.code - b.code));
        }
    });
})

app.delete("/api/Producer/:id", function (req, res) {
    var mod = producer.findById(req.params.id);
    mod.updateOne({ active: false }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been deactivated..!!" });
        }
    });
})


app.listen(8080, function () {
    console.log('Example app listening on port 8080!')
})  