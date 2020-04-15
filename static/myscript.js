var graph_data;
var mds_data_cor;
var mds_data_euc;
function change_task(id){
  $("#scat_drop")[0].style.visibility='hidden';
  $("#scree_drop")[0].style.visibility='hidden';
  task=''
  plot=''
  if(id=='1'){
    dist=[]
		graph_data.kmeans.distortions.forEach(function (item, index) {
			dist.push(Number((item/1000000000000).toFixed(4)));
		} );
    plot_kmeans_chart(dist);
    task='Task1: Data clustering and decimation';
    plot='K-Means Plot';
  }
  else if(id=='2'){
    intr_dim=graph_data.scree_plot['random_sampled']['intr_dim'];
    change_scree_plot('1'); 
    $("#scree_drop")[0].style.visibility='visible';
    task='Task2: Dimension reduction';
    plot='Scree Plot';    
  }
  else if(id=='3'){
    $("#scat_drop")[0].style.visibility='visible';
    get_scat_plot();
    task='Task3: Visualization of Data Scatter Plot ';
    plot='Scatter Plot ';
  }
  $("#task")[0].innerHTML=task;
  $("#plot")[0].innerHTML=plot;
}


function change_scree_plot(id){
  if(id=='1'){
    intr_dim=graph_data.scree_plot['random_sampled']['intr_dim'];
    sc_data=graph_data.scree_plot['random_sampled'];
    scree_plots(sc_data,intr_dim);
  }
  if(id=='2'){
    intr_dim=graph_data.scree_plot['strat_sampled']['intr_dim'];
    sc_data=graph_data.scree_plot['strat_sampled'];
    scree_plots(sc_data,intr_dim);
  }
  if(id=='3'){
    intr_dim=graph_data.scree_plot['original_sample']['intr_dim'];
    sc_data=graph_data.scree_plot['original_sample'];
    scree_plots(sc_data,intr_dim);
  }
}
function get_scat_plot(){
  clear_graph();
  type=$("#s_type")[0].value;
    if(type=='1'){
      data=graph_data;
      change_scat_plot(data);
    }
    else if(type=='2' ){
      if( mds_data_euc==null){
        get('http://127.0.0.1:5000/mds_euc',function(data,status){
          mds_data_euc=data;  
          change_scat_plot(mds_data_euc);
        });
      }
      else{
        change_scat_plot(mds_data_euc);
      }
    }
    else if(type=='3' ){
      if( mds_data_cor==null){
        get('http://127.0.0.1:5000/mds_cor',function(data,status){
          mds_data_cor=data;  
          change_scat_plot(mds_data_cor);
        });
      }
      else{
        change_scat_plot(mds_data_cor);
      }
    }
    else{
        group=$("#d_type")[0].value;
        v='random_sampled';
        if(group=='1'){
          v='random_sampled';
        }
        else if(group=='2'){
          v='strat_sampled';
        }
        else{
          v='original_sample'
        }
        clear_graph();
        data=graph_data;
        tab='<table id="tab" style="margin-left: 30%;"  cellpadding="2px">'
        +'<tr><td id="r11" ></td><td id="r12"></td><td id="r13"></td></tr>'
        +'<tr><td id="r21" ></td><td id="r22"></td><td id="r23"></td></tr>'
        +'<tr><td id="r31" ></td><td id="r32"></td><td id="r33"></td></tr></table>';
        $("#graph").append(tab)
        plot_mini_matrices(data,v,'1','1');
        plot_mini_matrices(data,v,'2','1');
        plot_mini_matrices(data,v,'2','2');
        plot_mini_matrices(data,v,'3','1');
        plot_mini_matrices(data,v,'3','2');
        plot_mini_matrices(data,v,'3','3');
        plot=' Top 3 Attributes: 1:'+graph_data.attrs[v][0] +', 2:'+graph_data.attrs[v][1]+
        ', 3:'+graph_data.attrs[v][2]+' <br/> Scatter Plot';
        $("#plot")[0].innerHTML=plot; 
    }
}

function change_scat_plot(data){
  type=$("#s_type")[0].value;
  group=$("#d_type")[0].value;
  t='scat_plot';
  v='random_sampled';
  if(type=='1'){
    t='scat_plot';
  }
  else if(type=='2'){
    t='mds_euc_plot';
  }
  else{
    t='mds_cor_plot';
  }
  if(group=='1'){
    v='random_sampled';
  }
  else if(group=='2'){
    v='strat_sampled';
  }
  else{
    v='original_sample'
  }
  console.log(t)
  sc_data=data[t][v];

  xmin=d3.min([d3.min(data[t]['original_sample']['1']),d3.min(data[t]['random_sampled']['1']),
                d3.min(data[t]['strat_sampled']['1'])]);
  xmax=d3.max([d3.max(data[t]['original_sample']['1']),d3.max(data[t]['random_sampled']['1']),
                d3.max(data[t]['strat_sampled']['1'])]);
  ymin=d3.min([d3.min(data[t]['original_sample']['2']),d3.min(data[t]['random_sampled']['2']),
                d3.min(data[t]['strat_sampled']['2'])]);
  ymax=d3.max([d3.max(data[t]['original_sample']['2']),d3.max(data[t]['random_sampled']['2']),
                d3.max(data[t]['strat_sampled']['2'])]);
  scatter_plot(sc_data,xmax,xmin,ymax,ymin);

}

function handle_pageload(){
	get('http://127.0.0.1:5000/data',function(data,status){
    graph_data=data;  
    change_task(1);
  });
}

function post(url,data,afunc){
  $.post(url,
	  data,
	  function(data,status){
		afunc(data,status);
  });
		
}
function get(url,afunc){
  $("#load")[0].style.visibility='visible';
	$.get(url, function(data, status){
    afunc(data,status)
    $("#load")[0].style.visibility='hidden';
	  });
}

function plot_kmeans_chart(distortions){
    var width = 450  
    var height = 450;
    var n = distortions.length;
    //for the xscale using linear scale
    var xScale = d3.scaleLinear().domain([0, n-1]).range([0, width]); 
    var yScale = d3.scaleLinear()
      .domain([0,Math.max.apply(null,distortions)])  
      .range([height, 0]);  

    
    // for the plotting curve 
    var line = d3.line()
      .x(function(d, i) { return xScale(i); }) 
      .y(function(d) { return yScale(d); }) 
      .curve(d3.curveMonotoneX)

      clear_graph();

    var svg = d3.select("#graph").append("svg")
      .attr("width", width + 100)
      .attr("height", height + 60)
    .append("g")
      .attr("transform", "translate(50,10)");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xScale)); 

    svg.append("g")
      .call(d3.axisLeft(yScale)); 

    svg.append("path")
      .datum(distortions)  
      .attr("class", "path")  
      .attr("d", line);  

    svg.selectAll(".dot")
      .data(distortions)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xScale(i) })
      .attr("cy", function(d) { 
        return yScale(d) })
      .attr("r", 4);
    
    svg.append("g")
      .append("text")
      .attr("transform", "rotate(-90)")
      .attr("y", -35)
      .attr("x",-105)
      .attr("text-anchor", "end")
      .text("Distortions")
      .attr("stroke", "black");

    svg.append("text")
      .attr("y", 480 )
      .attr("x", 305 )
      .attr("text-anchor", "end")
      .text('Number of clusters')
      .attr("stroke", "black");
    
    	
}
function scree_plots(data,intr_dim){

  	
	var width = 650, height = 400;
	//svg
	clear_graph();
	var svg = d3.select("#graph")
		.append("svg")
		.attr("width", width+100)
		.attr("height", height+100);
	//scales	
	var xscale = d3.scaleBand()
		.domain(data.columns)
		.range([0,width]).padding(0.3);

	var yscale = d3.scaleLinear()
			.domain([0, d3.max(data.variance)+10])
			.range([height, 50]);

	var x_axis=d3.axisBottom().scale(xscale);
	var y_axis = d3.axisLeft()
			.scale(yscale);

	svg.append("g")
		   .attr("transform", "translate(50,0)")
		   .call(y_axis)
		   .append("text")
         .attr("transform", "rotate(-90)")
		 .attr("y", -30)
		 .attr("x",-100)
		 .attr("text-anchor", "end")
		 .text("Variance Explained (%)")
		 .attr("stroke", "black")
		 .attr("font-size",13);

	var xAxisTranslate = height;

	var k= svg.append("g")
				.attr("transform", "translate(50, " + xAxisTranslate+")")
				.call(x_axis)
				.selectAll("text")	
        			.style("text-anchor", "end")
        			.attr("transform", "rotate(-50)")
	svg.append("text")
			.attr("y", 435 )
			.attr("x", 500 )
			.attr("text-anchor", "end")
			.text("Principal Component")
			.attr("stroke", "black")
       .attr("font-size",13);
  gdata=[];
  data.variance.forEach(function(value,index){
    gdata.push({'name':data.columns[index],'value':value});
  });
	svg.selectAll(".bar")
			.data(gdata)
			.enter().append("rect")
			.style('fill',"steelblue")
			.attr("x",function(d) { 
				return xscale(d.name)+50; })
			.attr("y",function(d) { return yscale(d.value); })
			.attr("width",xscale.bandwidth())
      .attr("height",function(d) { return height -  yscale(d.value); })
  svg.append('line')
  .attr('class','dashed')
  .attr('x1', function(d){ return xscale(intr_dim)+60;})
  .attr('y1', function(d){ return 400})
  .attr('x2', function(d){ return xscale(intr_dim)+60;})
  .attr('y2', function(d){ return 0});
  svg.append("text")
			.attr("y", 50 )
			.attr("x", xscale('10')+60 )
			.attr("text-anchor", "end")
			.text("75% mark")
			.attr("stroke", "black")
       .attr("font-size",13);
}
function scatter_plot(data,xmax,xmin,ymax,ymin){
  
  var width = 450  
  var height = 450;
    
  
    var xscale = d3.scaleLinear()
      .domain([xmin, xmax]) 
      .range([0, width]); 

    var yscale = d3.scaleLinear()
      .domain([ymin,ymax])  
      .range([height, 0]);  
    
      clear_graph();
    var svg = d3.select("#graph").append("svg")
      .attr("width", width + 95)
      .attr("height", height + 65)
    .append("g")
      .attr("transform", "translate(50,10)");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xscale)); 

    svg.append("g")
      .call(d3.axisLeft(yscale)); 
  
  

	svg.append("text")
     .attr("transform", "rotate(-90)")
		 .attr("y", -30)
		 .attr("x",-145)
		 .attr("text-anchor", "end")
		 .text("Principal Component 2")
		 .attr("stroke", "black")
		 
	svg.append("text")
			.attr("y", 480 )
			.attr("x", 305 )
			.attr("text-anchor", "end")
			.text("Principal Component1")
			.attr("stroke", "black");
  gdata=[];
  for(var i=0;i<data['1'].length;i++){
    gdata.push({'p1':data['1'][i],'p2':data['2'][i]})
  }
  svg.selectAll(".dot")
      .data(gdata)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xscale(d.p1) })
      .attr("cy", function(d) { 
        return yscale(d.p2) })
      .attr("r", 3.5)
      .style("fill", function(d) { return get_color();});
  
} 

function plot_mini_matrices(data,v,i,j){
        data=graph_data;
        xmin=d3.min(data['scat_mat'][v][i]);
        xmax=d3.max(data['scat_mat'][v][i]);
        ymin=d3.min(data['scat_mat'][v][j]);
        ymax=d3.max(data['scat_mat'][v][j]);
        plot_mini_matrix(data.scat_mat[v],xmax,xmin,ymax,ymin,i,j);
        
}
function plot_mini_matrix(data,xmax,xmin,ymax,ymin,l,m){
  var width = 160;  
  var height = 160;
     
  
    var xscale = d3.scaleLinear()
      .domain([xmin, xmax]) 
      .range([0, width]); 

    var yscale = d3.scaleLinear()
      .domain([ymin,ymax])  
      .range([height, 0]);  
    
    var svg = d3.select('#r'+l+''+m).append("svg")
      .attr("width", width + 10)
      .attr("height", height + 20)
    .append("g")
      .attr("transform", "translate(5,1)");

    svg.append("g")
      .attr("transform", "translate(0," + height + ")")
      .call(d3.axisBottom(xscale)); 

    svg.append("g")
      .call(d3.axisLeft(yscale)); 
  
  

	gdata=[];
  for(var i=0;i<data[l].length;i++){
    gdata.push({'p1':data[l][i],'p2':data[m][i]})
  }
  svg.selectAll(".dot")
      .data(gdata)
    .enter().append("circle")
      .attr("class", "point") 
      .attr("cx", function(d, i) { return xscale(d.p1) })
      .attr("cy", function(d) { 
        return yscale(d.p2) })
      .attr("r", 3)
      .style("fill", function(d) { return get_color();});

}

function get_color()
{
  group=$("#d_type")[0].value;
  if(group=='1')
      return 'steelblue';
  else if(group=='2')
      return 'orange';
  else
      return 'green';
}
function clear_graph(){
  d3.select("#graph").selectAll("*").remove()
}
