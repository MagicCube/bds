$ns("bds.ui.view");

$import("lib.d3js.d3");
$import("lib.transit.transit");
$import("bds.ui.view.ChatView");
$import("bds.ui.view.PrecisionMarketingView");

$include("bds.res.ChainView.css");

bds.ui.view.ChainView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "ChainView";
    
    var base = {};
    me.$element = $('<div>');
    me.$container = $('<div id = container>');
    me.precisionMarketingView = null;
    me.chatView = null;
    me.vehicle = null;
    
    me.onclose =null;
    
    var _chainSvg = null;
    
    var _width = null;
    var _height = null;
    var _margin = {
            top: 150,
            right: 200,
            bottom: 0,
            left: 0
    };
    
    var _$legend = null;
    var _showArc = false;
    var _arcs = [];
    var _circles = [];
    var _currentFactor = 0.3;
    var _factorArc = null;
    var _factorText = null;
    var _humanItem = $('<div id = humanItem >');
    var _upItem = $('<div id = upItem ><div id=count></div></div>');
    var _leftItem = $('<div id = leftItem >');
    var _rightItem = $('<div id = rightItem >');
    var _arrow = $('<div id = arrow>');
    var _transferLines = [];
    
    var _linesInfo = {
        delaySecond: 370,
        routeNumber: 31,
        desc: "31-King Rd",
        stops:[
               {
                   id: 7631,
                   desc: "SW 5th & Pine"
               },
               {
                   id:7631,
                   desc:"SW 5th & Washington"
               },
               {
                   id:7631,
                   desc: "SW 5th & Salmon"
               },
               {
                   id:7631,
                   desc:"SW Madison & 4th"
               },
               {
                   id:7631,
                   desc:"SW Madison & 1st"
               },
               {
                   id:7631,
                   desc:"Hawthorne Bridge"
               },
               {
                   id:7631,
                   desc:"SE M L King & Mill"
               }
               ],
        currentStopSeq: 2
    };
    var _selectedLine = null; 
    var _selectStationNames = null;
    var _selectedLineName = null;
    
    var _selectBackground = null;
    var _selectPanel = null;
    var _selectSvg = null;
    var _menuX = 500;
    var _menuY = 200;
    var _currentShow = false;
    var _target = null;
    var _isAnimated = null;
    
    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
       
        var options = p_options;

                
        if (options.width == null) {
            options = {
                width : innerWidth,
                height : innerHeight,
                margin : {
                    top : 0,
                    right : 0,
                    bottom : 0,
                    left : 0
                }
            };
        }
        _width = options.width;
        _height = options.height;
        _margin.bottom = _height / 2;
        
        me.$element.append(me.$container);
        
       
    };
    
    me.setSelectedLine = function(p_line)
    {
        me.vehicle = p_line.vehicle;
//        if( me.precisionMarketingView != null)
//        {
//            me.precisionMarketingView.$container.detach();
//        }
//        if(me.chatView != null)
//        {
//            me.chatView.$container.detach();
//        }
    	me.$container[0].innerHTML = "";
    	_selectBackground = null;
    	_selectPanel = null;
    	_showArc = false;
        if (p_line != null)
        {
            var stops = p_line.stops;
            var stopName = [];
            var i = p_line.currentStopSeq - 1;
            var stopsNumber = i + 5;

            var stopsLength = stopsNumber < stops.length ? stopsNumber : stops.length;
            for (i; i < stopsLength ; i++)
            {
                stopName.push(stops[i].desc);
            }
            
            _selectedLine = {
            	factor: p_line.factor,
                delay: Math.round(p_line.delaySecond / 60),
                car: stopName[0],
                line: "Line" + p_line.routeNumber,
                stationName: stopName,
                transferlines: _forgeTransferlines(),
                strandedPassengers:[null, Math.floor(Math.random()*20) + 1, Math.floor(Math.random()*30) + 1, Math.floor(Math.random()*10) + 1, null, null],
                OD: [
                      {
                          from: stopName[1],
                          to: stopName[2],
                          number: Math.random() * 15 + 1
                      },
                      {
                          from: stopName[1],
                          to: stopName[3],
                          number: Math.random() * 5 + 1
                      },
                      {
                          from: stopName[1],
                          to: stopName[4],
                          number: Math.random() * 40 + 1
                      }
                 ]
                
            };
            
            _selectedLineName = _selectedLine.line;
            

            _initGraphics();
            _initFailedRoute();
            _initStrandedPassengers();
            _initTransferRoute();
            _initButton();
            _initChain();
            me.setFactor(_selectedLine.factor);
            
        }
    };
    
    me.setFactor = function(factor) //like 0.3, not %
    {
        _currentFactor = factor;
        innerArc = d3.svg.arc().innerRadius(0).outerRadius(62).startAngle(- Math.PI / 2).endAngle(- Math.PI / 2 + _currentFactor * Math.PI);
        _factorArc.attr('d',innerArc);
        _factorText.text( parseInt(_currentFactor * 100) + '%');
    };
    
    function _forgeTransferlines(){
    	var line = [null,null,null,null,null];
    	var numbers = [];
    	for(var i = 1; i< 4; i++)
		{
    		var num = Math.round(Math.random() * 2);
    		if(num > 0)
    		{
    			line[i] = [];
    			for(var m = 0 ; m < num; m++)
    			{
					var tempNum = parseInt(Math.random() * 10 + 1);
					console.log(numbers.indexOf(tempNum));
					console.log(numbers);
    				while(numbers.indexOf(tempNum) > -1)
					{
    					tempNum = parseInt(Math.random() * 10 + 1);
					}
    				numbers.push(tempNum);
    				line[i][m] = "Line " + tempNum;
    			}
    		}
		}
    	return line;
    }
       
    function _initGraphics()
    {
        _$legend = $("<div id=legendDiv></div>");
        me.$container.append(_$legend); 
        
        var imgPath = me.getResourcePath("images.graphic", "png");
        var $grahicsDiv = $("<div id=graphics class=row></div>");
        $grahicsDiv.append("<span class=text>Graphics: O</span>");
        $grahicsDiv.append("<img id=colorschema src="+ imgPath +">");   
        $grahicsDiv.append("<span class=text>D</span>");
        
        _$legend.append($grahicsDiv);
    }
    
    function _initFailedRoute()
    {
        var $failedRouteDiv = $("<div id=failedRoute class=row></div>");
        var span = $("<span class=text></span>");
        $failedRouteDiv.append(span);
        var text = "Route: " + _selectedLineName;
        span.text(text);
        _$legend.append($failedRouteDiv);
    }
    
    function _initStrandedPassengers()
    {
        var imgPath = me.getResourcePath("images.strandedpassenger", "png");
        var $strandedPassengersDiv = $("<div id=strandedPassengers class=row></div>");
        $strandedPassengersDiv.append("<img id=passenger src="+ imgPath +">");
        $strandedPassengersDiv.append("<span class=text>: Stranded Passengers</span>");
        _$legend.append($strandedPassengersDiv);        
    }
    
    function _initTransferRoute()
    {
        var imgPath = me.getResourcePath("images.transferline", "png");
        var $transferRouteDiv = $("<div id=transferRoute class=row></div>");
        $transferRouteDiv.append("<img id=passenger src="+ imgPath +">");
        $transferRouteDiv.append("<span class=text>: Transfer Route</span>");
        _$legend.append($transferRouteDiv); 
    }
    
    
    function _initButton()
    {
        var $btnDiv = $("<div id=ODBtn class=button>O D</div>");
        me.$container.append($btnDiv);
        $btnDiv.on("click", _onButtonclick);
        
        var $closeDiv = $("<div id=closeBtn class=button></div>");
        $closeDiv.on("click", function(){
            me.trigger('close');
        });
        me.$container.append($closeDiv);
    }
    
    var distance = null;
    var xAxisScale = null;
    var tipHeight = null;
    function _initChain()
    {
        _selectStationNames = _selectedLine.stationName;
        
        _chainSvg = d3.select('#' + me.$container.attr('id')).append('svg')
                        .attr("width", _width)
                        .attr("height", _height)
                        .attr("top", 0)
                        .attr("left", 0);  
        
        tipHeight = _height / 2;    
        
        var xAixsEnd= _width - _margin.right;
        var line = _selectedLine.line;
        var $selectLineDiv = $("<div class=line>" + line + "</div>");
        $selectLineDiv.css({
            top: tipHeight- 25,
            left: xAixsEnd + 5,
            background: "#00cccc"
        });
        me.$container.append($selectLineDiv);        

        var xAixsLastLineLeft = xAixsEnd + 5 + 70 + 5;
        var $xAixsLastLineDiv = $("<div class=line></div>");
        $xAixsLastLineDiv.css({
            height: 10,
            width: _width - xAixsLastLineLeft,
            top: tipHeight - 5,
            left: xAixsLastLineLeft,
            background: "#00cccc"
        });
        me.$container.append($xAixsLastLineDiv);
        
        xAxisScale = d3.scale.ordinal()
                             .domain(_selectStationNames)
                             .rangeBands([0, xAixsEnd]);
        
        distance = xAxisScale(_selectStationNames[1]) - xAxisScale(_selectStationNames[0]);  //distance between two stations     
        
        var xAxis = d3.svg.axis().scale(xAxisScale).orient('bottom').tickSize(8,0);
        _chainSvg.append("g")
               .attr("class", "axis")
               .attr("transform", "translate(0,"+ tipHeight  +")")
               .call(xAxis)
               .selectAll("text")  
               .attr('y', 35);
        
        var carIndex =  _selectedLine.stationName.indexOf(_selectedLine.car);
        for(var i = carIndex + 1; i < carIndex + 4; i++)
        {
            var currentStationleft = xAxisScale(_selectedLine.stationName[i]) + distance / 2;
            var $passenger = $('<div class=passenger>');
            $passenger.attr("id", "p" + i);
            var passengerleft = currentStationleft - 50;
            $passenger.css({
                'position': 'absolute',
                'top': tipHeight + 50,
                'left': passengerleft,
                'width': 100,
                'height':100,
                'background': 'url(' + mx.getResourcePath("bds.res.images.passenger_none", "png") + ')',
                'cursor': 'pointer'
            });
            console.log("click here");
            $passenger.on('click',_clickPassenger);
            me.$container.append($passenger);
            
            if (i == (carIndex + 1))
            {
                var $delayDiv = $("<div>");
                $delayDiv.css({
                    'position': 'absolute',
                    'top': tipHeight - 114 - 20,
                    'left': currentStationleft - 42,
                    'width': 89,
                    'height':114,
                    'background': 'url(' + mx.getResourcePath("bds.res.images.delay", "png") + ')'                  
                });
                $delayDiv.append("<span class=delay>Delayed</span>");
                var $delaymin = $("<span class=delay></span>");
                $delaymin.text(_selectedLine.delay+"min");
                $delayDiv.append($delaymin);                
                me.$container.append($delayDiv);
            }
            
            var $passengerNumDiv = $("<div class=passengerNumber>");
            $passengerNumDiv.css({
                'position': 'absolute',
                'id': 'passenger' + i,
                'top': tipHeight + 50 + 50,
                'left': passengerleft + 48,
                'width': 46,
                'height': 46,
                "line-height": "46px",
                "text-align": "center",
                "color": "black",
                "cursor": "pointer"
            });
            var text = "=" + _selectedLine.strandedPassengers[i];
            $passengerNumDiv.text(text);
            $passengerNumDiv.attr("id", "p" + i);
            $passengerNumDiv.on('click',_clickPassenger);
            me.$container.append($passengerNumDiv);
            
            _chainSvg.append("circle")
                .style("stroke", "#ff0000")
                .style("stroke-width", 2)
                .style("fill", "white")
                .attr("r", 6)
                .attr("cx", xAxisScale(_selectedLine.stationName[i]) + distance / 2)
                .attr("cy", tipHeight);
        }
        
        _drawCar();   
        _drawTransferLines();
       
    }
    
    function _drawCar()
    {
        var carPosition= {
            x: xAxisScale(_selectStationNames[1]),
            y: _height / 2
        };
        
         _drawFactor(carPosition);
        
        var $bus = $("<div id = 'carDiv' class=car></div>");
        $bus.css({
            top: carPosition.y - 45,
            left: carPosition.x - 70,
            cursor: 'pointer'
        });
        $bus.on('click',_clickPassenger);
        me.$container.append($bus);
        
    }
    
    
    function _drawTransferLines()
    {
    	if (_transferLines.length != 0)
		{
    		for (var i = 0; i < _transferLines.length; i++)
			{
    			var trans = _transferLines[i];
    			trans.remove();
			}
    		_transferLines = [];
		}
        var transferLines = _selectedLine.transferlines;
        var originY = null;          
        var lineIndex = 0;
        console.log(transferLines);
        for (var i = 0; i < transferLines.length; i++)
        {
            if (transferLines[i] != null)
            {
                var originX = xAxisScale(_selectStationNames[i]) + distance / 2;  
                for (var j = 0; j < transferLines[i].length; j++)
                {
                    var top = null;
                    var linePoints = [];
                    if (j == 0)
                    {
                        originY = _height / 2 + 5;
                        desY = _height / 2 + 250;
                        top = desY;
                    }
                    else
                    {
                        originY = _height / 2 - 5;
                        desY = _height / 2 - 250;
                        top = desY - 50;
                    }
                    linePoints.push({"x": originX, "y": originY});
                    linePoints.push({"x": originX, "y": desY});
                    var lineName = transferLines[i][j];
                    _drawTransferLine(lineName,linePoints, top, lineIndex);
                    lineIndex ++;
                }
            }
        }
    }
    
    
    function _drawTransferLine(p_lineName, p_linePoints, p_top, lineIndex)
    {
        var colorArray = ["red", "green", "#00ce7d", "yellow", "#CC0048"];
        var line = d3.svg.line()
                        .x(function(d) { return d.x;})
                        .y(function(d) { return d.y;})
                        .interpolate("basis");

        _chainSvg.append("path")
            .attr("d", line(p_linePoints))
            .attr("stroke", colorArray[lineIndex%5])
            .attr("stroke-width", 2)
            .attr("fill", "none");
        
        var left = p_linePoints[1].x - 35;
        var $lineDiv = $("<div id='"+ lineIndex % 5 +"' class=line >" + p_lineName + "</div>");
        $lineDiv.css({
            top: p_top,
            left: left,
            background: colorArray[lineIndex%5]
        });
        _transferLines.add($lineDiv);
        me.$container.append($lineDiv);
    }
    
    function _drawArc()
    {
        if(_isAnimated)
    	{
        	return;
    	}
        if(_showArc == true)
        {
            _showArc = false;
            _isAnimated = true;
            $('.arc').transit({opacity:0},300);
            $('.axiscircle').transit({opacity:0},300,function(){
            	$.each(_arcs,function(i,d){d.remove();});
                $.each(_circles,function(i,d){d.remove();});
                _isAnimated = false;
            });
            return;

        }
        var odVolumes = [];
        var odVolume = [];
        var fodVolume =[];
        var xAxisVolumeScale=null;
        
        for (var i = 0; i < _selectedLine.OD.length; i++)
        {
            
            fodVolume.push(_selectedLine.OD[i].number);
            
        }
        var s = eval(fodVolume.join('+'));
        odVolumes.push(s);
        odVolume.push(s);
        for (var i = 0; i < _selectedLine.OD.length; i++)
        {
            
            odVolume.push(_selectedLine.OD[i].number);
            
        }
        for (var i = 0; i < _selectedLine.OD.length; i++)
        {
            
            odVolumes.push(_selectedLine.OD[i].number);
            
        }  
        var SortedodVolumes = odVolumes.sort();

        xAxisVolumeScale = d3.scale.linear().domain([ d3.min(SortedodVolumes), d3.max(SortedodVolumes) ]).range([ 10, 30 ]);
        
        
        var radius = distance / 2;
        var gradient = _chainSvg.append("svg:defs")
            .append("svg:linearGradient")
            .attr("id", "gradient")
            .attr("x1", "0%")
            .attr("y1", "0%")
            .attr("x2", "100%")
            .attr("y2", "100%")
            .attr("spreadMethod", "pad");
       
        gradient.append("svg:stop")
              .attr("offset", "0%")
              .attr("stop-color", "#00ffff")
              .attr("stop-opacity", 0.9);
           
        gradient.append("svg:stop")
              .attr("offset", "100%")
              .attr("stop-color", "#ffff00")
              .attr("stop-opacity", 0.9);
        
        for(var i = 0; i< _selectedLine.OD.length;i++)
        {
            for(var i = 0; i < _selectedLine.OD.length;i++)
            {
                var from = xAxisScale(_selectedLine.OD[i].from) +  radius ;
                var to =  xAxisScale(_selectedLine.OD[i].to) + radius;
                var arcHeight = xAxisVolumeScale(odVolume[i+1]);
                var innerPoints = [{x: from + arcHeight ,y: tipHeight},{x: to - arcHeight,y: tipHeight},{x: to + arcHeight,y: tipHeight},{x: from - arcHeight,y: tipHeight}];
                var matrix = _createPointsMatrix(innerPoints,320 - i* 160, arcHeight);
                var arc = _chainSvg.append("path")
                  .attr("class", "arc")
                  .attr('d',createPath(matrix))
                  .style('fill',  "url(#gradient)")
                  .style('opacity',0);
                _arcs.push(arc);
            }
            
        }
        
        var carIndex =  _selectedLine.stationName.indexOf(_selectedLine.car);
        for(var i = carIndex + 1; i < _selectedLine.stationName.length; i++)
        {
            
         var circle = _chainSvg.append("circle")
            .attr("class", "axiscircle")
            .attr('cx',xAxisScale(_selectedLine.stationName[i]) + radius)
            .attr('cy',tipHeight)
            .attr('r', xAxisVolumeScale(odVolume[i-1-carIndex]))
            .style('stroke','white')
            .style('opacity',0);
         
         if(i == carIndex + 1)
         {
             circle.style('fill','#00ffff');
         }
         else
         {
             circle.style('fill','#ffff00');
         }
         
         _circles.push(circle);
        }
        
        _isAnimated = true;
        $('.arc').transit({opacity:1},300);
        $('.axiscircle').transit({opacity:1},300,function(){
        	_isAnimated = false;
        });
        _showArc = true;
        
    }
    
    function _drawFactor(carPosition)
    {
        var outerArc = d3.svg.arc().innerRadius(0).outerRadius(62).startAngle(- Math.PI / 2).endAngle(Math.PI / 2);
        _chainSvg.append('path').attr('class','path').attr('id','arcStyle').attr('d', outerArc).attr('transform','translate(' + (carPosition.x - 25) +','+ (carPosition.y - 60) +')').style('fill','#304454').style('opacity','0.8');
        innerArc = d3.svg.arc().innerRadius(0).outerRadius(62).startAngle(- Math.PI / 2).endAngle(- Math.PI / 2 + _currentFactor * Math.PI);
        _factorArc =_chainSvg.append('path').attr('class','path').attr('d', innerArc).attr('transform','translate(' + (carPosition.x - 25) +','+ (carPosition.y - 60) +')').style('fill','#c1272d').style('opacity','0.8');
        _chainSvg.append('text').attr('transform','translate(' + (carPosition.x - 70) +','+ (carPosition.y - 70) +')').attr('width',100).attr('height',62).style('fill','white').text('Load Factor');
        _factorText = _chainSvg.append('text').attr('transform','translate(' + (carPosition.x - 40) +','+ (carPosition.y - 90) +')').attr('width',100).attr('height',62).style('fill','white').text( _currentFactor * 100 + '%');
        
    }

    
    function _clickPassenger(e)
    {
        if (e.target.className == "passengerNumber")
        {
            var $target = $(".passenger#" + e.target.id);
            _menuX = parseInt($target.css('left'));
            _menuY = parseInt($target.css('top'));
        }
        else
        {
            _menuX = parseInt($(e.target).css('left').split('px')[0]);
            _menuY = parseInt($(e.target).css('top').split('px')[0]);
        }
        _target = $(e.target).attr('id');
        if(_selectBackground == null)
        {
            console.log('come here');
            _selectBackground = $('<div id = selectBackground>');
            _selectBackground.css({
                'position': 'absolute',
                'top': 0,
                'left': 0,
                'width': _width,
                'height': _height,
                'background': 'black',
                'opacity': 0.7,
                'z-index': 999
            });
            _selectPanel = $('<div id = selectPanel>');
            _selectPanel.css({
                'position': 'absolute',
                'left':_menuX -106.27,
                'top': _menuY - 92.65,
                'width': 303,
                'height': 322,
                'z-index': 9999,
            });
            
            
            me.$container.append(_selectPanel);
            me.$container.append(_selectBackground);
            
            _selectSvg =d3.select('#selectPanel').append('svg').attr('id','selectSvg').attr('width','100%').attr('height','100%');
           

                    
            _selectSvg.append("circle")
            .attr("class", "circle")
            .attr('cx',151.27)
            .attr('cy',152.65)
            .attr('r', 65)
            .style('fill','#2F4F4F')
            .style('z-index',9999)
            .style('stroke','white')
            .style('stroke-width','6px')
            .style('stroke-opacity','0.7');
            
            _selectSvg.append("circle")
            .attr("class", "circle")
            .attr('cx',151.77 )
            .attr('cy',152.65)
            .attr('r', 144.65)
            .style('fill','none')
            .style('stroke','#b6c1c6')
            .style('stroke-width','6px')
            .style('stroke-opacity','1');
            
          
  
            _humanItem.css({
                'position': 'absolute',
                'top':  112.65,
                'left': 117.27,
                'width': 74,
                'height': 74,
               // 'background': 'url('+ mx.getResourcePath("bds.res.images.passenger", "png") +')',
                'z-index': 99999,
            });
            
            _arrow.css({
                'position': 'absolute',
                'top':  -11 ,
                'left': 126.77,
                'width': 50,
                'height': 30,
                'background': 'url('+ mx.getResourcePath("bds.res.images.triangle", "png") +')',
                'z-index': 99999,
            });
            
            _upItem.css({
                'position': 'absolute',
                'top':  10.5,
                'left': 29.77,
                'width': 243,
                'height': 100,
                'cursor': 'pointer'
               // 'background': 'url('+ mx.getResourcePath("bds.res.images.coupon", "png") +')',
            });
            
            _leftItem.css({
                'position': 'absolute',
                'top': 83.94,
                'left': 10,
                'width': 139,
                'height': 210,
            });
            
            _rightItem.css({
                'position': 'absolute',
                'top':  83.94,
                'left': 154.98,
                'width': 139,
                'height': 210,
            });
            
            me.precisionMarketingView = new bds.ui.view.PrecisionMarketingView({ 
                frame: {     
                left: -84,
                top: -154,
                width: 500,
                height: 133
            }});
            
            me.chatView = new bds.ui.view.ChatView({
                frame: {
                    left: -60,
                    top: -300,
                    width:460,
                    height:270
                }
            });
            
            me.addSubview(me.chatView, _selectPanel);
            me.chatView.$element.hide();
            me.precisionMarketingView.$element.hide();
           _selectPanel.append(me.precisionMarketingView.$element);
           _selectPanel.append(_upItem);
           _selectPanel.append(_leftItem);
           _selectPanel.append(_rightItem);
           _selectPanel.append(_humanItem);
           _selectPanel.append(_arrow);
          
           _currentShow = true;
           _arrow.hide();
           
 
           _upItem.on('click', function()
           {
               
               if (_target != 'carDiv')
               {
                   me.precisionMarketingView.$element.show();
                   $("#PrecisionMarketing").css({
                       scale : 0.1,
                   }, 0);
                   
                   $("#PrecisionMarketing").transit({
                       scale : 1,
                   }, 325);
               }
               else
               {
                   me.chatView.$element.show();
                   $(".ChatView").css({
                       scale : 0.1,
                   }, 0);
                   
                   $(".ChatView").transit({
                       scale : 1,
                   }, 325, function()
                   {
                       me.chatView.setVehicle(me.vehicle);
                   });
               }
               _arrow.show();
             
           });
           
           _selectBackground.on('click', function(){
               _selectBackground.hide();
               _selectPanel.hide();
               if(me.precisionMarketingView != null)
               {
                   me.precisionMarketingView.$element.hide();
               }
               if(me.chatView != null)
               {
                   me.chatView.$element.hide();
               }
               _arrow.hide();
               _currentShow = false;
           });
           
        }
        else if(_currentShow == false)
        {
            _selectPanel.show();
            _selectBackground.show();
            _selectPanel.css({
                'top': _menuY -92.65,
                'left': _menuX -106.27
                });
            
            _currentShow = true;
        }
        
        me.chatView.setVehicle(me.vehicle);
        
        if(_target == 'carDiv')
        {
            me.$container.find("#count").text(me.vehicle.messages.length);
            _humanItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.bus_center", "png") +')'
                });
            _upItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.bus_msg", "png") +')'
                });
            _leftItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.bus_maintenance", "png") +')'
                });
            _rightItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.bus_crew", "png") +')'
                });
        }
        else
        {
            me.$container.find("#count").text("");
            _humanItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.passenger", "png") +')',
                });
            _upItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.coupon", "png") +')',
                });
            _leftItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.ticket", "png") +')'
                });
            _rightItem.css(
                {
                    'background': 'url('+ mx.getResourcePath("bds.res.images.msg", "png") +')'
                });
        }
        
        _selectPanel.transit({
            scale: 0.1,
            rotate: '180deg'
        },0); 
        
        _selectPanel.transit({
            scale: 1,
            rotate: '0deg'
        },500); 
        
    }
    
    function _createPointsMatrix(points,innerHeight,arcHeight){
        var matrix = [];
        for(var i = 0; i < points.length - 1; i++)
        {
            matrix.push(points[i]);
            if(i != 1)
            {
                var firstPoint = null;
                var secondPoint = null;
                if(i == 0)
                {
                    //{x:(from + to) / 2, y: tipHeight - radius * (1.5 + i)}
                    firstPoint = {x: points[i].x ,y: innerHeight};
                    secondPoint = {x: points[i + 1].x ,y:innerHeight};
                }
                else if(i%2 == 0)
                {
                    firstPoint = {x: points[i].x ,y: innerHeight - 2 * arcHeight};
                    secondPoint = {x: points[i + 1].x ,y:innerHeight - 2 * arcHeight};
                }
                matrix.push(firstPoint);
                matrix.push(secondPoint);
            }
        }
        matrix.push(points[points.length - 1]);
        return matrix;
    }
    
    
    function createPath(points)
    {
        var d = "M";
        for(var i = 0; i< points.length; i++)
        {
            d +=  points[i].x;
            d +=  ',';
            d +=  points[i].y;
            d +=  ' ';
            if(i == 3)
            {
                d += 'L';
            }
            else if(i == points.length - 1)
            {
                d += 'Z';
            }
            else if(i == 0 || i == 4)
            {
                d += 'C';
            }
        }
        return d;
    }
   
    
    function _onButtonclick(e)
    {
        var id = e.currentTarget.id;
        var $button = me.$container.find("#" + id);
        if ($button.hasClass("selected"))
        {
            $button.removeClass("selected");            
        }
        else
        {
            $button.addClass("selected");
        }
        _drawArc();
    }
    
    return me.endOfClass(arguments);
};
bds.ui.view.ChainView.className = "bds.ui.view.ChainView";
