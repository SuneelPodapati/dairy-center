var express = require('express');
var path = require("path");
var bodyParser = require('body-parser');
var mongo = require("mongoose");
var port = 8080;

var db = mongo.connect("mongodb://localhost:27017/DairyCenter", function (err, response) {
    if (err) { console.log(err); }
    else { console.log('Connected to db'); }
});


var app = express()
app.use(bodyParser());
app.use(bodyParser.json({ limit: '25mb' }));
app.use(bodyParser.urlencoded({ extended: true }));


app.use(function (req, res, next) {
    res.setHeader('Access-Control-Allow-Origin', '*');
    res.setHeader('Access-Control-Allow-Methods', 'GET, POST, OPTIONS, PUT, PATCH, DELETE');
    res.setHeader('Access-Control-Allow-Headers', 'X-Requested-With,content-type');
    res.setHeader('Access-Control-Allow-Credentials', true);
    next();
});

var Schema = mongo.Schema;

//#region Producer
var ProducersSchema = new Schema({
    code: { type: String },
    name: { type: String },
    active: { type: Boolean },
    contactNumber: { type: String },
    bankAccountNumber: { type: String },
    bankIfscCode: { type: String },
    loanDate: { type: String },
    loanAmount: { type: Number },
    interestAmount: { type: Number },
    recoveriesAmount: { type: Number },
    otherAmount: { type: Number },
    loan2Date: { type: String },
    loan2Amount: { type: Number }
}, { versionKey: false });

const ProducerModel = mongo.model('producer', ProducersSchema, 'Producers');

app.post("/api/producer/bulk", function (req, res) {
    ProducerModel.bulkWrite(req.body, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Records has been Upserted..!!" });
        }
    });
})

app.post("/api/producer", function (req, res) {
    var producerDocument = new ProducerModel(req.body);
    producerDocument.save(function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Inserted..!!" });
        }
    });
})

app.put("/api/producer", function (req, res) {
    var producerDocument = new ProducerModel(req.body);
    producerDocument.updateOne(req.body, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Updated..!!" });
        }
    });
})

app.get("/api/producer/:allOrActive", function (req, res) {
    let query = req.params.allOrActive == 'all' ? {} : { active: true };
    ProducerModel.find(query, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data.sort((a, b) => a.code - b.code));
        }
    });
})

app.delete("/api/producer/:id", function (req, res) {
    var producerDocument = ProducerModel.findById(req.params.id);
    producerDocument.updateOne({ active: false }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been deactivated..!!" });
        }
    });
})
//#endregion

//#region Procurement
var ProcurementsSchema = new Schema({
    producerCode: { type: String },
    date: { type: Date },
    shift: { type: String },
    quantity: { type: Number },
    fat: { type: Number },
    kgFat: { type: Number },
    rate: { type: Number },
    premiumRate: { type: Number },
    grossAmount: { type: Number },
    incentiveRate: { type: Number },
    incentiveAmount: { type: Number },
    totalAmount: { type: Number },
    sampleNumber: { type: String },
    adjustRate: { type: Boolean },
}, { versionKey: false });

const ProcurementModel = mongo.model('procurement', ProcurementsSchema, 'Procurements');

app.post("/api/procurement/bulk", function (req, res) {
    ProcurementModel.bulkWrite(req.body, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Records has been Upserted..!!" });
        }
    });
})

app.post("/api/procurement", function (req, res) {
    var procurementDocument = new ProcurementModel(req.body);
    procurementDocument.save(function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Inserted..!!" });
        }
    });
})

app.put("/api/procurement", function (req, res) {
    var procurementDocument = new ProcurementModel(req.body);
    procurementDocument.updateOne(req.body, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been Updated..!!" });
        }
    });
})

app.get("/api/procurement/:date?/:shift?", function (req, res) {
    let query = {};
    if (req.params.date) {
        query = { ...query, date: req.params.date };
    }
    if (req.params.shift) {
        query = { ...query, shift: req.params.shift };
    }
    ProcurementModel.find(query, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data.sort((a, b) => a.code - b.code));
        }
    });
})

app.delete("/api/procurement/:id", function (req, res) {
    ProcurementModel.findOneAndDelete({ "_id": req.params.id }, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send({ data: "Record has been deleted..!!" });
        }
    });
})

app.get("/api/procurement/bill/:fromDate/:toDate/:producerCode?", function (req, res) {
    let query = { date: { $gte: req.params.fromDate, $lte: req.params.toDate } };
    if (req.params.producerCode) {
        query = { ...query, producerCode: req.params.producerCode };
    }
    ProcurementModel.find(query, function (err, data) {
        if (err) {
            res.send(err);
        }
        else {
            res.send(data.sort((a, b) => a.date - b.date));
        }
    });
})

//#endregion

app.listen(port, function () {
    console.log(`Api started on port ${port}!`)
})  