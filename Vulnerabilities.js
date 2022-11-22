var userInputObj = {};
let expectedGraphObj = []; 
let realGraphObj = [];
// Could be binded to something later
let currencySymbol = "€";

window.onload = function () {
    // Initialize elements
    initializeElements();
    
    // Login navigation logic
    document.querySelectorAll("#loginNextBtn,#numberIcon2").forEach(element => {
        element.addEventListener("click", () => {
            if (formIsValid(1)) {
                navigateToStep(2);
            }
        });
    });

    document.querySelectorAll("#loginBackBtn,#numberIcon1").forEach(element => {
        element.addEventListener("click", () => {
            navigateToStep(1);
        });
    });

    document.querySelector("#loginCompleteBtn").addEventListener("click", () => {
        if (formIsValid(2)) {
            userInputObj["investmentData"] = [];
            userInputObj["investmentData"].push({});
            document.querySelectorAll("form").forEach(element => {
                for (var [key, value] of new FormData(element).entries()) { 
                    if (element.id == "investmentForms") {
                        let investmentNumber = [key].toString()[key.length - 1] - 1;
                        if (!userInputObj["investmentData"][investmentNumber]) {
                            userInputObj["investmentData"].push({});
                        }
                        userInputObj["investmentData"][investmentNumber][key.toString().substring(0, key.length - 1)] = value;
                        if (key.toString().substring(0, key.length - 1) == "investmentInstrument") {
                            // Set ticker
                            userInputObj["investmentData"][investmentNumber]["ticker"] = value.split("] ")[1].split(" - ")[0];
                        }
                    } else {
                        userInputObj[key] = value;
                    }
                }
            });
            console.log(userInputObj);
            // Navigate to main page
            navigateToStep(0);
        }
    });
};

addInvestment = () => {
    let newForm = document.querySelector("#investmentForm0").cloneNode(true);
    let newNum = document.querySelectorAll(".singleInvestment").length;

    newForm.setAttribute("id", "investmentForm" + newNum);
    newForm.classList.remove("displayNone");

    let inputNames = ["investmentStartDate", "investmentPrincipal", "investmentAmount", "investmentInstrument"];

    // Set attributes for each input
    inputNames.forEach(name => {
        newForm.querySelector(`input[name="${name}"]`).setAttribute("id", `${name}` + newNum);
        newForm.querySelector(`input[name="${name}"]`).classList.add("validate");
        newForm.querySelector(`input[name="${name}"]`).setAttribute("name", `${name}` + newNum);
    });

    newForm.querySelector('.searchForInvestmentsBtn').setAttribute('id', 'searchForInvestments' + newNum);

    newForm.querySelector('select[name="investmentPeriod"]').setAttribute('id', 'investmentPeriod' + newNum);
    newForm.querySelector('select[name="investmentPeriod"]').classList.add("selectToInit");
    newForm.querySelector('select[name="investmentPeriod"]').setAttribute('name', 'investmentPeriod' + newNum);


    newForm.querySelector('.investmentHR').classList.remove("displayNone");

    document.querySelector("#investmentForms").append(newForm);
    initializeElements();
};

navigateToStep = (stepNum) => {
    switch (stepNum) {
        case 0:
            // Start getting data
            getAllData();
            document.querySelector("#loginModel").classList.add("displayNone");
            document.querySelector("#mainModel").classList.remove("displayNone");
            document.querySelector("#welcomeTitle").innerHTML = "Welcome, " + userInputObj.first_name + ".";
            break;
        case 1:
            document.querySelector("#step2").classList.add("displayNone");
            document.querySelector("#numberIcon2").classList.remove("active");
            document.querySelector("#step1").classList.remove("displayNone");
            document.querySelector("#numberIcon1").classList.add("active");
            break;
        case 2:
            document.querySelector("#step1").classList.add("displayNone");
            document.querySelector("#numberIcon1").classList.remove("active");
            document.querySelector("#step2").classList.remove("displayNone");
            document.querySelector("#numberIcon2").classList.add("active");
            break;
    }
};

formIsValid = (stepNum) => {
    let inputsForValidation = document.querySelectorAll("#step" + stepNum + " .validate");
    let isValid = true;

    inputsForValidation.forEach(element => {
        if (element.classList.contains("invalid") || element.value == "") {
            isValid = false;
            element.classList.add("invalid");
        }
        if (element.classList.contains("autocomplete")) {
            if (!element.getAttribute("autocompleted")) {
                isValid = false;
                element.classList.add("invalid");
            }
        }
    });

    return isValid;
};

getAllData = () => {
    // Get graph data..
    getHistoricalData(() => {
        // Get expected graph data
        getExpectedGraphData(() => {
            // When done, render pie chart
            createPieChart();

            // When done, render the graph
            createGraph();

            // Get advanced metrics
            getAdvancedMetrics();
        });
    });

    // Calculate and bind simple metrics
    getSimpleMetrics();

}

getSimpleMetrics = () => {
    userInputObj.metrics = {};
    // Sums
    userInputObj.metrics.totalEarnings = userInputObj.timeFrame * userInputObj.yearlyEarnings;
    userInputObj.metrics.totalExpenses = userInputObj.timeFrame * userInputObj.yearlyExpenses;

    let sumOfInvestments = 0;
    let sumOfPrincipals = 0;
    for (let i = 0; i < userInputObj.investmentData.length; i++) {
        if (userInputObj.investmentData[i].investmentPeriod == "monthly") {
            sumOfInvestments += Number(userInputObj.investmentData[i].investmentAmount * 12);
        } else {
            sumOfInvestments += Number(userInputObj.investmentData[i].investmentAmount);
        }
        sumOfPrincipals += Number(userInputObj.investmentData[i].investmentPrincipal);
    }
    userInputObj.metrics.yearlyInvestments = sumOfInvestments;
    userInputObj.metrics.totalInvestments = (sumOfInvestments * userInputObj.timeFrame) + sumOfPrincipals;

    userInputObj.metrics.yearlyLeftover = Number(userInputObj.yearlyEarnings) - Number(userInputObj.yearlyExpenses) - Number(userInputObj.metrics.yearlyInvestments);
    userInputObj.metrics.totalLeftover = Number(userInputObj.timeFrame) * userInputObj.metrics.yearlyLeftover;

    userInputObj.metrics.ageAtTimeframe = Number(userInputObj.age) + Number(userInputObj.timeFrame);

    // Savings rate
    userInputObj.metrics.savingsRate = Math.round(((userInputObj.yearlyEarnings - userInputObj.yearlyExpenses) / userInputObj.yearlyEarnings) * 100 * 100) / 100;

    // Binding
    bindMetrics();
};

getAdvancedMetrics = () => {
    let interestSum = 0;
    userInputObj.investmentData.forEach(element => {
        interestSum += element.interestPercentage;
    });
    userInputObj.metrics.avgYearlyReturns = Math.round((interestSum / userInputObj.investmentData.length) * 100 * 100) / 100; // Redo to weighted average
    
    let riskSum = 0;
    let baseRiskLevel = 0;
    userInputObj.investmentData.forEach(element => {
        riskSum += element.riskLevel;
        if (element.investmentType == "Common Stock") {
            baseRiskLevel += 4;
        } else if (element.investmentType == "Digital Currency") {
            baseRiskLevel += 6;
        } else if (element.investmentType == "ETF") {
            baseRiskLevel += 2;
        } else {
            baseRiskLevel += 1;
        }
    });
    let initialRiskLevel = Math.round((riskSum / userInputObj.investmentData.length) * 100) / 100; // Redo to weighted average
    let initialBaseRiskLevel = Math.round(baseRiskLevel / userInputObj.investmentData.length); // Redo to weighted average

    let finalRiskRating = Math.round((((Math.sqrt(initialRiskLevel) / Math.sqrt(17500)) * 100) + initialBaseRiskLevel) * 100) / 100;

    userInputObj.metrics.portfolioRiskLevel = (finalRiskRating > 10 ? 10 : finalRiskRating) + " / 10";
    let finalExpectedSum = 0;
    userInputObj.investmentData.forEach(element => {
        finalExpectedSum += element.finalExpectedValue[1];
    });
    userInputObj.metrics.expectedFinalValue = Math.round(finalExpectedSum * 100) / 100; 

    let currentSum = 0;
    userInputObj.investmentData.forEach(element => {
        currentSum += element.currentValue;
    });
    userInputObj.metrics.currentPortfolioValue = Math.round((currentSum) * 100) / 100;
    
    // Binding
    bindMetrics();
};

bindMetrics = () => {
    let mainModel = document.querySelector("#mainModel");
    for (let key in userInputObj) {
        if (mainModel.querySelector("#" + key)) {
            mainModel.querySelector("#" + key).innerText = userInputObj[key] > 500 ? Number(userInputObj[key]).toLocaleString() : userInputObj[key];
        }
    }

    for (let key in userInputObj.metrics) {
        if (mainModel.querySelector("#" + key)) {
            mainModel.querySelector("#" + key).innerText = userInputObj.metrics[key] > 500 ? Number(userInputObj.metrics[key]).toLocaleString() : userInputObj.metrics[key];
        }
    }
};

getExpectedGraphData = (callback) => {
    // Get expected graph data
    let expectedGraphs = [];

    // Normalize start dates
    normalizeInvestmentStartDates();

    for (let i = 0; i < userInputObj.investmentData.length; i++) {
        let investmentLeftTimeFrameInMonths = (Number(userInputObj.timeFrame) * 12) + monthDiff(new Date(userInputObj.investmentData[i].investmentStartDate), new Date());
        expectedGraphs.push(calcFinalValue(
            Number(userInputObj.investmentData[i].investmentPrincipal), 
            new Date(userInputObj.investmentData[i].investmentStartDate),
            Number(investmentLeftTimeFrameInMonths / 12),
            userInputObj.investmentData[i].interestPercentage,
            12,
            Number(userInputObj.investmentData[i].investmentAmount),
            userInputObj.investmentData[i].investmentPeriod == "monthly" ? 1 : 12
        ));
    }

    let expectedForDisplay = expectedGraphs;
    console.log(expectedForDisplay);

    compileFinalPortfolioGraph(expectedGraphs, false, (expectedGraphData) => {
        expectedGraphObj = expectedGraphData
        callback();
    });
};

createGraph = () => {
    var seriesOptions = [],
        seriesCounter = 0,
        names = ['tckr', "real"];

    function createChart() {
        displayStockChart(seriesOptions);
    }

    function success(expected, real) {
        seriesOptions[0] = {
            name: "Expected",
            data: expected
        };
        seriesOptions[1] = {
            name: "Real",
            data: real
        };
        console.log("creating graph", expected.length, real.length);
        createChart();
    }
    success(expectedGraphObj, realGraphObj);
};

initializeElements = () => {
    let elems = document.querySelectorAll('select.selectToInit');
    M.FormSelect.init(elems, {});

    setHighChartsTheme();

    var datepickerElems = document.querySelectorAll('.datepicker');
	M.Datepicker.init(datepickerElems, {
		autoClose: "true",
		format: 'yyyy-mm-dd',
		firstDay: 1,
        defaultDate: new Date(),
        setDefaultDate: true
	});

	let autocompleteElems = document.querySelectorAll(".autocomplete");
    let autocompleteSearchBtns = document.querySelectorAll(".searchForInvestmentsBtn");

	let autocompleteInstances = M.Autocomplete.init(autocompleteElems, {
		data: {},
		minLength: 1,
		limit: 10,
        onAutocomplete: function() {
            this.el.setAttribute("autocompleted", "true");
        },
	});

    autocompleteSearchBtns.forEach(element => {
        element.addEventListener("click", function () {
            let instanceIndex = this.id.split("searchForInvestments")[1];
			getDataForSuggestions(autocompleteInstances[instanceIndex], document.querySelector("#investmentInstrument" + instanceIndex).value);
        });
    });

    document.querySelector("#searchForInvestments").addEventListener("click", () => {
        getDataForSuggestions(autocompleteInstances[0], document.querySelector("#investmentInstrument").value);
    });

    // Bind selected currency
    bindCurrency(currencySymbol);
};

getDataForSuggestions = (selectElement, value) => {
    fetch("http://localhost:5500/getTickers?" + new URLSearchParams({
        term: value
    }), {
        method: 'GET',
        credentials: 'same-origin'
    })
    .then(response => response.json())
    .then(data => {
        // Converting API response to materialize autocomplete's required data object
        let dataObject = {};
        data.data.forEach(element => {
            if (element.instrument_type) {
                let key = `[${element.instrument_type}] ${element.symbol} - ${element.instrument_name}`
                dataObject[key] = null;
            }
        });

        console.log(dataObject);
        selectElement.updateData(dataObject);
    });
};

getHistoricalData = (callback) => {
    let iterationNum = 0;
    let realGraphs = [];

    userInputObj.investmentData.forEach(element => {
        fetch("http://localhost:5500/getHistoricalData?" + new URLSearchParams({
            term: element.ticker, dataObject: JSON.stringify(element)
        }), {
            method: 'GET',
            credentials: 'same-origin'
        })
        .then(response => response.json())
        .then(data => {
            console.log(data);
            realGraphs.push(data.values);

            for (let i = 0; i < userInputObj.investmentData.length; i++) {
                if (data.meta.symbol == userInputObj.investmentData[i].ticker) {
                    // Set calculated interestPercentage, risk level, and currentValue
                    userInputObj.investmentData[i].interestPercentage = data.avgYearlyReturns;
                    userInputObj.investmentData[i].riskLevel = data.riskLevel;
                    userInputObj.investmentData[i].investmentType = data.meta.type;
                    userInputObj.investmentData[i].currentValue = data.values[data.values.length - 1][1];
                }
            }

            iterationNum++;
            if (iterationNum == userInputObj.investmentData.length) {
                compileFinalPortfolioGraph(realGraphs, true, (realGraphData) => {
                    realGraphObj = realGraphData;
                    callback();
                });
            }
        });
    });
};

normalizeInvestmentStartDates = () => {
    userInputObj.investmentData.forEach(element => {
        let dateFragments = element.investmentStartDate.split("-");
        dateFragments[2] = "01";
        element.investmentStartDate = dateFragments.join("-");
    });
};

calcFinalValue = (principalInvestment, initialDate, time, interest, n, deposit, depositN) => {
    let finalValue = principalInvestment;
    let graphObject = [];
    for (let i = 0; i < time * n; i++) {
        if (i % depositN == 0) {
            finalValue = (finalValue * (1 + (interest / n))) + deposit;
        } else {
            finalValue = (finalValue * (1 + (interest / n)));
        }
        graphObject.push([
            getFormattedTimestamp(initialDate, i),
            Number(finalValue)
        ]);
    }
    // return Math.round(100 * finalValue) / 100;
    return graphObject;
};

compileFinalPortfolioGraph = (graphs, isReal, callback) => {
    // Find the earliest investment 
    let earliestInvestmentLength = 0;
    let earliestInvestmentIndex = 0;
    for (let i = 0; i < graphs.length; i++) {
        if (graphs[i].length > earliestInvestmentLength) {
            earliestInvestmentLength = graphs[i].length;
            earliestInvestmentIndex = i;
        }
    };

    // Set investmentData
    for (let i = 0; i < graphs.length; i++) {
        if (isReal) {
            userInputObj.investmentData[i].finalRealValue = graphs[i][graphs[i].length - 1];
        } else {
            userInputObj.investmentData[i].finalExpectedValue = graphs[i][graphs[i].length - 1];
        }
    }
    
    // Take earliest and copy to final
    let finalGraph = graphs[earliestInvestmentIndex];
    // Cut earliest from pool
    graphs.splice(earliestInvestmentIndex, 1);

    // Merge graph objects
    // For every investment left
    for (let i = 0; i < graphs.length; i++) {
        // For every point in final obj
        for (let j = 0, x = 0; j < finalGraph.length; j++, x++) {
            // If same timestamp
            if (graphs[i][x][0] == finalGraph[j][0]) {
                // Add to this months final value
                finalGraph[j][1] += graphs[i][x][1];
            } else {
                x = -1;
            }
        }
    }
    callback(finalGraph);
    // return finalGraph;
};

getFormattedTimestamp = (date, count) => {
    if (date && count) {
      let currentMonth, currentDate = (date = new Date(+date)).getDate()
  
      date.setMonth(date.getMonth() + count, 1)
      currentMonth = date.getMonth()
      date.setDate(currentDate)
      if (date.getMonth() !== currentMonth) date.setDate(0)
    }
    return new Date(date.toLocaleDateString()).getTime();
};

monthDiff = (dateFrom, dateTo) => {
    return dateTo.getMonth() - dateFrom.getMonth() + 
      (12 * (dateTo.getFullYear() - dateFrom.getFullYear()))
};

bindCurrency = (currencySymbol) => {
    document.querySelectorAll(".currency").forEach(element => element.innerHTML = currencySymbol);
};

createPieChart = () => {
    let pieChartData = [];

    userInputObj.investmentData.forEach(element => {
        pieChartData.push({
            name: element.investmentInstrument,
            y : element.finalExpectedValue[1]
        })
    })

    displayPieChart(pieChartData);
};
