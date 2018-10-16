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
    password: 'Tamakogi2012',
    server: '172.16.0.249',
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
MongoClient.connect(dbUrl, {
    useNewUrlParser: true
}, (err, db) => {
    if (!err) setTimeout(() => {
        console.log("Mongodb Success !")
    }, 1000);
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
    //console.log(empno + " | " + pwd)
    checkpwd(empno, pwd)

    MongoClient.connect(dbUrl, {
        useNewUrlParser: true
    }, (err, db) => {
        const dbo = db.db('cicps')
        if (err) console.log("Mongo Error Connect")
        const foremp = req.query['empno']
        const data = {
            'empno': req.query['empno'],
            'code': md5(req.query['pwd'])
        }
        dbo.collection('employeecode').find(data).toArray((err, result) => {
            if (err) console.log(err)
            //console.log(result.length)
            let vresult = []
            if (result.length < 1) {
                res.send(vresult)
            } else {
                const con = new Sql.ConnectionPool(dbconfig, (err) => {
                    const request = new Sql.Request(con)
                    request.query('SELECT COUNT(*) as COUNT FROM USRN_Empinfo_work_age WHERE PRS_NO=' + foremp, (err, recset) => {
                        if (err) return console.log("Not Found")
                        if (recset['recordset'][0].COUNT > 0) {
                            request.query('SELECT * FROM USRN_Empinfo_work_age WHERE PRS_NO=' + foremp, (err, crecset) => {
                                if (err) return console.log("Empty Data in Database")
                                vresult = [{
                                    'fullname': crecset['recordset'][0].EMP_NAME + " " + crecset['recordset'][0].EMP_SURNME,
                                    'empstatus': crecset['recordset'][0].PRI_STATUS,
                                    'empdept': crecset['recordset'][0].Dept,
                                    'empsec': crecset['recordset'][0].Sec,
                                    'emppos': crecset['recordset'][0].JBT_THAIDESC,
                                    'empdate': dateFormat(crecset['recordset'][0].PRI_START_D, "dd/mm/yyyy"),
                                    'workyear': crecset['recordset'][0].Age_year,
                                    'workmonth': crecset['recordset'][0].Age_month,
                                    'emphot': crecset['recordset'][0].PRS_SC_HSTAL,
                                    'emptype': crecset['recordset'][0].Emp_type
                                }]
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
        let vresult = []
        const con = new Sql.ConnectionPool(dbconfig, (err) => {
            const request = new Sql.Request(con)
            request.query('SELECT COUNT(*) as COUNT FROM USRN_Training_summary WHERE PRS_NO=' + foremp, (err, recset) => {
                if (err) return console.log("Not Found")
                if (recset['recordset'][0].COUNT > 0) {
                    request.query('SELECT * FROM USRN_Training_summary WHERE PRS_NO=' + foremp, (err, crecset) => {
                        if (err) return console.log("Empty Data in Database")
                        for (let i = 0; i <= crecset['recordset'].length - 1; i++) {
                            vresult.push({
                                'cid': crecset['recordset'][i].Course_ID,
                                'cname': crecset['recordset'][i].Course_Name
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
    //console.log(req.query)
    if (req.query['empno'] != "") {
        const foremp = req.query['empno']
        let vresult = []
        let d = new Date()
        let n = d.getFullYear()
        let querysqlcode = 'FROM qry_personal_leave_summary WHERE Year=' + n + ' AND PRS_NO=' + foremp
        let countquery = 'SELECT COUNT(*) as count ' + querysqlcode

        sqlCall(countquery, (err, data) => {
            if (typeof err !== "undefined" && err !== null) {
                console.log('Not Found')
                return
            }
            //console.log(data["recordset"][0].count)
            if (data["recordset"][0].count > 0) {
                let dataquery = 'SELECT * ' + querysqlcode

                sqlCall(dataquery, (err, data) => {
                    if (typeof err !== "undefined" && err !== null) {
                        console.log('Not Found Data')
                        return
                    }
                    let mn = data['recordset']
                    //console.log('Before : ')
                    //console.log(mn)
                    for (let i = 0; i <= mn.length - 1; i++) {
                        vresult.push({
                            'eventname': mn[i].STT_DESC,
                            'amt': mn[i].amt,
                            'amt2': mn[i].amt2
                        })
                    }
                    //console.log('After : ')
                    //console.log(vresult)
                    res.send(vresult)
                })
            }
        })
    }
})
app.get('/holiday', (req, res) => {
    if (req.query['empno'] != "") {
        const foremp = req.query['empno']
        let vresult = []
        const con = new Sql.ConnectionPool(dbconfig, (err) => {
            const request = new Sql.Request(con)
            const d = new Date()
            const n = d.getFullYear()
            request.query('SELECT COUNT(*) as COUNT FROM Emp_holiday WHERE PRS_NO=' + foremp, (err, recset) => {
                if (err) return console.log("Not Found")
                if (recset['recordset'][0].COUNT > 0) {
                    request.query('select Emp_holiday.PRS_NO,Emp_holiday.holiday,SUM(qry_personal_leave_summary.amt) as amt from Emp_holiday INNER JOIN qry_personal_leave_summary ON Emp_holiday.PRS_NO = qry_personal_leave_summary.PRS_NO WHERE (dbo.Emp_holiday.PRS_NO = ' + foremp + ') AND (dbo.qry_personal_leave_summary.TMP_STT = 8) AND (dbo.qry_personal_leave_summary.Year = ' + n + ') GROUP BY Emp_holiday.PRS_NO,Emp_holiday.holiday', (err, crecset) => {
                        if (err) return console.log("Empty Data in Database")

                        for (let i = 0; i < crecset.length - 1; i++) {
                            vresult.push({
                                'holiday_amt': crecset['recordset'][i].holiday,
                                'amt': crecset['recordset'][i].amt
                            })
                        }
                        res.send(vresult)
                    })
                }
            })
        })
    }
})
/*app.get('/benefit', (req, res) => {
    let vresult = []
    MongoClient.connect(dbUrl, {
        useNewUrlParser: true
    }, (err, db) => {
        const dbo = db.db('cicps')
        if (err) return console.log(err)
        dbo.collection('benefits').find({}).toArray((err, result) => {
            if (err) return console.log(err)
            res.send(result)
        })
    })
})*/

/* Config Function */
const checkpwd = (empno, pwd) => {
    MongoClient.connect(dbUrl, {
        useNewUrlParser: true
    }, (err, db) => {
        const dbo = db.db('cicps')
        const data = {
            'empno': empno
        }
        dbo.collection('employeecode').find(data).toArray((err, result) => {
            if (err) console.log(err)
            if (result.length === 0 && pwd !== "") {
                const empdata = {
                    'empno': empno,
                    'code': md5(pwd)
                }
                dbo.collection('employeecode').insert(empdata, (err, result) => {
                    db.close()
                    if (err) console.log("Can't Insert")
                })
            }
        })
    })
}
const sqlCall = (query, cb) => {
    const con = new Sql.ConnectionPool(dbconfig, (err) => {
        if (typeof err !== "undefined" && err !== null) {
            cb(err)
            return
        }

        let request = new Sql.Request(con)
        request.query(query, (err, recset) => {
            cb(err, recset)
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
    xxname = ""
    xxdept = ""
    xxposition = ""
}

/* Config Server Use */
app.use(express.static(__dirname + '/public'))
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js'))
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css'))
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist'))
//app.use('/photo', express.static(__dirname + 'http://172.16.0.201:86'))

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
            //console.log(empno)
            let con = new Sql.ConnectionPool(dbconfig, (err) => {
                let request = new Sql.Request(con)
                request.query('SELECT COUNT(*) as COUNT FROM qry_EmpInfo WHERE PRS_NO=' + empno, (err, recset) => {
                    if (err) return console.log("Not Found This Name")
                    xxcount = recset['recordset'][0].COUNT
                    isScan = true
                    //return console.log(xxcount)
                    if (xxcount > 0) {
                        request.query('SELECT * FROM qry_EmpInfo WHERE PRS_NO=' + empno, (err, crecset) => {
                            if (err) return console.log("Not Found")
                            xxempno = crecset['recordset'][0].PRS_NO
                            xxname = crecset['recordset'][0].EMP_INTL + crecset['recordset'][0].EMP_NAME + " " + crecset['recordset'][0].EMP_SURNME
                            xxposition = crecset['recordset'][0].JBT_THAIDESC
                            xxdept = crecset['recordset'][0].Dept

                            MongoClient.connect(dbUrl, {
                                useNewUrlParser: true
                            }, (err, db) => {
                                if (err) return console.log(err)
                                const dbo = db.db('cicps')
                                dbo.collection('fingermap').remove({})
                                const empdata = {
                                    'empno': xxempno,
                                    'fullname': xxname,
                                    'position': xxposition,
                                    'dept': xxdept
                                }
                                dbo.collection('fingermap').insert(empdata, (err, result) => {
                                    db.close()
                                    if (err) return console.log("Can't Insert")
                                })
                            })
                        })
                    } else {
                        MongoClient.connect(dbUrl, {
                            useNewUrlParser: true
                        }, (err, db) => {
                            if (err) return console.log(err)
                            const dbo = db.db('cicps')
                            dbo.collection('fingermap').remove({}, (err, result) => {
                                db.close()
                            })
                        })
                        xxempno = ""
                        xxname = ""
                        xxposition = ""
                        xxdept = ""
                    }
                })
            })
        }
    }
})

/* Config IO */
io.on('connection', (socket) => {
    //console.log("IO Connection")
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