let selectorOptions = {
    buttons: [{
        step: 'month',
        stepmode: 'backward',
        count: 1,
        label: '1m'
    }, {
        step: 'month',
        stepmode: 'backward',
        count: 6,
        label: '6m'
    }, {
        step: 'year',
        stepmode: 'todate',
        count: 1,
        label: 'YTD'
    }, {
        step: 'year',
        stepmode: 'backward',
        count: 1,
        label: '1y'
    }, {
        step: 'all',
    }],
};

let teamColor = {
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

$(document).ready(function () {
    loadDashboard();
});

$("#theme").click(function () {
    if (document.documentElement.getAttribute("data-theme") == "dark") {
        document.documentElement.setAttribute("data-theme", "light");
    } else {
        document.documentElement.setAttribute("data-theme", "dark");
    }
});


/******* MENU ITEMS ****/
function loadDashboard() {
    loadTeams();
    $(".active").removeClass("active")
    $("#menu-db").addClass("active");
}

function loadAnalysis() {
    loadEloAnalysis();
    $(".active").removeClass("active")
    $("#menu-analysis").addClass("active");
}

function playerAnalysis() {
    loadPlayerAnalysis();
    $(".active").removeClass("active")
    $("#player-analysis").addClass("active");
}

function load_pca_viz(){
    pca_viz_first();
    $(".active").removeClass("active")
    $("#menu-viz").addClass("active");
}
/***********************/


/***********DASHBOARD ************************/
function pca_viz_first(){
    fetchAsync("http:///127.0.0.1:5000/pca_viz_1").then(response=>{
        document.getElementById("canvas").innerHTML = "<div><div id='first'></div><div id='second'></div><div id='third'></div></div>"
        /*One dimension*/
        Plotly.plot('first', response.first.data, response.first.layout);
        document.getElementById("canvas-title").innerHTML = "PCA"
        /*Two dimension*/
        Plotly.plot('second', response.second.data, response.second.layout);
        /*Three dimension*/
        Plotly.plot('third', response.third.data, response.third.layout);
    })
}
function loadTeams() {
    fetchAsync("http://127.0.0.1:5000/getTeams").then(teams => {
        document.getElementById("canvas").innerHTML = ""
        let html = ""
        let i = 0;
        teams.forEach(team => {
            if (i % 6 == 0) {
                if (i != 0) { html += "</div>" }
                html += "<div class=\"row center\">"
            }

            html += "<div class=\"col-md-2 col-lg-2 px-md-2 team-list-db\" id=\"" + team['team'] + "\" onclick=\"loadTeamInfo(" + team['team'] + ", 2015)\"><img class=\"img-circle team-icon-db\" src=\"../static/imgs/" + team['team'] + ".png\"/></div>"
            i++;
        });

        html += "</div>"
        document.getElementById("canvas").innerHTML = html
        document.getElementById("canvas-title").innerHTML = "Teams"
    })
}

function loadTeamInfo(elem, season = 2015) {
    let team = elem.id

    getTeamInfo(team, season)
}

function getTeamInfo(team, season) {
    let html = '<div class="row"><div class="col-md-4 col-lg-4 px-md-4">' + seasonDropDown(team, season)
    fetchAsync("http://127.0.0.1:5000/getTeamInfo?team=" + team + "&season=" + season).then(data => {
        document.getElementById("canvas").innerHTML = ""
        html += '<div class="table-container"><table class="table table-hover"><tbody>'
        let i = 0;
        data.matches.forEach(match => {
            html += '<tr class="' + (match.score1 > match.score2 ? "success" : "danger") + '"><td>' + new Date(match.date).toDateString() + '</td><td>' + match.score1 + ' - ' + match.score2 + '</td><td>' + match.team + '</td></tr>'
        });

        html += '</tbody></table></div></div><div class="col-md- col-lg-8 px-md-8"><div id="win-loss-pie"></div><div id="elo-plot"></div></div></div>'

        document.getElementById("canvas").innerHTML = html
        document.getElementById("canvas-title").innerHTML = team
        data.team = team
        loadWinLossPie(data, season);
        loadEloPlot(team, season);
        //setTimeout(() => loadMinByMinPlot(), 1000);
    })
}

function loadMinByMinPlot() {
    var data = {}
    fetchAsync("http://127.0.0.1:5000/getWinProbData").then(raw_data => {
        getDataForMinByMin(raw_data, data)

        var list = []
        Object.keys(data).forEach((k, idx) => {
            list.push(data[k])
        })

        var layout = {
            title: 'Minute by minute win probablitites for each NBA Team',
            legend: {
                y: 0.5,
                traceorder: 'reversed',
                font: { size: 16 },
                yref: 'paper'
            },
            xaxis: {
                range: ["0", "48"],
                autorange: false
            },
            yaxis: { range: [0.0, 1.0] }
        };

        Plotly.newPlot('minute-plot', list, layout);
    })
}


function getDataForMinByMin(rawData, data) {
    let samplePlot = {
        x: [],
        y: [],
        mode: 'lines',
        name: '',
        connectgaps: true,
        line: {
            color: 'rgb(128, 0, 128)',
            width: 5
        },
        isColored: false,
        visible: 'legendonly'
    };
    for (var r = 0; r < rawData.length; r++) {
        var row = rawData[r]
        let plotObj = JSON.parse(JSON.stringify(samplePlot))
        for (var i = 1; i < 49; i++) {
            plotObj.x.push(i)
            plotObj.y.push(row['min' + i])
            plotObj.name = row.team;

            if (!plotObj.isColored) {
                //plotObj.line.color = getColor(row.team.substring(0,3).toUpperCase());

                //todo color
                plotObj.line.color = 'blue';
                plotObj.isColored = true;
            }
        }
        data[row.team] = plotObj
    }
}

function loadEloPlot(team, season) {
    fetchAsync("http://127.0.0.1:5000/getTeamEloData?team=" + team).then(data => {
        let layout = {
            title: 'Trending records for each NBA Team',
            legend: {
                y: 0.5,
                traceorder: 'reversed',
                font: { size: 16 },
                yref: 'paper'
            },
            xaxis: {
                title: 'Seasons',
            },
            yaxis: {
                fixedrange: true,
                title: 'Elo Rating',
            }
        };

        let plot = {
            x: data.x,
            y: data.y,
            mode: 'lines',
            name: team,
            connectgaps: true,
            line: {
                color: teamColor[team],
                width: 1,
                dash: '0px 52000px'
            },
            isColored: false,
            totalMatches: 0,
            matchesWon: 0,
        };

        layout.xaxis.rangeselector = selectorOptions
        layout.xaxis.rangeslider = {}
        Plotly.plot('elo-plot', [plot], layout, { displayModeBar: false }).then(function () {
            return Plotly.animate('elo-plot',
                [{ data: [{ 'line.dash': '5200px 0px' }] }],
                {
                    frame: { duration: 5000, redraw: false },
                    transition: { duration: 5000 }
                }
            );
        });
    })

}

function loadWinLossPie(data, season) {
    let pieData = [{
        values: [data.won, data.total - data.won],
        labels: ['Matches won - ' + data.won, 'Matches lost - ' + (data.total - data.won)],
        marker: {
            colors: ['rgb(75, 159, 75)', 'rgb(195, 83, 57)']
        },
        type: 'pie'
    }];

    let pieLayout = {
        title: 'Win/Loss % - Season ' + season,
        height: 400,
        width: 500,
    };

    Plotly.newPlot('win-loss-pie', pieData, pieLayout, { displayModeBar: false });
}

function seasonDropDown(team, season = 2015) {
    let dropdown = '<div class="dropdown"><button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">Season: ' + season + '</button><ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">'
    for (let year = 2010; year <= 2021; year++) {
        dropdown += '<li><a class="dropdown-item" onclick="updateSeason(\'' + team + '\',' + year + ')">' + year + '</a></li>'
    }
    dropdown += '</ul></div>'
    return dropdown
}

function updateSeason(team, season) {
    document.getElementById("dropdownMenuButton1").innerHTML = 'Season: ' + season;
    getTeamInfo(team, season)
}

/************************************************** */

/************ Analysis **********************/
let selectedTeams = new Set()
function loadEloAnalysis() {
    fetchAsync("http://127.0.0.1:5000/getAllElo").then(elo => {
        document.getElementById("canvas").innerHTML = '<div class="row"><div class="col-md-12 col-lg-12 px-md-12"><div id="all-elo-plot"></div></div><button type="button" class="btn btn-default nextButton" onclick="loadNextAnalysis()">Next</button></div>'

        let layout = {
            title: 'Trending records for each NBA Team',
            legend: {
                y: 0.5,
                traceorder: 'reversed',
                font: { size: 16 },
                yref: 'paper'
            },
            xaxis: {
                range: ["2010-01-01", "2022-03-01"],
                autorange: false,
                title: 'Seasons',
            },
            yaxis: {
                title: 'Elo Rating',
            }
        };

        let plot = {
            x: [],
            y: [],
            mode: 'lines',
            name: '',
            connectgaps: true,
            line: {
                color: 'rgb(128, 0, 128)',
                width: 1,
                dash: '0px 52000px'
            },
            isColored: false,
            totalMatches: 0,
            matchesWon: 0
        };

        let allPlots = []
        let i = 0;

        Object.keys(elo).forEach((team, index) => {
            let plotCopy = JSON.parse(JSON.stringify(plot))
            plotCopy.x = elo[team].x;
            plotCopy.y = elo[team].y;
            plotCopy.name = team;
            plotCopy.line.color = teamColor[team];

            if (i >= 4) {
                plotCopy.visible = 'legendonly'
                plotCopy.line.dash = '5200px 0px'
            } else {
                selectedTeams.add(team)
            }

            allPlots.push(plotCopy)
            i++;
        });

        Plotly.plot('all-elo-plot', allPlots, layout, { displayModeBar: false }).then(function () {
            return Plotly.animate('all-elo-plot',
                [{ data: [{ 'line.dash': '5200px 0px' }, { 'line.dash': '5200px 0px' }, { 'line.dash': '5200px 0px' }, { 'line.dash': '5200px 0px' }] }],
                {
                    frame: { duration: 5000, redraw: false },
                    transition: { duration: 5000 }
                }
            );
        });

        layout.xaxis.rangeselector = selectorOptions
        layout.xaxis.rangeslider = {}
        Plotly.plot('all-elo-plot', allPlots, layout)
        document.getElementById('all-elo-plot').on('plotly_legendclick', function (legendClickData) {

            let team = legendClickData.data[legendClickData.curveNumber].name;

            if (selectedTeams.has(team)) {
                selectedTeams.delete(team)
            } else {
                selectedTeams.add(team)
            }

        });
        document.getElementById("canvas-title").innerHTML = "In-Depth Analysis"
    })
}

function loadNextAnalysis(season = 2015) {
    fetchAsync("http://127.0.0.1:5000/getPerformanceStats?season=" + season + "&teams=" + Array.from(selectedTeams).join(",")).then(perfData => {
        document.getElementById("canvas").innerHTML = seasonDropDown2() + '<div class="row"><div class="col-md-12 col-lg-12 px-md-12"><div id="perf-plot"></div></div></div><div class="row"><div class="col-md-12 col-lg-12 px-md-12"><div id="minute-plot"></div></div></div>'

        let layout = {
            xaxis: {
                range: [0, 1]
            },
            yaxis: {
                range: [0.05, 0.95]
            },
            legend: {
                y: 0.5,
                yref: 'paper',
                font: {
                    family: 'Arial, sans-serif',
                    size: 20,
                    color: 'grey',
                }
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

        let plot = {
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
                color: [],
                colorscale: 'Jet',
            }
        };

        Object.keys(perfData).forEach((team, index) => {
            plot.x.push(perfData[team].x)
            plot.y.push(perfData[team].y)
            plot.text.push(team)
            plot.marker.color.push(teamColor[team])
        });
        Plotly.newPlot('perf-plot', [plot], layout);
    }).then(success => {
        loadMinByMinPlot()
    })
}

function seasonDropDown2(season = 2015) {
    let dropdown = '<div class="dropdown"><button class="btn btn-secondary dropdown-toggle" type="button" id="dropdownMenuButton1" data-bs-toggle="dropdown" aria-expanded="false">Season: ' + season + '</button><ul class="dropdown-menu" aria-labelledby="dropdownMenuButton1">'
    for (let year = 2010; year <= 2021; year++) {
        dropdown += '<li><a class="dropdown-item" onclick="updateSeason2(' + year + ')">' + year + '</a></li>'
    }
    dropdown += '</ul></div>'
    return dropdown
}

function updateSeason2(season) {
    document.getElementById("dropdownMenuButton1").innerHTML = 'Season: ' + season;
    loadNextAnalysis(season)
}

/**************************  Player Analysis ***************************** */
function loadPlayerAnalysis() {
    document.getElementById("canvas").innerHTML = '<div id="3d-graph"></div>'
    const graph_div = document.getElementById("3d-graph");
    const graph = ForceGraph3D()(graph_div)
        // loading the nodes and links dataset in JSON format
        .jsonUrl('http://127.0.0.1:5000/getPlayerAnalysis')
        // Represent value of each edge by its thickness.
        .linkWidth(link => link.value)
        // Color nodes according their peel value.
        .nodeAutoColorBy('raptor_box_total')
        //Encode nodes’ diversity by their size.
        .nodeVal('raptor_onoff_offense')
        // When hovering on a node, show a tooltip contains its name, degree, peel, pagerank, diversity and betweenness.
        .nodeLabel(node => `name= ${node.player_name}<br/> raptor_box_offense= ${node.raptor_box_offense}<br/> raptor_box_defense= ${node.raptor_box_defense}`);
    document.getElementById("canvas-title").innerHTML = "Player Analysis"
}

/***************************************** */
async function fetchAsync(url) {
    let response = await fetch(url);
    let data = await response.json().then(function (resp) { return resp; });
    return data;
}