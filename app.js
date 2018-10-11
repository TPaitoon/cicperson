const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const md5 = require('js-md5')
const dateFormat = require('dateformat')
const MongoClient = require('mongodb').MongoClient

/* Config Value */
const dbUrl = "mongodb://172.16.0.249:27017/cicps"
const dbconfig = {
    user: 'sa',
    password: 'Tamakogi20112',
    server: 'cic-payroll',
    database: 'CIC_Payroll'
}

/* Mongodb Connection */
MongoClient.connect(dbUrl, (err, db) => {
    if (!err) setTimeout(() => {
        console.log("Mongodb Success !")
    }, 3000);
    if (err) return console.log("Can't Connect Mongodb")
})

/* Set Port Server */
server.listen(8001, () => {
    console.log("Port Started 8001")
})

/* Config Server */
app.get('/', (req, res) => {
    res.sendfile(__dirname + '/index.html')
})
app.get('/employeeinfo', (req, res) => {
    res.sendFile(__dirname + '/employeeinfo.html')
})

/* Config Function */
const checkpwd = (empno, pwd) => {
    MongoClient.connect(dbUrl, (err, db) => {
        const data = {
            'empno': empno
        }
        db.collection('employeecode').find(data).toArray((err, result) => {
            if (err) console.log(err)
            if (result.length === 0 && pwd !== "") {
                const empdata = {
                    'empno': empno,
                    'code': md5(pwd)
                }
                db.collection('employeecode').insert(empdata, (err, result) => {
                    db.close()
                    if (err) console.log("Can't Insert")
                })
            }
        })
    })
}