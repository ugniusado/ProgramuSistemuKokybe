sap.ui.define([
    
    "sap/m/Button",
    "sap/m/MessageToast"
], function (Button, MessageToast) {
    "use strict";

    new Button({
        text: "Rodyti rezervacijas",
        press: function () {
            document.getElementById('content').innerHTML += '<table class="table table-dark"><tr><th>ID</th><th>Vardas</th><th>Pavardė</th><th>Data</th><th>Laikas</th></tr></table>';
            fetch('http://localhost:3000/getreservations')
                .then(function (response) {
                    return response.json();
                })
                .then(function (json) {
                    var tr;
                    for (var i = 0; i < json.length; i++) {
                        tr = $('<tr/>');
                        tr.append("<td>" + json[i].ID + "</td>");
                        tr.append("<td>" + json[i].FirstName + "</td>");
                        tr.append("<td>" + json[i].LastName + "</td>");
                        tr.append("<td>" + json[i].DatePreview + "</td>");
                        tr.append("<td>" + json[i].Time + "</td>");
                        $('table').append(tr);
                    }
                });
        }
    }).placeAt("content");


    new Button({
        text: "Rezervuoti laiką",
        press: function () {
            sap.ui.define(["sap/m/Label", "sap/m/Input", "sap/m/TimePicker"], function (Label, Input, TimePicker) {
                "use strict";

                new Label({
                    text: "Prašome užpildyti visus langelius ir pasirinkti datą",
                    textAlign: "Center",
                    width: "100%",
                }).placeAt("content");

                new Input({
                    placeholder: "Vardas",
                    required: true,
                    name: "firstName",
                    width: "50%",
                }).placeAt("content");

                new sap.m.TimePicker({
                    placeholder: "Pasirinkite vizito laiką",
                    minutesStep: 30,
                    name: "time",
                    displayFormat: "HH:00",
                    width: "50%",
                }).placeAt('content');

                new Input({
                    placeholder: "Pavardė",
                    required: true,
                    name: "lastName",
                    width: "50%",
                }).placeAt("content");
            });
            sap.ui.define(['sap/ui/core/mvc/Controller', 'sap/ui/unified/DateRange'],
                function (Controller, DateRange) {
                    "use strict";
                    new sap.ui.unified.Calendar({
                        width: "50%",
                        name: "calendar",
                        required: true,
                    }).placeAt('content'); // Constructing the calendar object
                });
            new Button({
                text: "Rezervuoti",
                press: function () {

                    // Getting the date of reservation
                    var today = new Date();
                    var dd = String(today.getDate()).padStart(2, '0');
                    var mm = String(today.getMonth() + 1).padStart(2, '0');
                    var yyyy = today.getFullYear();
                    today = yyyy + mm + dd;


                    // Getting the inputs

                    var firstName = document.getElementById("__input0-inner").value;
                    var lastName = document.getElementById("__input1-inner").value;
                    var time = document.getElementById("__picker0-inner").value;
                    var CalendarSelection = document.getElementsByClassName("sapUiCalItemSel");
                    var date = CalendarSelection[0].getAttribute('data-sap-day');
                    var datepreview = CalendarSelection[0].getAttribute('aria-label');

                    // Sending the POST request to the server
                    var req = new XMLHttpRequest();
                    req.open("POST", "http://localhost:3000/postreq", true);
                    req.setRequestHeader('Content-Type', 'application/json');
                    req.send(JSON.stringify({
                        FirstName: firstName,
                        LastName: lastName,
                        Date: date,
                        Time: time,
                        DateOfRes: today,
                        DatePreview: datepreview
                    }));
                    req.onreadystatechange = function () {
                        if (req.readyState == 4) {
                            if (req.status == 200) {
                                var res = req.responseText;
                                sap.ui.define([
                                    "sap/m/MessageToast"
                                ], function (MessageToast) {
                                    "use strict";
                                    MessageToast.show(res);
                                });
                            }
                        }
                    };
                }
            }).placeAt("content");

        }
    }).placeAt("content");
});

$('document').ready(function () {
    document.getElementById("__button0").addEventListener("click", hide);
    document.getElementById("__button1").addEventListener("click", hide);

    function hide() {
        setTimeout(function () {
            document.getElementById("__button0").classList.add("hide");
            document.getElementById("__button1").classList.add("hide");
        }, 50);
    }
});
