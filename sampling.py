import numpy as np
import pandas as pd
import math as math
from sklearn import preprocessing as pre
from sklearn.cluster import KMeans
from sklearn.decomposition import PCA
import matplotlib.pyplot as plt
from sklearn.preprocessing import StandardScaler
from sklearn.manifold import MDS

def pick_random_sample(data,reqd_length):
    # picking 25 % of data by random sampling
    p=reqd_length/len(data) 
    n=len(data)
    random_sample=[]
    rand=np.random.binomial(1,p,n)
    k=0
    for i in rand:
        if(i==1):
            random_sample.append(data[k].tolist())
            k+=1
    return random_sample


def stratified_sampling(csv_data,req_sample_length):
    data=pd.DataFrame(csv_data)
    data=handle_one_hot_encoding(data)
    data=handle_Ordinal_data(data)
    distortions = []
    for i in range(1, 10):
        km = KMeans(
            n_clusters=i, init='random',
            n_init=10, max_iter=300,
            tol=1e-04, random_state=0
        )
        km.fit(data)
        distortions.append(km.inertia_)

    
    # elbow point is at k=4
    km = KMeans(
            n_clusters=4, init='random',
            n_init=10, max_iter=300,
            tol=1e-04, random_state=0
        )
    km.fit(data)
    predictions=km.predict(data)
    array_data=np.array(csv_data)
    sampled_data=[[],[],[],[]]
    sample_length=len(array_data)
    reqd_sample=[]
    for i in range(sample_length):
        sampled_data[predictions[i]].append(array_data[i])
        
    for i in range(len(sampled_data)):
        cluster_length=len(sampled_data[i])
        req_cluster_length=cluster_length*req_sample_length//sample_length
        sample=pick_random_sample(sampled_data[i],req_cluster_length)
        reqd_sample.extend(sample)
    
    return reqd_sample,distortions

def handle_Ordinal_data(data):
    ordinal_columns=['Age Group','APR Severity of Illness Description','Type of Admission','APR Severity of Illness Description']
    oe=pre.LabelEncoder()
    for col_name in ordinal_columns:
        data[col_name]=oe.fit_transform(data[col_name])
    return data
def handle_one_hot_encoding(data):
    data=pd.get_dummies(data,columns=['Hospital Service Area','Gender','Race','Emergency Department Indicator'])
    return data

def compute_pca(data,origcolumns):    
    df= pd.DataFrame(data=data,columns=origcolumns)
    df=handle_Ordinal_data(df)
    df=handle_one_hot_encoding(df)
    std_columns=df.columns
    std_df=StandardScaler().fit_transform(df)
    pca = PCA(n_components=len(std_df[0]))
    principalComponents = pca.fit_transform(std_df)
    #print(principalComponents)
    columns=[str(i) for i in range(1,len(std_df[0])+1)]
    principalDataframe = pd.DataFrame(data = principalComponents,columns=columns )
    i=0
    percent_variance = np.round(pca.explained_variance_ratio_* 100, decimals =2)
    for csum in pca.explained_variance_ratio_.cumsum():
        if(csum<0.75):
            i+=1
    scree_plot_data={
        'columns':columns,
        'variance':percent_variance.tolist(),
        'intr_dim':str(i)
    }
    scat_plot_data={
        '1':principalDataframe['1'].tolist(),
        '2':principalDataframe['2'].tolist()
    };
    print('intrinsic dimensionality  :', i)
    loadings = pca.components_.T* np.sqrt(pca.explained_variance_)
    #Transpose components* features to features * components
    ssl=sum_squared_loadings(loadings) 
    ssl.sort()
    #top 3 attributes
    a1=std_columns[ssl[0][1]]
    a2=std_columns[ssl[1][1]]
    a3=std_columns[ssl[2][1]]
    top_three_data={
        '1':df[a1].tolist(),
        '2':df[a2].tolist(),
        '3':df[a3].tolist()
    }
    print('TOP 3 Attributes: ',a1,' , ',a2,' , ',a3)
    attributes=[a1,a2,a3]
    loading_matrix = pd.DataFrame(loadings, columns=columns)
    return scree_plot_data,scat_plot_data,top_three_data,attributes

# features * loadings
def sum_squared_loadings(loadings):
    ssl=[]
    index=0
    for f_vector in loadings:
        sum=0
        for value in f_vector:
            sum+=value*value
        ssl.append((sum,index))
        index+=1
    return ssl


def compute_mds(data,columns,func):
    df= pd.DataFrame(data=data,columns=columns)
    df=handle_Ordinal_data(df)
    df=handle_one_hot_encoding(df)
    #df=StandardScaler().fit_transform(df)
    emb = MDS(n_components=2,max_iter=200,n_jobs=-1,dissimilarity=func)
    if(func=='precomputed'):
        df=compute_dissim(df)
    trans = emb.fit_transform(df)
    trans=np.reshape(trans,[trans.shape[1],trans.shape[0]])
    mds_plot_data={
        '1':trans[0].tolist(),
        '2':trans[1].tolist()
    }
    return mds_plot_data

def compute_dissim(data):
    dissim = np.sqrt(1 - np.abs(np.corrcoef(data)))
    dissimilarity = np.triu(dissim.T, k=1) + np.tril(dissim)
    return dissimilarity 

csv_data=pd.read_csv("hospital_impatient.csv")
columns=csv_data.columns
data=np.array(csv_data)
random_sampled_data=pick_random_sample(data,len(data)//4)
strat_sample,distorts=stratified_sampling(csv_data,len(csv_data)//4)
print('PCA')
print('For Random sample')
scree_plot_data_1,scat_plot_data_1,top3_data_1,attr1=compute_pca(random_sampled_data,columns)
print('For Stratified Sample')
scree_plot_data_2,scat_plot_data_2,top3_data_2,attr2=compute_pca(strat_sample,columns)
print('For Original Sample')
scree_plot_data_3,scat_plot_data_3,top3_data_3,attr3=compute_pca(csv_data,columns)
print('Computing MDS Eucledian ')
print('Random Sample') 
mds_euc_1=compute_mds(random_sampled_data,columns,'euclidean')
print('Stratified Sample')
mds_euc_2=compute_mds(strat_sample,columns,'euclidean')
print('Original Sample')
mds_euc_3=compute_mds(csv_data,columns,'euclidean')
print('Computing MDS Correlation ')
print('Random Sample')
mds_cor_1=compute_mds(random_sampled_data,columns,'precomputed')
print('Stratified Sample')
mds_cor_2=compute_mds(strat_sample,columns,'precomputed')
print('Original Sample')
mds_cor_3=compute_mds(csv_data,columns,'precomputed')
        

def handle_operations():
    obj={'sample_length':str(csv_data.size),
                    'random_sample':random_sampled_data,
                    'strat_sample':strat_sample,
                    'distortions':distorts}
    scree_plot={'random_sampled':scree_plot_data_1,'strat_sampled':scree_plot_data_2,
                'original_sample':scree_plot_data_3}
    scat_plot={'random_sampled':scat_plot_data_1,'strat_sampled':scat_plot_data_2,
                'original_sample':scat_plot_data_3    }
    scat_mat_data={'random_sampled':top3_data_1,'strat_sampled':top3_data_2,
                'original_sample':top3_data_3 }
    attrs={'random_sampled':attr1,'strat_sampled':attr2,
                'original_sample':attr3 }            
    response_data={'kmeans':obj,'scree_plot':scree_plot,'scat_plot':scat_plot,
                    'scat_mat':scat_mat_data,'attrs':attrs}
    return response_data

def handle_mds_euc():
    mds_euc_plot={'random_sampled':mds_euc_1,'strat_sampled':mds_euc_2,
                'original_sample':mds_euc_3   }
    response_data={'mds_euc_plot':mds_euc_plot}
    return response_data

def handle_mds_cor():
    mds_cor_plot={'random_sampled':mds_cor_1,'strat_sampled':mds_cor_2,
                'original_sample':mds_cor_3   }
    response_data={'mds_cor_plot':mds_cor_plot}
    return response_data
            




