let data = {}
let color = {
    "ATL": "Red",
    "BOS": "Green",
    "BRK": "Gray",
    "CHI": "Maroon",
    "CHO": "Blue",
    "CLE": "Black",
    "DAL": "Turquoise",
    "DEN": "Yellow",
    "DET": "Silver",
    "GSW": "Gold",
    "HOU": "Crimson",
    "IND": "Goldenrod",
    "LAC": "Pink",
    "LAL": "Purple",
    "MEM": "Navy",
    "MIA": "DarkRed",
    "MIL": "DarkGreen",
    "MIN": "Lime",
    "NOP": "Bisque",
    "NYK": "Orange",
    "OKC": "LightGrey",
    "ORL": "MidnightBlue",
    "PHI": "DodgerBlue",
    "PHO": "OrangeRed",
    "POR": "Coral",
    "SAC": "Olive",
    "SAS": "DarkCyan",
    "TOR": "Cyan",
    "UTA": "DarkSlateGray",
    "WAS": "Plum"
}
let trace1 = {
    x: [],
    y: [],
    mode: 'markers+text',
    type: 'scatter',
    name: 'Team A',
    text: [],
    textposition: 'top center',
    textfont: {
        family: 'Raleway, sans-serif'
    },
    marker: {
        size: 12,
        color: ["Red", "Gray", "Green", "Blue", "Maroon", "Black", "Turquoise", "Yellow", "Silver", "Gold", "Crimson", "Goldenrod", "Pink", "Purple", "Navy", "DarkRed", "DarkGreen", "Lime", "Bisque", "Orange", "LightGrey", "MidnightBlue", "DodgerBlue", "OrangeRed", "Coral", "Olive", "DarkCyan", "Cyan", "DarkSlateGray", "Plum"],
        colorscale: 'Jet',
    }
};

let imageObj = {
    "source": "imgs/gsw.png",
    "xref": "paper",
    "yref": "paper",
    "x": 0.5,
    "y": 0.5,
    "sizex": 0.05,
    "sizey": 0.05,
    "xanchor": "center",
    "yanchor": "middle"
};

let layout = {
    xaxis: {
        range: [0.2, 0.8]
    },
    yaxis: {
        range: [0.2, 0.8]
    },
    legend: {
        y: 0.5,
        yref: 'paper',
        font: {
            size: 20,
        }
    },
    font: {
        family: 'Roboto',
        color: '#000000'
      },
    shapes: [
        {
            type: 'line',
            xref: 'paper',
            x0: 0,
            y0: 0.5,
            x1: 1,
            y1: 0.5,
            line: {
                color: 'rgba(255, 0, 0, 0.2)',
                width: 4,
                dash: 'dot'
            }
        },
        {
            type: 'line',
            xref: 'paper',
            x0: 0.5,
            y0: 0,
            x1: 0.5,
            y1: 1,
            line: {
                color: 'rgba(255, 0, 0, 0.2)',
                width: 4,
                dash: 'dot'
            }
        }
    ],
    // images: [
    //     {
    //         "source": "imgs/gsw.png",
    //         "xref": "paper",
    //         "yref": "paper",
    //         "x": 0.5,
    //         "y": 0.5,
    //         "sizex": 0.05,
    //         "sizey": 0.05,
    //         "xanchor": "right",
    //         "yanchor": "bottom"
    //     },
    // ],

    title: 'Actual v/s Expected Performance',
    annotations: [{
        xref: 'paper',
        yref: 'paper',
        x: 0.25,
        xanchor: 'right',
        y: 0.85,
        yanchor: 'bottom',
        text: 'Exceeding expectations',
        showarrow: false
    }, {
        xref: 'paper',
        yref: 'paper',
        x: 0.85,
        xanchor: 'right',
        y: 0.85,
        yanchor: 'bottom',
        text: 'Performing as expected',
        showarrow: false
    },
    {
        xref: 'paper',
        yref: 'paper',
        x: 0.25,
        xanchor: 'right',
        y: 0.20,
        yanchor: 'bottom',
        text: 'Performing as expected',
        showarrow: false
    },
    {
        xref: 'paper',
        yref: 'paper',
        x: 0.85,
        xanchor: 'right',
        y: 0.20,
        yanchor: 'bottom',
        text: 'Under performing',
        showarrow: false
    }]
};

function makeplot() {
    Plotly.d3.json("http://127.0.0.1:5000/getData", function (rawData) { processData(rawData) });
};

function processData(rawData) {
    for (let i = 0; i < rawData.length; i++) {
        let season = rawData[i]["season"]
        if (data[season] == undefined) {
            data[season] = {}
        }

        let team1 = rawData[i]["team1"]
        let team2 = rawData[i]["team2"]

        if (data[season][team1] == undefined) {
            data[season][team1] = { "expected": 0, "won": 0, "total": 0 }
        }

        if (data[season][team2] == undefined) {
            data[season][team2] = { "expected": 0, "won": 0, "total": 0 }
        }

        data[season][team1].total++
        data[season][team2].total++
        data[season][team1].expected += Number(rawData[i]["elo_prob1"])
        data[season][team2].expected += Number(rawData[i]["elo_prob2"])

        if (rawData[i]["score1"] > rawData[i]["score2"]) {
            data[season][team1].won++
        } else if (rawData[i]["score1"] < rawData[i]["score2"]) {
            data[season][team2].won++
        }
    }
    console.log(data)
    makePlotly()
}

function makePlotly() {
    Plotly.newPlot('canvas', [getData(2015)], getLayout(2015));
    //Plotly.newPlot('canvas1', [getData(document.getElementById("to").value)], getLayout(document.getElementById("to").value));
    let label1 = document.querySelectorAll('#canvas g.g-gtitle > text.gtitle')[0]
    //let label2 = document.querySelectorAll('#canvas1 g.g-gtitle > text.gtitle')[0]

    label1.innerHTML += " - season " + 2015
   // label2.innerHTML += " - season " + document.getElementById("to").value
};

function getLayout(season) {
    let layoutObj = JSON.parse(JSON.stringify(layout));
    // let images = [];

    // Object.keys(data[season]).forEach((team) => {
    //     let x = data[season][team].expected / data[season][team].total;
    //     let y = data[season][team].won / data[season][team].total;

    //     let image = JSON.parse(JSON.stringify(imageObj));
    //     image["source"] =  "imgs/" + team + ".png";
    //     image["x"] = x;
    //     image["y"] = y;
    //     images.push(image);
    // })

    // layoutObj["images"] = images;
    // console.log(layoutObj)
    return layoutObj;
}

function getData(season) {
    let formattedData = JSON.parse(JSON.stringify(trace1));
    console.log(season)
    console.log(data[season])
    Object.keys(data[season]).sort().forEach((team) => {
        let x = data[season][team].expected / data[season][team].total;
        let y = data[season][team].won / data[season][team].total;

        formattedData.x.push(x)
        formattedData.y.push(y)
        formattedData.text.push(team)
    })

    console.log(formattedData)
    return formattedData;
}

function populateSelectBox() {
    let html = ""
    for (let year = 2000; year <= 2022; year++) {
        html += "<option value=" + year + ">" + year + "</option>"
    }
    document.getElementById("from").innerHTML = html;
    document.getElementById("to").innerHTML = html;
}

function restyle() {
    makePlotly()
}

//populateSelectBox();
makeplot();