$(document).ready(() => {
    $("#passwordinclude").load('../../views/password.html')
    $("#employeeinclude").load('../../views/employee.html')
})

const socket = io.connect('http://localhost:8001')
socket.on('message', (data) => {
    $("#empno").html(data.empno)
    $("#empname").html(data.empname)
    $("#empdept").html(data.empdept)
    $("#emppos").html(data.emppos)
    $("#emp_photo").attr('src', 'http://172.16.0.201:86/' + data.empno + '.jpg')
    if (data.empno != "") {
        $("#empinfo").fadeIn(1000)
        $("#welcome").hide()
        $("#empdetail").hide()
    } else {
        $("#empinfo").hide()
    }
    socket.emit('res', {
        resp: "1"
    })
})

$(() => {
    const isexit = false
    const currempno = ""
    const empyear = ""
    const empmonth = ""

    $("#empdetail").hide()
    $("#exit").click(() => {
        socket.emit('exitapp', {
            isexit: true
        })
        $("#welcome").show()
        $("#empinfo").hide()
    })
    $("#closeapp").click(() => {
        socket.emit('exitapp', {
            isexit: true
        })
        $("#welcome").show()
        $("#empinfo").hide()
        $("#finger-modal").modal("hide")
        $("#empdetail").hide()
    })
    $("#showdetail").click(() => {
        currempno = $("#empno").html()
        $("#tabletrain tbody>tr").remove()
        $("#tablebenefits tbody>tr").remove()
        $("#alerterror").hide()
    })
    $(".txtclear").click(() => {
        $(".passwordkey").val("")
    })

    /* Evet Key Bindings */
    $("#7").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#8").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#9").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#4").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#5").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#6").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#1").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#2").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#3").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#0").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $(this).attr("id"))
    })
    $("#ok").click(() => {
        let keys = $(".passwordkey").val()
        $(".passwordkey").val("")
    })

    $.ajax({
        url: 'http://localhost:8001/verifycode',
        type: 'get',
        dataType: 'json',
        data: {
            empno: currempno,
            pwd: keys
        },
        success: (data) => {
            if (data.length > 0) {
                socket.emit('codesuccess', {})

                $("#empinfo").hide();
                $("#empdetail").fadeIn(3000);
                $("#finger-modal").modal("hide")
                $("#fullname").html(data[0].fullname)
                $("#empstatus").html(data[0].empstatus == 1 ? 'พนักงาน' : 'ออก')
                $("#dept").html(data[0].empdept)
                $("#sec").html(data[0].empsec)
                $("#pos").html(data[0].emppos)
                $("#stdate").html(data[0].empdate)

                empyear = data[0].workyear
                empmonth = data[0].workmonth
                $("#workyear").html(data[0].workyear + " ปี " + (data[0].workmonth % 12) + " เดือน")
                $("#hot").html('โรงพยาบาล' + data[0].emphot)
                $("#emptype").html(data[0].emptype)
            } else {
                setTimeout(() => {
                    $("#alerterror").show()
                }, 500)
            }
        },
        error: (data) => {
            alert()
        }
    })

    $("#train").click(() => {
        $.ajax({
            url: 'http://localhost:8001/train',
            type: 'get',
            dataType: 'json',
            data: {
                empno: currempno
            },
            success: (data) => {
                if (data.length > 0) {
                    $("#tabletrain tbody>tr").remove()
                    for (let i = 0; i <= data.length - 1; i++) {
                        $("#tabletrain tbody").append('<tr class="txtdata2"><td>' + data[i].cid + '</td><td>' + data[i].cname + '</td></tr>')
                    }
                } else {
                    alert("ไม่มีประวัติการฝึกอบรม ...")
                }
            },
            error: (data) => {
                alert()
            }
        });
    });

    $("#evt").click(() => {
        var d = new Date()
        var n = d.getFullYear()
        $(".leave_year").html(n)
        $.ajax({
            url: 'http://localhost:8001/evt',
            type: 'get',
            dataType: 'json',
            data: {
                empno: currempno
            },
            success: (data) => {
                if (data.length > 0) {
                    $("#tableevent tbody>tr").remove()
                    for (let i = 0; i <= data.length - 1; i++) {
                        $("#tableevent tbody").append('<tr class="txtdata2"><td>' + data[i].eventname + '</td><td>' + data[i].amt + '</td></tr>')
                    }

                } else {
                    alert("ไม่พบข้อมูล (evt)")
                }
            },
            error: (data) => {
                alert()
            }
        })
    })

    $("#hol").click(() => {
        $.ajax({
            url: 'http://localhost:8001/holiday',
            type: 'get',
            dataType: 'json',
            data: {
                empno: currempno
            },
            success: (data) => {
                if (data.length > 0) {
                    $("#tableholiday tbody>tr").remove()
                    for (let i = 0; i <= data.length - 1; i++) {
                        var sum_total = data[i].holiday_amt - data[i].amt
                        for (let m = 0; m <= 3; m++) {
                            if (m == 0) {
                                $("#tableholiday tbody").append('<tr class="txtdata2"><td>' + 'จำนวนพักร้อนที่ได้ตามอายุงาน' + '</td><td>' + data[i].holiday_amt + '</td></tr>')
                            } else if (m == 1) {
                                $("#tableholiday tbody").append('<tr class="txtdata2"><td>' + 'ลาพักร้อนแล้ว' + '</td><td>' + data[i].amt + '</td></tr>')
                            } else if (m == 2) {
                                $("#tableholiday tbody").append('<tr class="txtdata2"><td>' + 'จำนวนพักร้อนที่เหลือ' + '</td><td><h3 style="color: red"><u>' + sum_total + '</u></h3></td></tr>')
                            }
                        }
                    }

                } else {
                    alert("ไม่สามารถลาพักร้อนได้เนื่องจากอายุงานยังไม่ถึง 3 ปี")
                }
            },
            error: (data) => {
                alert()
            }
        })
    })

    $("#benefit").click(() => {
        $("#tablebenefits tbody>tr").remove()
        $.ajax({
            url: 'http://localhost:8001/benefit',
            type: 'get',
            dataType: 'json',
            data: {
                id: 1
            },
            success: (data) => {
                if (data.length > 0) {
                    $("#tablebenefits tbody>tr").remove()
                    for (let i = 0; i <= data.length - 1; i++) {
                        var a = 0;
                        var b = 0;
                        if (data[i].from < 12) {
                            a = data[i].from + " เดือน"
                        } else {
                            a = data[i].from / 12 + " ปี"
                        }
                        if (data[i].to < 12) {
                            b = data[i].to + " เดือน"
                        } else {
                            b = data[i].to / 12 + " ปี"
                        }
                        if (i == data.length - 1) {
                            a = a + "ขึ้นไป"
                            b = ""
                        }
                        if (data[i].from < 12 && (empmonth > data[i].from && empmonth <= data[i].to)) {
                            $("#tablebenefits tbody").append('<tr style="background: green;color: #FFFFFF;" class="txtdata2"><td>' + data[i].step + '</td><td>' + a + '</td><td>' + b + '</td><td>' + data[i].amt + '</td><td>' + data[i].perweek + '</td><td>' + data[i].amt2 + '</td><td>' + data[i].perweek2 + '</td></tr>')
                        } else if (data[i].from >= 12 && (empyear > data[i].from / 12 && empyear <= data[i].to / 12)) {
                            $("#tablebenefits tbody").append('<tr style="background: green;color: #FFFFFF;" class="txtdata2"><td>' + data[i].step + '</td><td>' + a + '</td><td>' + b + '</td><td>' + data[i].amt + '</td><td>' + data[i].perweek + '</td><td>' + data[i].amt2 + '</td><td>' + data[i].perweek2 + '</td></tr>')
                        } else if ((data[i].from / 12) > 15) {
                            $("#tablebenefits tbody").append('<tr style="background: green;color: #FFFFFF;" class="txtdata2"><td>' + data[i].step + '</td><td>' + a + '</td><td>' + b + '</td><td>' + data[i].amt + '</td><td>' + data[i].perweek + '</td><td>' + data[i].amt2 + '</td><td>' + data[i].perweek2 + '</td></tr>')
                        } else {
                            $("#tablebenefits tbody").append('<tr class="txtdata2"><td>' + data[i].step + '</td><td>' + a + '</td><td>' + b + '</td><td>' + data[i].amt + '</td><td>' + data[i].perweek + '</td><td>' + data[i].amt2 + '</td><td>' + data[i].perweek2 + '</td></tr>')
                        }
                    }
                } else {
                    alert("ไม่พบข้อมูล")
                }
            },
            error: (data) => {
                alert()
            }
        });
    });
})