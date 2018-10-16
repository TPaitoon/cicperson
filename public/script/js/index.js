$("#empdetailinclude").load('/views/empdetail.html')
$("#empinfoinclude").load('/views/empinfo.html')

let socket = io.connect('http://localhost:8001')
/* var status = 0 */
socket.on('message', (data) => {
    /*if (status == 0) {
        console.table(data)
        status = 1
    }*/
    $("#empno").html(data.empno)
    $("#empname").html(data.empname)
    $("#empdept").html(data.empdept)
    $("#emppos").html(data.emppos)
    if (data.empno !== "") {
        /* if (status == 1) {
            console.table(data)
            status = 2
        } */
        //$("#emp_photo").attr('src', 'http://172.16.0.201:86/' + data.empno + '.jpg')
        $("#emp_photo").attr('src', '')
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
    let isexit = false
    var currempno = ""
    let empyear = ""
    let empmonth = ""
    //let keys = ""
    $("#empdetail").hide()

    // Evet Key Bindings
    $("#7").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#7").attr("id"))
    })
    $("#8").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#8").attr("id"))
    })
    $("#9").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#9").attr("id"))
    })
    $("#4").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#4").attr("id"))
    })
    $("#5").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#5").attr("id"))
    })
    $("#6").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#6").attr("id"))
    })
    $("#1").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#1").attr("id"))
    })
    $("#2").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#2").attr("id"))
    })
    $("#3").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#3").attr("id"))
    })
    $("#0").click(() => {
        $(".passwordkey").val($(".passwordkey").val() + $("#0").attr("id"))
    })
    $("#ok").click(() => {
        keys = $(".passwordkey").val()
        currempno = $("#empno").html()
        $(".passwordkey").val("")
        //alert(keys)
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
                    /* console.table(data) */
                    $("#empinfo").hide();
                    $("#empdetail").fadeIn(3000);
                    $("#finger-modal").modal("hide")
                    $("#fullname").html(data[0].fullname)
                    $("#empstatus").html(data[0].empstatus === 1 ? 'พนักงาน' : 'ออก')
                    $("#dept").html(data[0].empdept)
                    $("#sec").html(data[0].empsec)
                    $("#pos").html(data[0].emppos)
                    $("#empnoo").html($("#empno").html())
                    $("#stdate").html(data[0].empdate)
                    empyear = data[0].workyear
                    empmonth = data[0].workmonth
                    $("#workyear").html(data[0].workyear + " ปี " + (data[0].workmonth %
                        12) + " เดือน")
                    $("#hot").html('รพ. ' + data[0].emphot)
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
    })

    $(".txtclear").click(() => {
        $(".passwordkey").val("")
    })
})