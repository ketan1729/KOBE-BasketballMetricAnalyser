from config import conn
import pandas as pd
from sklearn.decomposition import PCA
from sklearn.cluster import KMeans
import numpy as np

def getWinDeltaData():
    df = pd.read_sql_query('SELECT * from nba_elo', conn)
    return df

def getTeams():
    df = pd.read_sql_query('select distinct team1 as team\
                            from nba_elo    \
                            where season >= 2015    \
                            union   \
                            select distinct team2  as team\
                            from nba_elo    \
                            where season >= 2015', conn)
    return df

def getTeamInfo(team, season):
    df = pd.read_sql_query('select date, team, season, score1, score2 from (SELECT cast(date as date) date, team2 as team, season, score1, score2 from nba_elo where team1 = \''+team+'\' and season = '+season +
                            ' UNION SELECT cast(date as date) date, team1 as team, season, score2 as score1, score1 as score2 from nba_elo where team2 = \''+team+'\' and season = '+season+')A order by date desc', conn)
    return df

def getTeamEloData(team):
    df = pd.read_sql_query('select cast(date as date) as x, elo1_post as y\
                            from nba_elo \
                            where team1 = \'' + team + '\' \
                            and season >= 2010 and season <= 2021 \
                            union \
                            select cast(date as date) as x, elo2_post as y \
                            from nba_elo \
                            where team2 = \'' + team + '\'\
                            and season >= 2010 and season <= 2021', conn)
    return df
    
def getWinProbData():
    df = pd.read_sql_query('SELECT * from nba_winprobs', conn)
    return df

def getPerformanceStats(team, season):
    df = pd.read_sql_query('select 1.0*sum(expected)/sum(total) y, 1.0*sum(actual)/sum(total) x, max(elo) elo \
                            from \
                            (select count(*) total, sum(case when elo_prob1 > elo_prob2 then 1 else 0 end) expected, sum(case when score1 > score2 then 1 else 0 end) actual, max(elo1_post) elo \
                            from nba_elo \
                            where team1 = \'' + team + '\' and season = ' + season + ' \
                            union \
                            select count(*) total, sum(case when elo_prob2 > elo_prob1 then 1 else 0 end) expected, sum(case when score2 > score1 then 1 else 0 end) actual, max(elo2_post) elo \
                            from nba_elo \
                            where team2 = \'' + team + '\' and season = ' + season + ') A', conn)
    return df

def get_modified_df_players():
    df=pd.read_sql_query('SELECT * FROM modern_RAPTOR_by_team order by player_id',conn)
    X=df.copy()
    X=X.dropna()
    for i in ['war_total','war_reg_season','war_playoffs','predator_offense','predator_defense','predator_total','pace_impact']:
        del[i]
    c=['player_name','player_id','season','season_type','team']
    cater=X[c]
    n=[x for x in X.columns if x not in c]
    numer=X[n]
    X=pd.concat([numer,cater],axis=1,join='inner')
    kmeans=KMeans(n_clusters=3)
    kmeans.fit(X[n])
    clusters=kmeans.predict(X[n])
    X['Cluster']=clusters
    numer_df=X[n]
    numer_df['Cluster']=clusters
    numer_df=pd.concat([cater,numer_df],axis=1,join='inner')
    plotX=pd.DataFrame(np.array(numer_df.sample(5000)))
    plotX.columns=numer_df.columns
    pca_1d=PCA(n_components=1)
    pca_2d=PCA(n_components=2)
    pca_3d=PCA(n_components=3)
    PCs_1d=pd.DataFrame(pca_1d.fit_transform(plotX.drop(["Cluster","player_name","player_id","season","season_type","team"],axis=1)))
    PCs_2d=pd.DataFrame(pca_2d.fit_transform(plotX.drop(["Cluster","player_name","player_id","season","season_type","team"],axis=1)))
    PCs_3d=pd.DataFrame(pca_3d.fit_transform(plotX.drop(["Cluster","player_name","player_id","season","season_type","team"],axis=1)))
    PCs_1d.columns=["PC1_1d"]
    PCs_2d.columns=["PC1_2d","PC2_2d"]
    PCs_3d.columns=["PC1_3d","PC2_3d","PC3_3d"]
    plotX=pd.concat([plotX,PCs_1d,PCs_2d,PCs_3d],axis=1,join='inner')
    plotX['dummy']=0
    cluster0=plotX[plotX['Cluster']==0]
    cluster1=plotX[plotX['Cluster']==1]
    cluster3=plotX[plotX['Cluster']==2]
    return [cluster0,cluster1,cluster3]
