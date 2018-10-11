/* Require */
const express = require('express')
const app = express()
const server = require('http').Server(app)
const io = require('socket.io')(server)
const md5 = require('js-md5')
const dateFormat = require('dateformat')
const MongoClient = require('mongodb').MongoClient
const Fiber = require('fibers')
const Sql = require('mssql')
const SerialPort = require('serialport')

/* Config Value */
const dbUrl = "mongodb://172.16.0.249:27017/cicps"
const dbconfig = {
    user: 'sa',
    password: 'Tamakogi20112',
    server: 'cic-payroll',
    database: 'CIC_Payroll'
}
let Buffer = ""
let empno = ""
let txtmsg = ""
let isScan = false
let xxname = ""
let xxcount = 0
let xxempno = ""
let xxdept = ""
let xxposition = ""
let fingerfound = ""

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

/* Config Server Get */
app.get('/', (req, res) => {
    res.sendFile(__dirname + '/index.html')
})
app.get('/employeeinfo', (req, res) => {
    res.sendFile(__dirname + '/employeeinfo.html')
})
app.get('/verifycode', (req, res) => {
    const empno = req.query['empno']
    const pwd = req.query['pwd']
    checkpwd(empno, pwd)

    MongoClient.connect(dbUrl, (err, db) => {
        if (err) console.log("Mongo Error Connect")
        const foremp = req.query['empno']
        const data = {
            'empno': req.query['empno'],
            'code': md5(req.query['pwd'])
        }
        db.collection('employeecode').find(data).toArray((err, result) => {
            if (err) console.log(err)
            //console.log(result.length)
            const vresult = []
            if (result.length < 1) {
                res.send(vresult)
            } else {
                const con = new Sql.connection(dbconfig, (err) => {
                    const request = new Sql.connection(con)
                    request.query('SELECT COUNT(*) as COUNT FROM USRN_Empinfo_work_age WHERE PRS_NO=' + foremp, (err, recset) => {
                        if (err) return console.log("Not Found")
                        if (recset[0].COUNT > 0) {
                            request.query('SELECT * FROM USRN_Empinfo_work_age WHERE PRS_NO=' + foremp, (err, crecset) => {
                                if (err) return console.log("Empty Data in Database")
                                vresult = [{
                                    'fullname': crecset[0].EMP_NAME + " " + crecset[0].EMP_SURNME,
                                    'empstatus': crecset[0].PRI_STATUS,
                                    'empdept': crecset[0].Dept,
                                    'empsec': crecset[0].Sec,
                                    'emppos': crecset[0].JBT_THAIDESC,
                                    'empdate': dateFormat(crecset[0].PRI_START_D, "dd/mm/yyyy"),
                                    'workyear': crecset[0].Age_year,
                                    'workmonth': crecset[0].Age_month,
                                    'emphot': crecset[0].PRS_SC_HSTAL,
                                    'emptype': crecset[0].Emp_type
                                }]
                                console.table(vresult)
                                res.send(vresult)
                            })
                        }
                    })
                })
            }
        })
    })
})
app.get('/train', (req, res) => {
    if (req.query['empno'] != "") {
        const foremp = req.query['empno']
        const vresult = []
        const con = new Sql.Connection(dbconfig, (err) => {
            const request = new Sql.Connection(con)
            request.query('SELECT COUNT(*) as COUNT FROM USRN_Training_summary WHERE PRS_NO=' + foremp, (err, recset) => {
                if (err) return console.log("Not Found")
                if (recset[0].COUNT > 0) {
                    request.query('SELECT * FROM USRN_Training_summary WHERE PRS_NO=' + foremp, (err, crecset) => {
                        if (err) return console.log("Empty Data in Database")
                        for (let i = 0; i < crecset.length - 1; i++) {
                            vresult.push({
                                'cid': crecset[i].Course_ID,
                                'cname': crecset[i].Course_Name
                            })
                        }
                        res.send(vresult)
                    })
                }
            })
        })
    }
})
app.get('/evt', (req, res) => {
    if (req.query['empno'] != "") {
        const foremp = req.query['empno']
        const vresult = []
        const con = new Sql.Connection(dbconfig, (err) => {
            const request = new Sql.Connection(con)
            const d = new Date()
            const n = d.getFullYear()
            request.query('SELECT COUNT(*) as COUNT FROM qry_personal_leave_summary WHERE Year=' + n + ' AND PRS_NO=' + foremp, (err, recset) => {
                if (err) return console.log("Not Found")
                if (recset[0].COUNT > 0) {
                    request.query('SELECT * FROM qry_personal_leave_summary WHERE Year=' + n + ' AND PRS_NO=' + foremp, (err, crecset) => {
                        if (err) return console.log("Empty Data in Database")
                        for (let i = 0; i < crecset.length - 1; i++) {
                            vresult.push({
                                'eventname': crecset[i].SIT_DESC,
                                'amt': crecset[i].amt,
                                'amt2': crecset[i].amt2
                            })
                        }
                        res.send(vresult)
                    })
                }
            })
        })
    }
})
app.get('/holiday', (req, res) => {
    if (req.query['empno'] != "") {
        const foremp = req.query['empno']
        const vresult = []
        const con = new Sql.Connection(dbconfig, (err) => {
            const request = new Sql.Connection(con)
            const d = new Date()
            const n = d.getFullYear()
            request.query('SELECT COUNT(*) as COUNT FROM Emp_holiday WHERE PRS_NO=' + foremp, (err, recset) => {
                if (err) return console.log("Not Found")
                if (recset[0].COUNT > 0) {
                    request.query('select Emp_holiday.PRS_NO,Emp_holiday.holiday,SUM(qry_personal_leave_summary.amt) as amt from Emp_holiday INNER JOIN qry_personal_leave_summary ON Emp_holiday.PRS_NO = qry_personal_leave_summary.PRS_NO WHERE (dbo.Emp_holiday.PRS_NO = ' + foremp + ') AND (dbo.qry_personal_leave_summary.TMP_STT = 8) AND (dbo.qry_personal_leave_summary.Year = ' + n + ') GROUP BY Emp_holiday.PRS_NO,Emp_holiday.holiday', (err, crecset) => {
                        if (err) return console.log("Empty Data in Database")
                        for (let i = 0; i < crecset.length - 1; i++) {
                            vresult.push({
                                'holiday_amt': crecset[i].holiday,
                                'amt': crecset[i].amt
                            })
                        }
                        res.send(vresult)
                    })
                }
            })
        })
    }
})
app.get('/benefit', (req, res) => {
    const vresult = []
    MongoClient.connect(dbUrl, (req, res) => {
        if (err) return console.log(err)
        db.collection('brnrfits').find({}).toArray((err, result) => {
            if (err) return console.log(err)
            res.send(result)
        })
    })
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
const portconnect = (type, val) => {
    let txtval = ""
    if (type === 0) txtval = "/dev/ttyACM0"
    else if (type === 1) txtval = "COM" + val
    return txtval
}
const serialWrite = (message) => {
    serialport.write(message)
}
const closeSerialport = () => {
    serialport.on('close', () => {
        console.log("Serial Close")
    })
}
const clearData = () => {
    xxempno = ""
}

/* Config Server Use */
app.use(express.static(__dirname + '/public'))
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
app.use('/photo', express.static(__dirname + 'http://172.16.0.201:86'))

/* Config SerialPort */
const serialport = new SerialPort(portconnect(1, 3), {
    baudRate: 9600,
    parser: SerialPort.parsers.Readline
})
serialport.on('open', () => {
    console.log("Serial Port Opend")
})
serialport.on('data', (data) => {
    Buffer += data
    fingerfound = ""
    if (data.toString().substring(0, 5) == "Found") {
        fingerfound = "ยืนยันตัวตนผ่าน"
    } else if (Buffer.length >= 7) {
        empno = parseInt(Buffer.toString().substr(0, 10))
        Buffer = ""
        //console.log(empno)
        if (empno !== "" && empno.toString().length == 7) {
            console.log(empno)
            const con = new Sql.ConnectionPool(dbconfig, (err) => {
                const request = new Sql.ConnectionPool(con)
                request.query('SELECT COUNT(*) as COUNT FROM qry_EmpInfo WHERE PRS_NO=' + empno, (err, recset) => {
                    if (err) return console.log("Not Found")
                    xxcount = recset[0].COUNT
                    isScan = true
                    if (xxcount > 0) {
                        request.query('SELECT * FROM qry_EmpInfo WHERE PRS_NO=' + empno, (err, crecset) => {
                            if (err) return console.log("Not Found")
                            xxempno = crecset[0].PRS_NO
                            xxname = crecset[0].EMP_INTL + crecset[0].EMP_NAME + " " + crecset[0].EMP_SURNME
                            xxposition = crecset[0].JBT_THAIDESC
                            xxdept = crecset[0].Dept

                            MongoClient.connect(dbUrl, (err, db) => {
                                if (err) return console.log(err)
                                db.collection('fingermap').remove({})
                                const empdata = {
                                    'empno': xxempno,
                                    'fullname': xxname,
                                    'position': xxposition,
                                    'dept': xxdept
                                }
                                db.collection('fingermap').insert(empdata, (err, result) => {
                                    db.close()
                                    if (err) return console.log("Can't Insert")
                                })
                            })
                        })
                    } else {
                        MongoClient.connect(dbUrl, (err, db) => {
                            if (err) return console.log(err)
                            db.collection('fingermap').remove({}, (err, result) => {
                                db.close()
                            })
                        })
                        xxempno = ""
                    }
                })
            })
        }
    }
})

/* Config IO */
io.on('connection', (socket) => {
    setInterval(() => {
        socket.emit('message', {
            empno: xxempno,
            empname: xxname,
            emppos: xxposition,
            empdept: xxdept,
            txt: xxcount,
            scancard: isScan,
            fingerdata: fingerfound
        })
    }, 1000)
    socket.on('res', (data) => {
        if (data.resp == "1") {
            isScan = false
        }
    })
    socket.on('exitapp', (data) => {
        clearData()
        serialport.write("rfid")
        console.log("EXIT APP")
    })
    socket.on('fingerscan', (data) => {
        clearData()
        serialWrite("finger")
    })
    socket.on('changemode', (data) => {
        fingerfound = ""
        serialWrite("rfid")
    })
    socket.on('codesuccess', (data) => {
        clearData()
    })
})