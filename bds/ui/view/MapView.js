$ns("bds.ui.view");

$include("bds.res.MapView.css");

bds.ui.view.MapView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "MapView";
    var base = {};
    
    me.map = null;
    me.mapBoxMapId = "nicki.uxdh1tt9";
    
    me.defaultCenterLocation = [45.521743896993634, -122.66990661621094];
    me.defaultZoom = 14;
    
    me.selection = null;
    me.selectionType = null;
    
    
    me.onselectionchanged = null;
    
    var _vehiclePopup = null;
    var _stopPopup = null;
    
    var _$legend = null;
    var _$fullScreen = null;
    
    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.initMap();
        
        _vehiclePopup = L.popup({
            autoPan: true,
            autoPanPadding: new L.point(100, 100)
        });
        _vehiclePopup.setContent('<div id="header"><div id="routeNumber" style="background-color: rgb(140, 198, 63);"></div><div id="plateNumber"></div></div> <ul><li id="stop"></li><li id="crew"></li><li id="tel"></li><li id="load"></li><li id="warning" onclick="bds.ui.app.showChain();"></li></ul>');
        _stopPopup = L.popup();
        me.map.on("popupopen", _onpopupopen);
        me.map.on("popupclose", _onpopupclose);        
        
        _$fullScreen = $("<div id=fullScreen />");
        _$fullScreen.on("click", function()
        {
            me.toggleFullScreen();
        });
        me.$container.append(_$fullScreen);
    };
    
    me.initMap = function()
    {
        me.map = new L.map(me.$container[0], {
            zoomControl: false,
            attributionControl: false
        });
        L.tileLayer("https://api.tiles.mapbox.com/v3/" + me.mapBoxMapId + "/{z}/{x}/{y}.png32",
        {
            maxzoom: 19,
            minzoom: 0
        }).addTo(me.map);
    };
    
    function _initLegend()
    {
        _$legend = $("<ul id=legend>");
        for (var i = 0; i < bds.ui.data.RouteManager.routes.length; i++)
        {
            var route = bds.ui.data.RouteManager.routes[i];
            var $li = $("<li>");
            var $line = $("<span id=line>");
            $line.css("backgroundColor", route.color);
            var $text = $("<span id=text>");
            $text.text("Line " + route.route);
            $li.attr("title", route.desc);
            $li.append($line);
            $li.append($text);
            _$legend.append($li);
        }
        me.$container.append(_$legend);
    }
    
    me.loadMap = function()
    {
        me.map.setView(me.defaultCenterLocation, me.defaultZoom);
    };

    
    me.drawRoutes = function()
    {
        bds.ui.data.RouteManager.routeLines.forEach(function(p_routeLine)
        {
            var multiPolyline = new L.multiPolyline(p_routeLine.path, { color: p_routeLine.color, weight: 4 });
            multiPolyline.addTo(me.map);
            
            p_routeLine.stops.forEach(function(p_stop)
            {
                var circle = L.circleMarker({ lon: p_stop.lng, lat: p_stop.lat }, {
                    radius: 4,
                    color: p_routeLine.color,
                    weight: 2, fill: true,
                    opacity: 1,
                    stroke: true,
                    fillOpacity: (p_routeLine.direction == 0 ? 1 : 0.7),
                    fillColor: (p_routeLine.direction == 0 ? "white" : p_routeLine.color)
                });
                circle.id = p_stop.id;
                circle.addTo(me.map);
                circle.bindPopup(_stopPopup);
                circle.on("click", _stop_onclick);
            });
        });
        _initLegend();
    };
    
    
    var _vehicleMarkers = [];
    me.drawVehicles = function()
    {
        var vehicles = bds.ui.data.VehicleManager.vehicles;
        vehicles.forEach(function(p_vehicle)
        {
            me.drawVehicle(p_vehicle);
        });
    };
    
    me.drawVehicle = function(p_vehicle)
    {
        var marker = _vehicleMarkers["v" + p_vehicle.vehicleID];
        var lonLat = { lon: p_vehicle.longitude, lat: p_vehicle.latitude };
        if (marker == null)
        {
            marker = L.marker(lonLat, { icon: p_vehicle.route.icon }).addTo(me.map);
            marker.id = p_vehicle.vehicleID;
            marker.on("click", _vehicle_onclick);
            marker.bindPopup(_vehiclePopup);
            _vehicleMarkers.add(marker);
            _vehicleMarkers["v" + p_vehicle.vehicleID] = marker;
        }
        else
        {
            if (me.selection == null)
            {
                marker.setLatLng(lonLat);
            }
        }
        
        _checkWarning(p_vehicle);
    };
    
    me.selectVehicle = function(p_vehicleId, p_openPopup)
    {
        var vehicle = bds.ui.data.VehicleManager.getVehicle(p_vehicleId);
        if (p_openPopup != false)
        {
            _vehicleMarkers.forEach(function(p_marker)
            {
                p_marker.closePopup();
            });
            var marker = _vehicleMarkers["v" + p_vehicleId];
            me.selection = vehicle;
            me.selectionType = "vehicle";
            marker.openPopup();
        }
        me.selection = vehicle;
        me.selectionType = "vehicle";
        me.trigger("selectionchanged");
    };
    
    
    var _width, _height;
    me.toggleFullScreen = function()
    {
        if (!me.$container.hasClass("fullScreen"))
        {
            me.$container.addClass("fullScreen");
            _width = me.$container.width();
            _height = me.$container.height();
            me.$container.transit({
                width: window.innerWidth,
                height: window.innerHeight - me.$container.find("#top").height()
            }, function(){
                me.map.invalidateSize();
            });
            $("#frequencyPanel").fadeOut();
            $("#bottom").fadeOut();
        }
        else
        {
            me.$container.removeClass("fullScreen");
            me.$container.transit({
                width: _width,
                height: _height
            }, function(){
                me.map.invalidateSize();
            });
            $("#frequencyPanel").fadeIn();
            $("#bottom").fadeIn();
        }
    };
    
    
    function _checkWarning(p_vehicle)
    {
        var lonLat = { lon: p_vehicle.longitude, lat: p_vehicle.latitude };
        var marker = _vehicleMarkers["v" + p_vehicle.vehicleID];
        if (marker == null) return;
        
        if (p_vehicle.delay > 60)
        {
            marker.setIcon(p_vehicle.route.warningIcon);
        }
        else
        {
            marker.setIcon(p_vehicle.route.icon);
        }
    }
    
    function _vehicle_onclick(e)
    {
        var vehicleId = e.target.id;
        me.selectVehicle(vehicleId, false);
    }
    
    function _stop_onclick(e)
    {
        var stopId = e.target.id;
        var stop = bds.ui.data.RouteManager.getStop(stopId);
        me.selection = stop;
        me.selectionType = "stop";
        
        var html = "<div class=stop><div id=desc>" + stop.desc + "</div> <div id=number>Line #" + stop.routeLine.number + "</div> <div id=dir>" + stop.routeLine.directionDesc + "</div>";
        _stopPopup.setContent(html);
        me.trigger("selectionchanged");
    }
    
    function _onpopupopen(e)
    {
        if (e.popup == _vehiclePopup)
        {
            var $popup = $(_vehiclePopup._wrapper.parentNode);
            $popup.addClass("vehiclePopup");
            
            var vehicle = me.selection;
            $popup.find("#routeNumber").css("backgroundColor", vehicle.routeLine.color);
            $popup.find("#routeNumber").text(vehicle.routeLine.number);
            $popup.find("#plateNumber").text(vehicle.plateNumber);
            $popup.find("#crew").text(vehicle.crew.name);
            $popup.find("#tel").text(vehicle.crew.phone);
            $popup.find("#load").text(vehicle.load + "% Load Factor");
            if (vehicle.delay > 60)
            {
                var status = Math.round(vehicle.delay / 60) + "min Delayed";
                $popup.find("#warning").html("<div>" + status + "</div>").show();
            }
            else
            {
                $popup.find("#warning").hide();
            }
                       
            var stopName = "N/A";
            if (vehicle.lastLocID != null)
            {
                var stop = bds.ui.data.RouteManager.getStop(vehicle.lastLocID);
                if (stop != null)
                {
                    stopName = vehicle.lastLocID != null ? stop.desc : "N/A";
                }
            }
            $popup.find("#stop").text(stopName);
            _vehiclePopup.setContent($popup.find(".leaflet-popup-content").html());
            _vehiclePopup.update();
        }
    }
    
    function _onpopupclose(e)
    {
        me.selection = null;
        me.selectionType = "none";
        me.trigger("selectionchanged");
    }
    
    return me.endOfClass(arguments);
};
bds.ui.view.MapView.className = "bds.ui.view.MapView";
