$ns("bds.ui.data");


bds.ui.data.RouteManagerClass = function()
{
    var me = $extend(MXComponent);
    var base = {};
    
    me.routes = [];
    me.routeLines = [];
    me.routeNumbers = [];
    me.stops = [];
    
    me.onupdated = null;
    
    var _routeColors = ["#FF0000", "#F7931E", "#8CC63F", "#93278F", "#29ABE2"];
    var _routeIcons = {};
    var _routeWarningIcons = {};

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
    };
    
    me.getRoute = function(p_routeNumber)
    {
        return me.routes["r" + p_routeNumber];
    };
    
    me.getRouteLine = function(p_routeNumber, p_direction)
    {
        return me.routeLines["r" + p_routeNumber + "-" + p_direction];
    };
    
    me.getStop = function(p_stopId)
    {
        return me.stops["s" + p_stopId];
    };
    
    
    me.update = function()
    {
        $.ajax({
            url: mx.getResourcePath("bds.res.data.routes", "kml")
        }).done(function(p_result)
        {
            _loadRoutesFromKml(p_result);
        });
    };
    
    
    function _loadRoutesFromKml(p_document)
    {
        var $doc = $(p_document);
        var $placemarks = $doc.find("Placemark");
        var routeColorIndex = 0;
        for (var i = 0; i < $placemarks.length; i++) 
        {
            var $placemark = $placemarks.eq(i);
            var routeNumber = parseInt($placemark.find("Data[name=route_number]").text());
            var direction = parseInt($placemark.find("Data[name=direction]").text());
            var directionDescription = $placemark.find("Data[name=direction_description]").text().trim();

            if (_routeColors["r" + routeNumber] == null)
            {
                _routeColors["r" + routeNumber] = _routeColors[routeColorIndex];
                var vehicleIcon = L.icon({
                    iconUrl: mx.getResourcePath("bds.res.images.vehicle-" + $format(routeColorIndex, "00"), "png"),
                    iconSize: [28, 36],
                    iconAnchor: [14, 36]
                });
                var warningIcon = L.icon({
                    iconUrl: mx.getResourcePath("bds.res.images.warning-" + $format(routeColorIndex, "00"), "png"),
                    iconSize: [66, 66],
                    iconAnchor: [33, 33]
                });
                _routeIcons["r" + routeNumber] = vehicleIcon;
                _routeWarningIcons["r" + routeNumber] = warningIcon;
                routeColorIndex++;
            }
            
            if (!me.routeNumbers.contains(routeNumber))
            {
                me.routeNumbers.add(routeNumber);
            }
            
            var routeLine = {
                 id: "r" + routeNumber + "-" + direction,
                 number: routeNumber,
                 direction: direction,
                 directionDesc: directionDescription,
                 color: _routeColors["r" + routeNumber],
                 icon: _routeIcons["r" + routeNumber],
                 warningIcon: _routeWarningIcons["r" + routeNumber]
            };
            me.routeLines[routeLine.id] = routeLine;
            me.routeLines.add(routeLine);
            
            var lineStrings = _parseLineStrings($placemark.find("LineString"));
            routeLine.path = lineStrings;
        }
        
        $.ajax({
            url: mx.getResourcePath("bds.res.data.routes", "json")
        }).done(function(p_result) {
            me.routes = p_result.resultSet.route;
            for (var i = 0; i < me.routes.length; i++)
            {
                var route = me.routes[i];
                var num = route.route;
                me.routes["r" + num] = route;
                route.color = _routeColors["r" + num];
                route.icon = _routeIcons["r" + num];
                route.warningIcon = _routeWarningIcons["r" + num];
                
                for (var j = 0; j < route.dir.length; j++)
                {
                    var dir = route.dir[j];
                    var routeLine = me.getRouteLine(num, dir.dir);
                    routeLine.stops = dir.stop;
                    routeLine.stops.forEach(function(p_stop)
                    {
                        p_stop.id = p_stop.locid;
                        p_stop.routeLine = routeLine;
                        me.stops.add(p_stop);
                        me.stops["s" + p_stop.id] = p_stop;
                    });
                }
            }
            
            for (var i = 0; i < me.routeLines.length; i++)
            {
                var routeLine = me.routeLines[i];
                routeLine.route = me.getRoute(routeLine.number);
            }
            
            me.trigger("updated");
        });
    }

    
    
    
    function _parseLineStrings($lineStrings)
    {
        var lineStrings = [];
        for (var i = 0; i < $lineStrings.length; i++)
        {
            var $lineString = $lineStrings.eq(i);
            lineStrings.add(_parseLineString($lineString));
        }
        return lineStrings;
    }

    function _parseLineString($lineString)
    {
        var coordinates = $lineString.find("coordinates").text().trim().split(" ").map(function(p_coorinateString)
        {
            var str = p_coorinateString.trim();
            if (str != "")
            {
                var coordinate = eval("[" + str + "]");
                return coordinate.length == 2 ? coordinate.reverse() : null;
            }
            else
            {
                return null;
            }
        }).filter(function(p_coordinate)
        {
            return p_coordinate != null;
        });
        return coordinates;
    }

    return me.endOfClass(arguments);
};
bds.ui.data.RouteManagerClass.className = "bds.ui.data.RouteManagerClass";

bds.ui.data.RouteManager = new bds.ui.data.RouteManagerClass();
