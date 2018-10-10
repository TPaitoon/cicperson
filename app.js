var express = require('express');
var app = express();
var server = require('http').Server(app);
var io = require('socket.io')(server);

var md5 = require('js-md5');
var dateFormat = require('dateformat');

var MongoClient = require('mongodb').MongoClient;
var dbUrl = "mongodb://172.16.0.249:27017/cicps";

MongoClient.connect(dbUrl, function (err, db) {
    if (!err) setTimeout(function () {
        console.log("Mongo success")
    }, 3000);
    if (err) return;
});

server.listen(8001, function () {
    console.log("started 8001");
});

app.get('/', function (req, res) {
    res.sendFile(__dirname + '/index.html');
});
app.get('/employeeinfo', function (req, res) {
    res.sendFile(__dirname + '/employeeinfo.html');
});
// app.get('/getimage', function(req, res) {
//     res.send(__dirname + '/employeeinfo.html');
// });


Fiber = require('fibers');
Sql = require('mssql');

config = {
    user: 'sa',
    password: 'Tamakogi2012',
    //server: 'localhost',
    server: '172.16.0.249',
    database: 'CIC_Payroll'
};

function checkpwd(empno, pwd) {
    MongoClient.connect(dbUrl, function (err, db) {
        var data = {'empno': empno};
        // db.collection("employeecode").find(data).toArray(function (err, result) {
        db.collection("employeecode").find(data).toArray(function (err, result) {
            if (err) console.log(err);
            // console.log(result.length);
            // if (result.length === 0)
            //     console.log('1234567890');
            if (result.length === 0 && pwd !== "") {
                var empdata = {
                    "empno": empno,
                    "code": md5(pwd)
                }

                db.collection("employeecode").insert(empdata, function (err, result) {
                    db.close();
                    if (err) console.log("cannot insert");
                })
            }
        })
    })
}

app.get('/verifycode', function (req, res) {
    // console.log(JSON.stringify(req.body));
    //console.log(md5(req.query['pwd']));
    var empno = req.query['empno'];
    var pwd = req.query['pwd'];
    checkpwd(empno, pwd);

    MongoClient.connect(dbUrl, function (err, db) {
        if (err) console.log('connect error');
        var foremp = req.query['empno'];
        var data = {'empno': req.query['empno'], 'code': md5(req.query['pwd'])};
        db.collection("employeecode").find(data).toArray(function (err, result) {
            if (err) console.log(err);

            console.log(result.length);
            // res.send(result);
            var datares = [];

            if (result.length <= 0) {
                res.send(datares);
            } else {
                var connection = new Sql.Connection(config, function (err) {
                    //  if (!err) { console.log('connect ok'); }
                    var request = new Sql.Request(connection);

                    //request.query('select count(*) as COUNT from employee where PRS_NO=' + empno, function(err, recset) {
                    request.query('select count(*) as COUNT from USRN_Empinfo_work_age where PRS_NO=' + foremp, function (err, recset) {
                        if (err) {
                            console.log('No data in database');
                            return;
                        }
                        ;
                        if (recset[0].COUNT > 0) {

                            //request.query('select * from employee where PRS_NO=' + empno, function(err, recordset) {
                            request.query('select * from USRN_Empinfo_work_age where PRS_NO=' + foremp, function (err, recordset) {
                                if (err) {
                                    console.log('No data in database');
                                    return;
                                }
                                ;
                                //console.log("OKKKKK NAAA");
                                datares = [{
                                    'fullname': recordset[0].EMP_NAME + " " + recordset[0].EMP_SURNME,
                                    'empstatus': recordset[0].PRI_STATUS,
                                    'empdept': recordset[0].Dept,
                                    'empsec': recordset[0].Sec,
                                    'emppos': recordset[0].JBT_THAIDESC,
                                    'empdate': dateFormat(recordset[0].PRI_START_D, "dd/mm/yyyy"),
                                    'workyear': recordset[0].Age_year,
                                    'workmonth': recordset[0].Age_month,
                                    'emphot': recordset[0].PRS_SC_HSTAL,
                                    'emptype': recordset[0].Emp_type
                                }];
                                console.log(datares);
                                res.send(datares);
                            });
                        }
                    });
                });
            }
            //
        });
    });
});

app.get('/train', function (req, res) {
    if (req.query['empno'] != '') {
        var foremp = req.query['empno'];
        var datares = [];
        var connection = new Sql.Connection(config, function (err) {
            //  if (!err) { console.log('connect ok'); }
            var request = new Sql.Request(connection);

            //request.query('select count(*) as COUNT from employee where PRS_NO=' + empno, function(err, recset) {
            request.query('select count(*) as COUNT from USRN_Training_summary where PRS_NO=' + foremp, function (err, recset) {
                if (err) {
                    console.log('No data in database');
                    return;
                }
                ;
                if (recset[0].COUNT > 0) {

                    //request.query('select * from employee where PRS_NO=' + empno, function(err, recordset) {
                    request.query('select * from USRN_Training_summary where PRS_NO=' + foremp, function (err, recordset) {
                        if (err) {
                            console.log('No data in database');
                            return;
                        }
                        ;
                        for (var i = 0; i <= recordset.length - 1; i++) {
                            datares.push({
                                'cid': recordset[i].Course_ID,
                                'cname': recordset[i].Course_Name,

                            });

                        }
                        // console.log(datares);
                        res.send(datares);
                    });
                }
            });
        });
    }
});

app.get('/evt', function (req, res) {
    if (req.query['empno'] != '') {
        var foremp = req.query['empno'];
        var datares = [];
        var connection = new Sql.Connection(config, function (err) {
            //  if (!err) { console.log('connect ok'); }
            var request = new Sql.Request(connection);
            var d = new Date();
            var n = d.getFullYear();
            //request.query('select count(*) as COUNT from employee where PRS_NO=' + empno, function(err, recset) {
            request.query('select count(*) as COUNT from qry_personal_leave_summary where Year=' + n + ' AND PRS_NO=' + foremp, function (err, recset) {
                if (err) {
                    console.log('No data in database');
                    return;
                }
                ;
                if (recset[0].COUNT > 0) {

                    //request.query('select * from employee where PRS_NO=' + empno, function(err, recordset) {
                    request.query('select * from qry_personal_leave_summary where Year=' + n + ' AND PRS_NO=' + foremp, function (err, recordset) {
                        if (err) {
                            console.log('No data in database');
                            return;
                        }
                        ;
                        for (var i = 0; i <= recordset.length - 1; i++) {
                            datares.push({
                                'eventname': recordset[i].STT_DESC,
                                'amt': recordset[i].amt,
                                'amt2': recordset[i].amt2,

                            });
                        }
                        // console.log(datares);
                        res.send(datares);
                    });
                }
            });
        });
    }
});
app.get('/holiday', function (req, res) {
    if (req.query['empno'] != '') {
        //console.log('niran ok'+ req.query['empno'] );
        var foremp = req.query['empno'];
        var datares = [];
        var connection = new Sql.Connection(config, function (err) {
            //  if (!err) { console.log('connect ok'); }
            var request = new Sql.Request(connection);
            var d = new Date();
            var n = d.getFullYear();
            //request.query('select count(*) as COUNT from employee where PRS_NO=' + empno, function(err, recset) {
            request.query('select count(*) as COUNT from Emp_holiday where PRS_NO =' + foremp + '', function (err, recset) {
                if (err) {
                    console.log('No data in database');
                    return;
                }
                ;
                if (recset[0].COUNT > 0) {

                    //request.query('select * from employee where PRS_NO=' + empno, function(err, recordset) {
                    request.query('select Emp_holiday.PRS_NO,Emp_holiday.holiday,SUM(qry_personal_leave_summary.amt) as amt from Emp_holiday INNER JOIN qry_personal_leave_summary ON Emp_holiday.PRS_NO = qry_personal_leave_summary.PRS_NO ' +
                        ' WHERE (dbo.Emp_holiday.PRS_NO = ' + foremp + ') AND (dbo.qry_personal_leave_summary.TMP_STT = 8) AND (dbo.qry_personal_leave_summary.Year = ' + n + ')' +
                        ' GROUP BY Emp_holiday.PRS_NO,Emp_holiday.holiday', function (err, recordset) {
                        if (err) {
                            console.log('No data in database');
                            return;
                        }
                        ;
                        for (var i = 0; i <= recordset.length - 1; i++) {
                            datares.push({
                                'holiday_amt': recordset[i].holiday,
                                'amt': recordset[i].amt,
                            });
                        }
                        // console.log(datares);
                        res.send(datares);
                    });
                }
            });
        });
    }
});

app.get('/benefit', function (req, res) {
    var datares = [];
    MongoClient.connect(dbUrl, function (err, db) {
        if (err) console.log(err);

        db.collection('benefits').find({}).toArray(function (err, result) {
            if (err) console.log(err);

            res.send(result);

        });
    });

    // res.send(datares);
});

app.use(express.static(__dirname + '/public'));
app.use('/js', express.static(__dirname + '/node_modules/bootstrap/dist/js')); // redirect bootstrap JS
app.use('/jquery', express.static(__dirname + '/node_modules/jquery/dist')); // redirect JS jQuery
app.use('/css', express.static(__dirname + '/node_modules/bootstrap/dist/css')); // redirect CSS bootstrap
app.use('/photo', express.static(__dirname + 'http://172.16.0.201:86')); // redirect CSS bootstrap


var empno = '';
var txtmsg = "";
var isScan = false;
xxname = '';
xxcount = 0;
xxempno = '';
xxdept = '';
xxposition = '';
fingerfound = '';

var SerialPort = require("serialport");
var serialport = new SerialPort("COM3", {
//var serialport = new SerialPort("/dev/ttyACM0", {
    baudRate: 9600,
    parser: SerialPort.parsers.raw
    //parser: SerialPort.parsers.raw
});
//var serialport = new SerialPort("/dev/ttyUSB0");

serialport.on('open', function () {
    console.log('Serial Port Opend');
    serialport.on('data', function (data) {
        console.log(data.toString().substring(0, 10));
        fingerfound = '';
        if (data.toString().substring(0, 5) == 'Found') {
            console.log(data.toString());
            fingerfound = "ยืนยันตัวตนผ่าน";
        } else {
            empno = data.toString().substring(0, 10);
            if (empno != '' && empno.length == 7) {
                var connection = new Sql.Connection(config, function (err) {
                    //  if (!err) { console.log('connect ok'); }
                    var request = new Sql.Request(connection);

                    //request.query('select count(*) as COUNT from employee where PRS_NO=' + empno, function(err, recset) {
                    request.query('select count(*) as COUNT from qry_EmpInfo where PRS_NO=' + empno, function (err, recset) {
                        if (err) {
                            console.log('No data in database');
                            return;
                        }
                        ;

                        console.log(recset[0].COUNT);
                        xxcount = recset[0].COUNT;
                        isScan = true;
                        if (recset[0].COUNT > 0) {
                            console.log(empno);
                            //request.query('select * from employee where PRS_NO=' + empno, function(err, recordset) {
                            request.query('select * from qry_EmpInfo where PRS_NO=' + empno, function (err, recordset) {
                                if (err) {
                                    console.log('No data in database');
                                    return;
                                }
                                ;
                                console.log(recordset[0].EMP_E_NAME);
                                xxempno = recordset[0].PRS_NO;
                                xxname = recordset[0].EMP_INTL + recordset[0].EMP_NAME + " " + recordset[0].EMP_SURNME;
                                xxposition = recordset[0].JBT_THAIDESC;
                                xxdept = recordset[0].Dept;

                                MongoClient.connect(dbUrl, function (err, db) {
                                    if (err) console.log(err);
                                    db.collection("fingermap").remove({});
                                    var empdata = {
                                        "empno": xxempno,
                                        "fullname": xxname,
                                        "position": xxposition,
                                        "dept": xxdept
                                    };
                                    db.collection("fingermap").insert(empdata, function (err, result) {
                                        db.close();
                                        if (err) console.log("cannot insert");
                                    });
                                });

                            });
                        } else {
                            MongoClient.connect(dbUrl, function (err, db) {
                                if (err) console.log(err);
                                db.collection("fingermap").remove({}, function (err, result) {
                                    db.close();
                                });
                            });
                            xxempno = "";
                            // txtmsg ="This card not found data";
                        }

                    });
                });
            }
        }

    });
});

function serialWrite(message) {
    serialport.write(message);
    //console.log(message);
}

function closeSerialport() {
    serialport.on('close', function () {
        console.log("serail close");
    });
}

function clearData() {

    // setInterval(function(){
    xxempno = "";
    //},60000);
}

//clearData();
io.on('connection', function (socket) {

    // socket.emit('empdetail', { empno: xxempno,empname: xxname , emppos: xxposition , empdept: xxdept ,txt: xxcount ,scancard: isScan });
    setInterval(function () {
        socket.emit('message', {
            empno: xxempno,
            empname: xxname,
            emppos: xxposition,
            empdept: xxdept,
            txt: xxcount,
            scancard: isScan,
            fingerdata: fingerfound
        });
        //  socket.emit('message', { empno: xxempno, empname: xxname, emppos: xxposition, empdept: xxdept, txt: xxcount, scancard: isScan,fingerdata: fingerfound });

    }, 1000);
    socket.on("res", function (data) {
        if (data.resp == "1") {
            isScan = false;
        }
    });
    socket.on("exitapp", function (data) {
        clearData();
        serialport.write("rfid");

        console.log("EXIT APP");
    });
    socket.on("fingerscan", function (data) {

        clearData();
        serialWrite("finger");
    });
    socket.on("changemode", function (data) {
        fingerfound = "";
        // serialWrite("rfid");
        serialport.write("rfid");
        //console.log(data.mode);
    });
    socket.on("codesuccess", function (data) {
        clearData();
    });
});


// app.get('/getcurrent',function(req,res){
//     MongoClient.connect(dbUrl,function(err,db){
//         if(err)console.log(err);
//         db.collection("fingermap").find(req.query).toArray(function(err,result){
//           if(err)console.log(err);
//           res.send(result);
//         });

//     });
// });
