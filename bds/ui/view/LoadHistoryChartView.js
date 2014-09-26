$ns("bds.ui.view");

$import("lib.d3js.d3");

$include("bds.res.LoadHistoryChartView.css");

bds.ui.view.LoadHistoryChartView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "LoadHistoryChartView";
    var base = {};

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);

        _initHistoryChartView();
    };

    me.plateNumber = null;
    me.routeId = null;
    me.stops = null;
    var _nextStopSeq = null;
    me.setVehicle = function(p_vehicle)
    {
        me.plateNumber = p_vehicle.plateNumber;
        me.routeId = p_vehicle.route.route;
        me.stops = p_vehicle.routeLine.stops;
        _nextStopSeq = p_vehicle.lastStopSeq;
        if (_nextStopSeq != null) {
            _updateHistoryChartView();
        }
    };

    var _yAxisWidth = 46;
    var _xAxisHeight = 60;
    var _titleHeight = 66;
    var _rightMargin = 24;
    var _chartWidth = null;
    var _chartHeight = null;
    var _slotWidth = null;

    var _$svg = null;
    var _$chart = null;
    var _$xaxis = null;
    var _$yaxis = null;
    var _$title = null;
    var _num = 11;
    var _cNum = null;

    function _initHistoryChartView()
    {
        _chartWidth = me.frame.width - _yAxisWidth - _rightMargin;
        _chartHeight = me.frame.height - _titleHeight - _xAxisHeight;
        _slotWidth = _chartWidth / _num;

        _initCanvas();
        _initBackground();
        _initXAxis();
        _initYAxis();
        _initChart();
        _initTitle();
    }

    function _updateHistoryChartView()
    {
        _updateXAxis();
        _updateTitle();
        _updateChart();
    }

    function _initCanvas()
    {
        _$svg = d3.select(me.$element[0]).append('svg')
            .attr('class', 'svg');
        _$svg.style(
                {
                    width   : "100%",
                    height  : "100%"
                });  
    }

    function _initBackground()
    {
        _$svg.append('rect')
            .attr('class', 'bg')
            .attr('x', _yAxisWidth)
            .attr('y', _titleHeight)
            .attr('width', _chartWidth)
            .attr('height', _chartHeight);
    }

    me.passengers = null;
    me.ups = null;

    var _maxUp = null;
    function _initChart()
    {
        _maxUp = 12;
        _$chart = _$svg.append('g')
            .attr('calss', 'chart')
            .attr('transform', 'translate('+ (_yAxisWidth + 0.5 * (_slotWidth)) +', '+ _titleHeight +')');
        _initGrids();
        _initPassengersChart();
        _initUpChart();
    }

    function _updateChart()
    {
        _cNum = (_nextStopSeq > _num - 1) ? (_num - 1) : _nextStopSeq;
        me.passengers = d3.range(0, _cNum)
            .map(function(d) {
                return Math.floor(Math.random() * 40 + 20);
            });
        if (_cNum < _num - 1) {
            me.passengers.length = _num;
        }
        me.ups = me.passengers.map(function(d) {
            if (d == undefined)  return undefined;
            return Math.floor(( 0.2 * d));
        });
        _updatePassengersChart();
        _updateUpChart();
    }

    function _initGrids()
    {
        var grids = d3.range(1, _num + 1)
            .map(function(d) {
                var x = (_slotWidth) * (d - 0.5);
                return [x, 0, x, _chartHeight];
            });
        grids.insert(0, [0, 0, 0, _chartHeight]);
        var $grid = _$svg.append('g')
            .attr('class', 'grid')
            .attr('transform', 'translate('+ (_yAxisWidth) +', '+ _titleHeight +')');
        $grid.selectAll('line')
            .data(grids)
            .enter().append('line')
            .attr('x1', function(d) { return d[0]; })
            .attr('y1', function(d) { return d[1]; })
            .attr('x2', function(d) { return d[2]; })
            .attr('y2', function(d) { return d[3]; });
    }

    var _$parea = null;
    var _$ppoint = null;
    var yMapping = null;
    function _initPassengersChart()
    {
        yMapping = d3.scale.linear()
            .range([_chartHeight, 0])
            .domain([0, 100]);
        var $passengers = _$chart.append('g')
            .attr('class', 'passenger');
        _$parea = $passengers.append('path')
            .datum([]);
        _$ppoint = $passengers.append('g')
            .attr('class', 'point');

        _$ppoint.selectAll('text')
            .data(d3.range(0, _num))
            .enter().append('text')
            .attr('x', function(d, i) {
                return i * (_slotWidth);
            })
            .attr('transform', 'translate(-8, -5)'); //TODO
        _$ppoint.selectAll('circle')
            .data(d3.range(0, _num - 1))
            .enter().append('circle')
            .attr('r', 3.5)
            .attr('cx', function(d, i) {
                return i * (_slotWidth);
            })
            .attr('cy', function(d) {
                return yMapping(d);
            });
        var arc = d3.svg.arc()
            .innerRadius(3.5)
            .outerRadius(5.0)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        _$ppoint.selectAll('path')
            .data(d3.range(0, _num - 1))
            .enter().append('path')
            .attr('class', 'arc')
            .attr('d', arc);
    }

    function _updatePassengersChart()
    {
        var yPassengerArea = d3.svg.area()
            .x(function(d, i) {
                if (i == 0) return - _slotWidth / 2;
                else return (i - 1) * (_slotWidth);
            })
            .y0(_chartHeight)
            .y1(function(d) { return yMapping(d); })
            .defined(function(d) { return d; });

        var passengers = me.passengers.clone();
        passengers.insert(0, Math.floor(Math.random() * 40 + 20));
        _$parea.datum(passengers)
            .attr('d', yPassengerArea);

        _$ppoint.selectAll('circle')
            .data(me.passengers)
            .attr('r', function(d) {
                if (d == undefined)
                    return 0;
                else return 3.5;
            })
            .attr('cy', function(d) {
                if (d == undefined) return 0;
                return yMapping(d);
            });
        var arc = d3.svg.arc()
            .innerRadius(3.5)
            .outerRadius(5.0)
            .startAngle(0)
            .endAngle(2 * Math.PI);
        _$ppoint.selectAll('path')
            .data(me.passengers)
            .attr('d', arc)
            .each(function(d, i) {
                if (d == undefined) {
                    d3.select(this).style('opacity', 0);
                } else {
                    d3.select(this).style('opacity', 1.0)
                        .attr('transform', function(dd, j) {
                            return 'translate('+ (i * (_slotWidth)) +', '+ yMapping(d) +')';
                        });
                }
            });

        _$ppoint.selectAll('text')
            .data(me.passengers)
            .text(function(d) {
                if (d == undefined) 
                    return ''; 
                return d + "%";
            })
            .attr('y', function(d) {
                return yMapping(d);
            });
    }

    var _$ups = null;
    var upGradient = null;
    function _initUpChart()
    {
        _$ups = _$chart.append('g')
            .attr('class', 'up');
        upGradient = _$ups.append('svg:defs');

        _$ups.append('svg:image')
            .attr('xlink:href', me.getResourcePath("images.bus", "png"))
            .attr('width', 60)
            .attr('height', 60);

        var yUpScale = d3.scale.linear()
            .range([1.0, 0.1])
            .domain([1, _maxUp + 1]); //TODO _maxUp
        upGradient.selectAll('linearGradient')
            .data(d3.range(1, _maxUp + 1))
            .enter().append('linearGradient')
            .each(function(d, i) {
                var up = d3.select(this)
                    .attr('id', 'up_' + d)
                    .attr('x1', '0%')
                    .attr('y1', '0%')
                    .attr('x2', '0%')
                    .attr('y2', '100%')
                    .attr('spreadMethod', 'pad');
                up.append('svg:stop')
                    .attr('offset', '0%')
                    .attr('stop-color', 'rgb(0, 204, 204)')
                    .attr('stop-opacity', yUpScale(d));
                up.append('svg:stop')
                    .attr('offset', '100%')
                    .attr('stop-color', 'rgb(0, 204, 204)')
                    .attr('stop-opacity', yUpScale(d + 1));
            });

        _$ups.selectAll('g')
            .data(d3.range(0, _num - 1))
            .enter().append('g')
            .each(function(d, i) {
                d3.select(this).selectAll('rect')
                    .data(d3.range(1, _maxUp + 1))
                    .enter().append('rect')
                    .attr('x', (_slotWidth) * i - (_slotWidth) / 1.8 * 0.5)
                    .attr('y', function(dd, j) {
                        if (j % 2 == 0) {
                            return _chartHeight - 10 - 2 * (1 + 3 *( Math.floor(j / 2)));
                        } else {
                            return _chartHeight - 10 - 2 * (1 + 3 *( Math.floor(j / 2) - 1));
                        }
                    })
                    .attr('width', (_slotWidth) / 1.8)
                    .attr('height', 3)
                    .style('fill', function(dd, j) {
                        return 'url(#up_'+ (j + 1) +')';
                    });
                d3.select(this).append('text')
                    .attr('x', (_slotWidth) * i);
            });
    }

    function _updateUpChart()
    {
        _$ups.selectAll('g')
            .data(me.ups)
            .each(function(d, i) {
                d3.select(this).selectAll('rect')
                    .each(function(dd, j) {
                        if (dd <= d) {
                            d3.select(this).style('opacity', 1.0);
                        } else {
                            d3.select(this).style('opacity', 0);
                        }
                    });
                d3.select(this).select('text')
                    .text(d)
                    .attr('transform', function(d) {
                        return 'translate('+ (- this.getBBox().width * 0.5) +', 0)';
                    })
                    .attr('y', function(d) {
                        if ((d + 1) % 2 == 0) {
                            return _chartHeight - 10 - 2 * (1 + 3 *( Math.floor((d + 1) / 2)));
                        } else {
                            return _chartHeight - 10 - 2 * (1 + 3 *( Math.floor((d + 1) / 2) - 1));
                        }
                    });

            });
        _$ups.select('image')
            .attr('transform', 'translate('+ ((_slotWidth) * _cNum - 60) +', '+ (_chartHeight - 30) +')');
    }

    function _initXAxis()
    {
        _$xaxis = _$svg.append('g')
            .attr('class', 'xaxis')
            .attr('transform', 'translate('+ (_yAxisWidth + 0.5 * (_slotWidth)) +', '+ (_chartHeight + _titleHeight) +')');
        var xScale = d3.scale.ordinal()
            .domain(d3.range(0, _num))
            .range(d3.range(0, _num).map(function(d) {
                return d * (_slotWidth);
            }));
        var xAxis = d3.svg.axis()
            .scale(xScale)
            .tickFormat('')
            .orient('bottom');
        _$xaxis.call(xAxis)
            .call(function(tick) {
                tick.selectAll('text').attr('transform', function(text) {
                    return 'rotate(-20)translate(-40, 5)';
                });
            });
        _$svg.append('g')
            .attr('class', 'xlabel')
            .attr('transform', 'translate(0, '+ (_chartHeight + _titleHeight) +')')
            .append('line')
            .attr('x1', 0)
            .attr('y1', 0)
            .attr('x2', (me.frame.width))
            .attr('y2', 0);
    }

    function _updateXAxis()
    {
        var _startStopSeq = (_nextStopSeq > _num - 1) ? (_nextStopSeq - _num + 1) : 0;
        var stops = d3.range(_startStopSeq, _nextStopSeq + 1)
            .map(function(d, i) {
                return me.stops[d];
            });
        _$xaxis.selectAll('.tick text')
            .datum(stops)
            .text(function(d, i) {
                if (typeof d[i] == 'undefined')  return '';
                return d[i].desc;
            });
    }

    function _initYAxis()
    {
        _$yaxis = _$svg.append('g')
            .attr('class', 'yaxis')
            .attr('transform', 'translate('+ _yAxisWidth +', '+ (_titleHeight) +')');
        var yScale = d3.scale.ordinal()
            .domain(d3.range(0, 3).reverse())
            .range(d3.range(0, 3).map(function(d) {
                return (d == 2) ? (d * (_chartHeight / 2) - 10) : (d * (_chartHeight / 2));
            }));
        var yAxis = d3.svg.axis()
            .scale(yScale)
            .tickFormat(function(d) {
                if (d == 0) return 0;
                return (d * 50).toString()  + "%";
            })
            .orient('left');
        _$yaxis.call(yAxis);
    }

    function _initTitle()
    {
        _$title = _$svg.append('g')
            .attr('class', 'title')
            .attr('transform', 'translate('+ _yAxisWidth +', 30)');
        _$title.append('text')
            .text('');
    }

    function _updateTitle()
    {
        _$title.select('text')
            .text('Line ' + me.routeId + ' ' + me.plateNumber);
    }

    return me.endOfClass(arguments);
};
bds.ui.view.LoadHistoryChartView.className = "bds.ui.view.LoadHistoryChartView";
