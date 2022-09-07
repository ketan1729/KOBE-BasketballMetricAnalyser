from flask import Flask, render_template, request
import pandas as pd
import dao
import json
import plotly
import plotly.graph_objs as go
from plotly.offline import download_plotlyjs, init_notebook_mode, plot, iplot

app = Flask(__name__)

@app.route('/getData')
def getData():
  df = dao.getWinDeltaData()
  return df.to_json(orient='records')

@app.route('/getTeams')
def getTeams():
  df = dao.getTeams()
  return df.to_json(orient='records')

@app.route('/getTeamInfo')
def getTeamInfo():
  df = dao.getTeamInfo(request.args.get('team'), request.args.get('season'))
  result = {}
  result["matches"] = df.to_dict('records')
  result["total"] = len(df)
  result["won"] = len(df.query('score1 > score2'))
  return result

@app.route('/getTeamEloData')
def getTeamEloData():
  df = dao.getTeamEloData(request.args.get('team'))

  result = {}
  for i in list(df):
    result[i] = df[i].tolist()

  return result
  
@app.route('/getWinProbData')
def getWinProbData():
  df = dao.getWinProbData()
  return df.to_json(orient='records')

@app.route('/getAllElo')
def getAllElo():
  result = {}
  for index, row in dao.getTeams().iterrows():
    df = dao.getTeamEloData(row['team'])
    elo = {}
    for i in list(df):
      elo[i] = df[i].tolist()
    result[row['team']] = elo
  
  return result

@app.route('/getPerformanceStats')
def getPerformanceStats():
  season = request.args.get('season')
  teams = request.args.get('teams')
  result = {}
  for team in teams.split(","):
    df = dao.getPerformanceStats(team, season)
    elo = {}
    for i in list(df):
      elo[i] = df[i].tolist()[0]
    result[team] = elo
  
  return result

@app.route('/getPlayerAnalysis')
def getPlayerAnalysis():
  f = open('player.json')
 
  # returns JSON object as
  # a dictionary
  data = json.load(f)

  f.close()

  return data

@app.route('/pca_viz_1')
def pca_viz_1():
  [cluster0, cluster1, cluster2] = dao.get_modified_df_players()
  #1D viz
  trace1=go.Scatter(x=cluster0['PC1_1d'],y=cluster0['dummy'],mode='markers',
    name='Cluster 0',marker=dict(color='rgba(255,128,255,0.8)'),text=None)
  trace2=go.Scatter(x=cluster1['PC1_1d'],y=cluster1['dummy'],mode='markers',
    name='Cluster 1',marker=dict(color='rgba(255,128,2,0.8)'),text=None)
  trace3=go.Scatter(x=cluster2['PC1_1d'],y=cluster2['dummy'],mode='markers',
    name='Cluster 2',marker=dict(color='rgba(0,128,200,0.8)'),text=None)
  data=[trace1,trace2,trace3]
  title='Visualizing Clusters in one dimension using PCA'
  layout=dict(title=title,xaxis=dict(title='PC1',ticklen=5,zeroline=False),
    yaxis=dict(title='',ticklen=5,zeroline=False))
  fig=dict(data=data,layout=layout)
  graphJSON_first=json.dumps(fig,cls=plotly.utils.PlotlyJSONEncoder)
  #2Dviz
  trace1=go.Scatter(x=cluster0['PC1_2d'],y=cluster0['PC2_2d'],mode='markers',
    name='Cluster 0',marker=dict(color='rgba(255,128,255,0.8)'),text=None)
  trace2=go.Scatter(x=cluster1['PC1_2d'],y=cluster1['PC2_2d'],mode='markers',
    name='Cluster 1',marker=dict(color='rgba(255,128,2,0.8)'),text=None)
  trace3=go.Scatter(x=cluster2['PC1_2d'],y=cluster2['PC2_2d'],mode='markers',
    name='Cluster 2',marker=dict(color='rgba(0,128,200,0.8)'),text=None)
  data=[trace1,trace2,trace3]
  title='Visualizing Clusters in two dimensions using PCA'
  layout=dict(title=title,xaxis=dict(title='PC1',ticklen=5,zeroline=False),
    yaxis=dict(title='',ticklen=5,zeroline=False))
  fig=dict(data=data,layout=layout)
  graphJSON_second=json.dumps(fig,cls=plotly.utils.PlotlyJSONEncoder)
  #3Dviz
  trace1=go.Scatter3d(x=cluster0['PC1_3d'],y=cluster0['PC2_3d'],z=cluster0['PC3_3d'],
    mode='markers',name='Cluster 0',marker=dict(color='rgba(255,128,255,0.8)'),
    text=None)
  trace2=go.Scatter3d(x=cluster1['PC1_3d'],y=cluster1['PC2_3d'],z=cluster1['PC3_3d'],
    mode='markers',name='Cluster 1',marker=dict(color='rgba(255,128,2,0.8)'),
    text=None)
  trace3=go.Scatter3d(x=cluster2['PC1_3d'],y=cluster2['PC2_3d'],z=cluster2['PC3_3d'],
    mode='markers',name='Cluster 2',marker=dict(color='rgba(0,128,200,0.8)'),
    text=None)
  data=[trace1,trace2,trace3]
  title='Visualizing Clusters in three dimensions using PCA'
  layout=dict(title=title,xaxis=dict(title='PC1',ticklen=5,zeroline=False),
    yaxis=dict(title='',ticklen=5,zeroline=False))
  fig=dict(data=data,layout=layout)
  graphJSON_third=json.dumps(fig,cls=plotly.utils.PlotlyJSONEncoder)
  graph_data={"first":json.loads(graphJSON_first),"second":json.loads(graphJSON_second),"third":json.loads(graphJSON_third)}
  graph_data=json.dumps(graph_data)
  return graph_data



@app.route('/')
def home():
    return render_template("dashboard.html")

@app.route('/temp')
def temp():
    return render_template("index.html")

if __name__ == "__main__":
  app.run(debug=True)


