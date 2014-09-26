$ns("bds.ui.view");

$import("lib.d3js.d3");

$include("bds.res.PassengersChartView.css");

bds.ui.view.PassengersChartView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "PassengersChartView";
    var base = {};

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        _initPassengersChartView();
    };

    var _station = null;
    var _timer = null;
    me.loadPassengers = function(p_station)
    {
        if (typeof p_station == 'undefined' || p_station == null) {
            _station = null;
        } else {
            _station = p_station;
        }
        _updateTitle(_station);
        if (_timer != null) {
            window.clearInterval(_timer);
            _timer = null;
        }
        if (_timer == null) {
            _updateChart();
            _timer = window.setInterval(function() {
                _updateChart();
            }, 30 * 1000);
        }
    };

    me.loadHistory = function()
    {
        _updateHist();
    };

    me.update = function()
    {
        _updateChart();
    };

    var _$svg = null;
    var _$title = null;

    var _yAxisWidth = 46;
    var _titleHeight = 66;
    var _xAxisHeight = 46;
    var _rightMargin = 24;
    var _chartWidth = null;
    var _hours = 24;
    var _unitWidth = null;

    function _initPassengersChartView()
    {
        _chartWidth = me.frame.width - _yAxisWidth - _rightMargin;
        _chartHeight = me.frame.height - _titleHeight - _xAxisHeight;
        _unitWidth = _chartWidth / _hours;

        _initCanvas();
        _initMappingFunc();
        _initChart();
        _initGrid();
        _initLegend();
        _initTitle();
        _initXAxis();
        _initYAxis();
        _initIndicator();
    }

    function _initCanvas()
    {
        _$svg = d3.select(me.$element[0]).append('svg')
            .attr('class', 'svg');
        _$svg.style(
        {
            width   : "100%",
            height  : "100%"
        }        
        );
    }

    function _initChart()
    {
        _$chart = _$svg.append('g')
            .attr('calss', 'chart')
            .attr('transform', 'translate('+ _yAxisWidth +', '+ _titleHeight +')');
        _$chart.append('path')
            .datum([])
            .attr('class', 'historical_area');
        _$chart.append('path')
            .datum([])
            .attr('class', 'historical_line');
        _$chart.append('path')
            .datum([])
            .attr('class', 'realtime_line');
        _$chart.append('path')
            .datum([])
            .attr('class', 'realtime_area');
        _$chart.append('path')
            .datum([])
            .attr('class', 'forecast');
    }

    var yMapping = null;
    var yHistArea = null;
    var yHistLine = null;
    var yRealArea = null;
    var yRealLine = null;
    var yForecast = null;
    var _date  = null;

    function _initMappingFunc()
    {
        yMapping = d3.scale.linear()
            .range([_chartHeight, 0])
            .domain([0, 100]);
        yHistArea = d3.svg.area()
            .x(function(d, i) { return i * _unitWidth; })
            .y0(_chartHeight)
            .y1(function(d) { return yMapping(d); })
            .interpolate('basis');
        yHistLine = d3.svg.line()
            .x(function(d, i) { return i * _unitWidth; })
            .y(function(d, i) { return yMapping(d); })
            .interpolate('basis');
        yRealArea = d3.svg.area()
            .x(function(d, i) { 
                if (_station == null) {
                    if (i == me.areal.length - 1) { return (i-1) * _unitWidth + _date.getMinutes() / 60 * _unitWidth; }
                    return i * _unitWidth;
                } else {
                    if (i == me.real.length - 1) { return (i-1) * _unitWidth + _date.getMinutes() / 60 * _unitWidth; }
                    return i * _unitWidth;
                }
             })
            .y0(_chartHeight)
            .y1(function(d) { return yMapping(d); });
        yRealLine = d3.svg.line()
            .x(function(d, i) {
                if (_station == null) {
                    if (i == me.areal.length - 1) { return (i-1) * _unitWidth + _date.getMinutes() / 60 * _unitWidth; }
                    return i * _unitWidth;
                } else {
                    if (i == me.real.length - 1) { return (i-1) * _unitWidth + _date.getMinutes() / 60 * _unitWidth; }
                    return i * _unitWidth;
                }
             })
            .y(function(d, i) { return yMapping(d); });
        yForecast = d3.svg.line()
            .x(function(d, i) {
                if (_station == null) {
                    if (i == me.areal.length - 1) { return (i-1) * _unitWidth + _date.getMinutes() / 60 * _unitWidth; }
                    return (i - 1) * _unitWidth;
                } else {
                    if (i == me.real.length - 1) { return (i-1) * _unitWidth + _date.getMinutes() / 60 * _unitWidth; }
                    return (i - 1) * _unitWidth;
                }
            })
            .y(function(d, i) { return yMapping(d); })
            .defined(function(d) { return d != null; });
    }

    me.hist = [];
    me.real = [];
    me.fore = [];
    me.ahist = [];

    function _updateHist()
    {
        var random = [0, 0, 0, 6, 15, 35, 42, 81, 60, 38, 33, 37, 32, 20, 24, 32, 42, 79, 55, 35, 17, 7, 2, 0];
        if (_station == null) {
            if (me.ahist.length == 0) {
                me.ahist = random.map(function(d) {
                    if (0 == d) return 0;
                    else return Math.abs((Math.floor(Math.random() * 20) - 10) + d);
                });
                me.ahist.push(me.ahist[0]);
            }
            _$chart.select('.historical_area')
                .datum(me.ahist)
                .attr('d', yHistArea);
            _$chart.select('.historical_line')
                .datum(me.ahist)
                .attr('d', yHistLine);
        } else {
            me.hist = random;
            me.hist = me.hist.map(function(d) {
                if (0 == d) return 0;
                else return Math.abs((Math.floor(Math.random() * 20) - 10) + d);
            });
            me.hist.push(me.hist[0]);
            _$chart.select('.historical_area')
                .datum(me.hist)
                .attr('d', yHistArea);
            _$chart.select('.historical_line')
                .datum(me.hist)
                .attr('d', yHistLine);
        }
        _updateYAxis();
    }

    me.areal = [];
    function _updateReal()
    {
        _date = bds.ui.app.getTime();
        var h = _date.getHours();
        if (_station == null) {
            if (me.areal.length == 0) {
                me.areal = me.ahist.map(function(d) { 
                    if (0 == d) return 0; 
                    else return Math.floor((d - Math.floor(Math.random() * 10 ) + 10) * 100 / 110);
                });
            }
            var value = me.areal[h] + ((me.areal[h+1] - me.areal[h]) * _date.getMinutes() / 60);
            me.areal.length = h + 1;
            me.fore = me.ahist.map(function(d) { 
                if (0 == d) return 0;
                else return Math.floor((d - Math.floor(Math.random() * 5 ) + 5) * 100 / 110);
            });
            me.areal.push(value);
            for (var i = 0; i < me.areal.length - 1; i++) {
                me.fore[i] = null;
            }
             me.fore.insert(me.areal.length - 1, value);
            _$chart.select('.realtime_area')
                .datum(me.areal)
                .attr('d', yRealArea);
            _$chart.select('.realtime_line')
                .datum(me.areal)
                .attr('d', yRealLine);
            _$chart.select('.forecast')
                .datum(me.fore)
                .attr('d', yForecast);
        } else {
            me.real = me.hist.map(function(d) { 
                if (0 == d) return 0; 
                else return Math.floor((d - Math.floor(Math.random() * 10 ) + 10) * 100 / 110);
            });
            var value = me.real[h] + ((me.real[h+1] - me.real[h]) * _date.getMinutes() / 60);
            me.real.length = h + 1;
            me.fore = me.hist.map(function(d) { 
                if (0 == d) return 0;
                else return Math.floor((d - Math.floor(Math.random() * 5 ) + 5) * 100 / 110);
            });
            me.real.push(value);
            for (var i = 0; i < me.real.length - 1; i++) {
                me.fore[i] = null;
            }
             me.fore.insert(me.real.length - 1, value);
            _$chart.select('.realtime_area')
                .datum(me.real)
                .attr('d', yRealArea);
            _$chart.select('.realtime_line')
                .datum(me.real)
                .attr('d', yRealLine);
            _$chart.select('.forecast')
                .datum(me.fore)
                .attr('d', yForecast);
        }
    }

    function _updateBubble()
    {
        var c = {
            x: (function(d) {
                if (_station == null) {
                    return (me.areal.length - 2) * _unitWidth + (_date.getMinutes() / 60 * _unitWidth);
                } else {
                    return (me.real.length - 2) * _unitWidth + (_date.getMinutes() / 60 * _unitWidth);
                }
            })(),
            y: (function(d) {
                if (_station == null) {
                    return yMapping(me.areal[me.areal.length - 1]);
                } else {
                    return yMapping(me.real[me.real.length - 1]);
                }
            })()
        };
        _$chart.select('.bubble')
            .style('opacity', 1)
            .attr('transform', function(d) {
            return 'translate('+ (c.x - 25) +','+ (c.y - 40) +')';
        });
        _$chart.select('.bubble text').text(function() {
            return Date.format(_date, "HH:mm");
        });
        _$chart.select('.indicator line')
            .attr('x1', c.x)
            .attr('y1', _chartHeight)
            .attr('x2', c.x)
            .attr('y2', c.y);
    }

    var _timer = null;
    function _updateChart()
    {
        _updateHist();
        _updateReal();
        _updateBubble();
    }

    var _$bubble = null;
    var _$indicator = null;
    function _initIndicator()
    {
        _$bubble = _$chart.append('g')
            .attr('class', 'bubble');
        _$bubble.append('path')
            .attr('d', 'M0,0 L0,30 L20,30 L25,35 L30,30 L50,30 L50,0 L0,0 Z M0,0');
        _$chart.select('.bubble').style('opacity', '0');
        _$bubble.append('text')
            .text('')
            .attr( 'x', 4 )
            .attr( 'y', 20 );
        _$indicator = _$chart.append('g')
            .attr('class', 'indicator');
        _$indicator.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 0)
            .attr('y2', 0)
            .attr('stroke', '#f6c233')
            .attr('stroke-width', 1)
            .attr('stroke-dasharray', '5 5');
    }

    function _initXAxis()
    {
        var x = d3.scale.ordinal()
            .domain(d3.range(0, _hours))
            .range(d3.range(0, _hours).map(function(d) {
                return d * _unitWidth; 
            }));
        var xAxis = d3.svg.axis()
            .scale(x)
            .tickFormat(function(d) {
                return d3.format("02d")(d) + ":00";
            })
            .orient('bottom');
         _$svg.append('g').attr('class', 'xaxis')
            .attr('transform', 'translate('+ _yAxisWidth +', '+ (_chartHeight + _titleHeight) +')')
            .call(xAxis);
    }

    function _initYAxis()
    {
        var yScale = d3.scale.ordinal()
            .domain(d3.range(0, 3).reverse())
            .range(d3.range(0, 3).map(function(d) { return d * ((_chartHeight - 24) / 2); }));
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat(function(d, i) {
                return "";
            })
            .orient('left');
        _$svg.append('g')
            .attr('class', 'yaxis')
            .attr('transform', 'translate('+ _yAxisWidth +', '+ (_titleHeight + 24) +')')
            .call(yAxis);
    }

    function _updateYAxis()
    {
        var yScale = d3.scale.ordinal()
            .domain(d3.range(0, 3).reverse())
            .range(d3.range(0, 3).map(function(d) { return d * ((_chartHeight - 24) / 2); }));

        var index = Math.floor(Math.random() * 4);
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat(function(d, i) {
                if (_station == null) {
                    return (d == 0) ? "0" : d * 300;
                } else {
                    return d * ([30, 35, 40, 45][index]);
                }
            })
            .orient('left');;
        _$svg.selectAll('.yaxis')
            .attr('transform', 'translate('+ _yAxisWidth +', '+ (_titleHeight + 24) +')')
            .call(yAxis);
    }

    function _initGrid()
    {
        var ys = d3.range(0, 3).map(function(d) { return d * ((_chartHeight - 24) / 2); });
        var grids = ys.map(function(d) { return [0, d, _chartWidth, d]; });
        grids.push([0, -24, 0, _chartHeight - 24]);
        var $grids = _$chart.insert('g')
            .attr('class', 'grid')
            .attr('transform', 'translate(0, 24)');
        $grids.selectAll('line')
            .data(grids)
            .enter()
            .append('line')
            .attr('x1', function(d) { return d[0]; })
            .attr('y1', function(d) { return d[1]; })
            .attr('x2', function(d) { return d[2]; })
            .attr('y2', function(d) { return d[3]; });
    }

    function _initLegend()
    {
        var _$legend = _$svg.append('g')
            .attr('class', 'legend')
            .attr('transform', 'translate('+ (_chartWidth + _yAxisWidth - 307) +', '+ _titleHeight * 0.3 +')');
        var $h = _$legend.append('g');
        $h.append('rect')
            .attr('width', 10)
            .attr('height', 20)
            .attr('fill', '#82fef1')
            .attr('fill-opacity', 0.2)
            .attr('stroke', '#82fef1');
        $h.append('text')
            .text('Historical')
            .attr('transform', 'translate(20, 15)');
        var $r = _$legend.append('g')
            .attr('transform', 'translate(100, 0)');
        $r.append('rect')
            .attr('width', 10)
            .attr('height', 20)
            .attr('fill', '#f6c233')
            .attr('fill-opacity', 0.2)
            .attr('stroke', '#f6c233');
        $r.append('text')
            .text('Real-time')
            .attr('transform', 'translate(20, 15)');
        var $f = _$legend.append('g')
            .attr('transform', 'translate(200, 0)');
        $f.append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', 15)
            .attr('y2', 0)
            .attr('stroke', '#f6c233')
            .attr('stroke-width', 2)
            .attr('stroke-dasharray', '5 5')
            .attr('transform', 'translate(0, 10)');
        $f.append('text')
            .text('Forecast')
            .attr('transform', 'translate(20, 15)');
    }

    function _initTitle()
    {
        var $title = _$svg.append('g')
            .attr('transform', 'translate('+ _yAxisWidth +', '+ _titleHeight * 0.5 +')');
        var $mainTitle = $title.append('text')
            .attr('class', 'title')
            .text('BRIM Passengers');
        //TODO title width
        _$title = $title.append('text')
            .attr('class', 'subtitle')
            .attr('transform', 'translate('+ 150 +', 0)')
            .text('');
    }

    function _updateTitle(p_name)
    {
        if (p_name == null || typeof p_name == 'undefined') {
            _$title.text('');
        } else {
            _$title.text('- ' + p_name);
        }
    }

    return me.endOfClass(arguments);
};
bds.ui.view.PassengersChartView.className = "bds.ui.view.PassengersChartView";
