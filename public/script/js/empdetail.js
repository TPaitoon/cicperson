let date = new Date()
$(".toyear").text(date.getFullYear())

$("#evt").click(() => {
    let d = new Date()
    let n = d.getFullYear()
    $(".leave_year").html(n)

    $.ajax({
        url: 'http://localhost:8001/evt',
        type: 'get',
        dataType: 'json',
        data: {
            empno: $("#empnoo").text()
        },
        success: (data) => {
            if (data.length > 0) {
                $("#tableevent tbody>tr").remove()
                for (let i = 0; i <= data.length - 1; i++) {
                    $("#tableevent tbody").append('<tr class="txtdata2">' +
                        '<td>' + data[i].eventname + '</td>' +
                        '<td>' + data[i].amt + '</td>' +
                        '</tr>')
                }
            } else {
                alert("ไม่พบข้อมูล")
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
            empno: $("#empnoo").text()
        },
        success: (data) => {
            if (data.length > 0) {
                $("#tableholiday tbody>tr").remove()
                for (let i = 0; i <= data.length - 1; i++) {
                    let sum_total = data[i].holiday_amt - data[i].amt
                    for (let m = 0; m <= 3; m++) {
                        if (m == 0) {
                            $("#tableholiday tbody").append('<tr class="txtdata2">' +
                                '<td>' + 'จำนวนพักร้อนที่ได้ตามอายุงาน' +
                                '</td>' +
                                '<td>' + data[i].holiday_amt + '</td>' +
                                '</tr>')
                        } else if (m == 1) {
                            $("#tableholiday tbody").append('<tr class="txtdata2">' +
                                '<td>' + 'ลาพักร้อนแล้ว' + '</td>' +
                                '<td>' + data[i].amt + '</td>' +
                                '</tr>')
                        } else if (m == 2) {
                            $("#tableholiday tbody").append('<tr class="txtdata2">' +
                                '<td>' + 'จำนวนพักร้อนที่เหลือ' + '</td>' +
                                '<td><h3 style="color: red"><u>' + sum_total +
                                '</u></h3></td>' +
                                '</tr>')
                        }
                    }
                }
            } else {
                //alert("ไม่สามารถลาพักร้อนได้เนื่องจากอายุงานยังไม่ถึง 3 ปี")
                $("#tableholiday tbody>tr").remove()
                $("#tableholiday tbody").append('<tr class="txtdata2">' +
                    '<td>' + 'อายุงานไม่ถึง 3 ปี' + '</td>' +
                    '<td><h3 style="color: red"><u>' + 0 +
                    '</u></h3></td>' +
                    '</tr>')
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
                    let a = 0
                    let b = 0
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
                    if (data[i].from < 12 && (empmonth > data[i].from && empmonth <=
                            data[i].to)) {
                        $("#tablebenefits tbody").append(
                            '<tr style="background: green;color: #FFFFFF;"class="txtdata2">' +
                            '<td>' + data[i].step + '</td>' +
                            '<td>' + a + '</td>' +
                            '<td>' + b + '</td>' +
                            '<td>' + data[i].amt + '</td>' +
                            '<td>' + data[i].perweek + '</td>' +
                            '<td>' + data[i].amt2 + '</td>' +
                            '<td>' + data[i].perweek2 + '</td>' +
                            '</tr>')
                    } else if (data[i].from >= 12 && (empyear > data[i].from / 12 &&
                            empyear <= data[i].to / 12)) {
                        $("#tablebenefits tbody").append(
                            '<tr style="background: green;color: #FFFFFF;" class="txtdata2">' +
                            '<td>' + data[i].step + '</td>' +
                            '<td>' + a + '</td>' +
                            '<td>' + b + '</td>' +
                            '<td>' + data[i].amt + '</td>' +
                            '<td>' + data[i].perweek + '</td>' +
                            '<td>' + data[i].amt2 + '</td>' +
                            '<td>' + data[i].perweek2 + '</td>' +
                            '</tr>')
                    } else if ((data[i].from / 12) > 15) {
                        $("#tablebenefits tbody").append(
                            '<tr style="background: green;color: #FFFFFF;" class="txtdata2">' +
                            '<td>' + data[i].step + '</td>' +
                            '<td>' + a + '</td>' +
                            '<td>' + b + '</td>' +
                            '<td>' + data[i].amt + '</td>' +
                            '<td>' + data[i].perweek + '</td>' +
                            '<td>' + data[i].amt2 + '</td>' +
                            '<td>' + data[i].perweek2 + '</td>' +
                            '</tr>')
                    } else {
                        $("#tablebenefits tbody").append('<tr class="txtdata2">' +
                            '<td>' + data[i].step + '</td>' +
                            '<td>' + a + '</td>' +
                            '<td>' + b + '</td>' +
                            '<td>' + data[i].amt + '</td>' +
                            '<td>' + data[i].perweek + '</td>' +
                            '<td>' + data[i].amt2 + '</td>' +
                            '<td>' + data[i].perweek2 + '</td>' +
                            '</tr>')
                    }
                }
            } else {
                alert("ไม่พบข้อมูล")
            }
        },
        /*error: (data) => {
            alert()
        }*/
    })
})

$("#train").click(() => {
    $.ajax({
        url: 'http://localhost:8001/train',
        type: 'get',
        dataType: 'json',
        data: {
            empno: $("#empnoo").text()
        },
        success: (data) => {
            if (data.length > 0) {
                $("#tabletrain tbody>tr").remove()
                for (let i = 0; i <= data.length - 1; i++) {
                    $("#tabletrain tbody").append('<tr class="txtdata2">' +
                        '<td>' + data[i].cid + '</td>' +
                        '<td>' + data[i].cname + '</td>' +
                        '</tr>')
                }
            } else {
                //alert("ไม่มีประวัติการฝึกอบรม ...")
                $("#tabletrain tbody>tr").remove()
                $("#tabletrain tbody").append('<tr class="txtdata2">' +
                    '<td>' + "CO000000" + '</td>' +
                    '<td>' + 'ไม่พบประวัติการฝึกอบรม' + '</td>' +
                    '</tr>')
            }
        },
        error: (data) => {
            alert()
        }
    })
})