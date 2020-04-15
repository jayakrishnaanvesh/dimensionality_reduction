from flask import Flask
from flask import render_template 
from flask.json import jsonify 
import sampling as s
app = Flask(__name__)

@app.route('/',methods=['GET'])
def init():
   return render_template("index.html")

@app.route('/data',methods=['GET'])
def get_data():
   data=s.handle_operations()
   return jsonify(data)

@app.route('/mds_euc',methods=['GET'])
def get_mds_euc_data():
   data=s.handle_mds_euc()
   print('mds_euc')
   return jsonify(data)

@app.route('/mds_cor',methods=['GET'])
def get_mds_cor_data():
   data=s.handle_mds_cor()
   print('mds_cor')
   return jsonify(data)



if __name__ == '__main__':
   app.run(debug=True)