$ns("bds.ui");

$import("lib.leaflet.leaflet");
$import("lib.transit.transit");

$import("bds.ui.data.RouteManager");
$import("bds.ui.data.VehicleManager");

$import("bds.ui.view.ChainView");
$import("bds.ui.view.ClockView");
$import("bds.ui.view.CirculationVehicleListView");
$import("bds.ui.view.FrequencySwitchView");
$import("bds.ui.view.LoadHistoryChartView");
$import("bds.ui.view.MapView");
$import("bds.ui.view.PassengersChartView");
$import("bds.ui.view.ReservedVehicleListView");

$include("lib.leaflet.leaflet.css");
$include("bds.res.App.css");

bds.ui.App = function()
{
    var me = $extend(mx.app.Application);
    me.appId = "bds.ui.App";
    me.appDisplayName = "Operations Control Center";
    var base = {};
    
    me.mapView = null;
    me.chainView = null;
    me.passengerChartView = null;
    me.loadHistoryChartView = null;
    me.frequencySwitchView = null;
    me.circulationListView = null;
    me.reservedListView = null;
    me.clockView = null;
    
    var _$top = null;
    var _$body = null;
    var _$bottom = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        
        _$top = me.$container.children("#top");
        _$body = me.$container.children("#body");
        var bottomHeight = window.innerHeight * 0.3;
        _$body.css("bottom", bottomHeight);
        _$bottom = me.$container.children("#bottom");
        _$bottom.css("height", bottomHeight);
        
        _initMapView();
        _initChainView();
        _initChartView();
        _initFrequencySwitchView();
        _initCirculationListView();
        _initReservedListView();
        _initSearch();
        
        bds.ui.data.RouteManager.on("updated", function()
        {
            console.log("bds.ui.dataRouteManager.onupdate");
            me.mapView.drawRoutes();
            me.passengerChartView.loadPassengers();
            bds.ui.data.VehicleManager.update();
        });
        
        bds.ui.data.VehicleManager.on("updated", function()
        {
            me.circulationListView.setVehicles(bds.ui.data.VehicleManager.vehicles);
            me.mapView.drawVehicles();
        });
        
        
        $(window).on("keydown", function(e)
        {
            if (e.keyCode == 27)
            {
                me.hideChain();
            }
        });
    };
    
    me.getTime = function()
    {
        var now = new Date();        
        if (!$offline)
        {
            now = new Date(
                    now.getFullYear(),
                    now.getMonth(),
                    now.getDate(),
                    now.getUTCHours(),
                    now.getUTCMinutes()
            );
            now = now.addHours(-7);
        }
        return now;
    };
    
    function _initMapView()
    {
        me.mapView = new bds.ui.view.MapView({
            $element: me.$container.find("#map"),
            frame: {
                left: 0,
                width: window.innerWidth * 0.6,
                top: 0,
                bottom: 0
            },
            onselectionchanged: _mapView_onselectionchanged
        });
        me.mapView.parentView = me;
    }
    
    function _initSearch()
    {
        _$search.val(_searchTips);
        _$search.addClass("empty");
        _$search.on("focus", _search_onfocus);
        _$search.on("blur", _search_onblur);
        me.$container.find("#frequencyPanel").append(_$search);
    }
    
    function _initClockView()
    {
        me.clockView = new bds.ui.view.ClockView({
            frame: {
                right: 5,
                top: 21
            }
        });
        me.addSubview(me.clockView);
    }
    
    function _initChainView()
    {
        me.chainView = new bds.ui.view.ChainView({
            elementStyle: { zIndex: 9999999, display: "none" },
            frame: {
                left: 0,
                right: 0,
                top: 0,
                bottom: 0
            },
            onclose: function()
            {
                me.hideChain();
            }
        });
    }
    
    function _initChartView()
    {
        me.passengerChartView = new bds.ui.view.PassengersChartView({
            frame: {
                width: me.$container.find("#bottom").width(),
                height: me.$container.find("#bottom").height()
            }
        });
        me.addSubview(me.passengerChartView, me.$container.find("#chart"));

        
        me.loadHistoryChartView = new bds.ui.view.LoadHistoryChartView({
            elementStyle: { display: "none" },
            frame: {
                width: me.$container.find("#bottom").width(),
                height: me.$container.find("#bottom").height()
            }
        });
        me.addSubview(me.loadHistoryChartView, me.$container.find("#chart"));
    }
    
    function _initFrequencySwitchView()
    {
        var width = me.$container.find("#lists").width();
        me.frequencySwitchView = new bds.ui.view.FrequencySwitchView({
            $element: me.$container.find("#switch"),
            onchanged: function()
            {
                _keyword = null;
                _$search.addClass("empty");
                _$search.val(_searchTips);
                
                if (me.frequencySwitchView.selection == "reserved")
                {
                    me.reservedListView.query(null);
                    me.circulationListView.$container.transition({
                        x: -width
                    }, 300, "in");
                    me.reservedListView.$container.transition({
                        x: -width
                    }, 300, "in");
                }
                else
                {
                    me.circulationListView.query(null);
                    me.circulationListView.$container.transition({
                        x: 0
                    }, 300, "in");
                    me.reservedListView.$container.transition({
                        x: 0
                    }, 300, "in");
                }
            }
        });
        me.frequencySwitchView.parentView = me;
    }
    
    function _initCirculationListView()
    {
        var width = me.$container.find("#lists").width();
        var height = me.$container.find("#lists").height();
        me.circulationListView = new bds.ui.view.CirculationVehicleListView({
            frame: {
                left: 0,
                width: width,
                height: height
            },
            onvehicleclick: function(e)
            {
                var vehicle = e.vehicle;
                me.mapView.selectVehicle(vehicle.id);
            }
        });
        me.addSubview(me.circulationListView, me.$container.find("#lists"));
    }
    
    function _initReservedListView()
    {
        var width = me.$container.find("#lists").width();
        var height = me.$container.find("#lists").height();
        me.reservedListView = new bds.ui.view.ReservedVehicleListView({
            frame: {
                left: width,
                width: width,
                height: height
            }
        });
        me.addSubview(me.reservedListView, me.$container.find("#lists"));
    }

    base.run = me.run;
    me.run = function(args)
    {
        _initClockView();
        me.mapView.loadMap();
        bds.ui.data.RouteManager.update();
    };
    
    me.showChain = function()
    {
        me.chainView.$element.css({
            display: "block",
            scale: 0.7,
            opacity: 0.1
        });
        me.addSubview(me.chainView);
        
        var vehicle = me.mapView.selection;
        var line = {
                vehicle: vehicle,
                factor: vehicle.load / 100,
                delaySecond: vehicle.delay,
                routeNumber: vehicle.routeLine.number,
                stops: vehicle.routeLine.stops,
                currentStopSeq: vehicle.lastStopSeq
            };
        console.log(line);
        me.chainView.setSelectedLine(line);
        
        me.chainView.$element.transit({
            scale: 1,
            opacity: 1
        });
    };
    
    me.hideChain = function()
    {
        me.chainView.$element.transit({
            scale: 0.7,
            opacity: 0
        }, function()
        {
            me.removeSubview(me.chainView);
        });
    };
    
    
    
    function _mapView_onselectionchanged(e)
    {
        switch (me.mapView.selectionType)
        {
            case "vehicle":
                me.loadHistoryChartView.$container.show();
                me.passengerChartView.$container.hide();
                me.loadHistoryChartView.setVehicle(me.mapView.selection);
                break;
            case "stop":
                me.loadHistoryChartView.$container.hide();
                me.passengerChartView.$container.show();
                me.passengerChartView.loadPassengers(me.mapView.selection.desc);
                break;
            default:
                me.loadHistoryChartView.$container.hide();
                me.passengerChartView.$container.show();
                me.passengerChartView.loadPassengers(null);
                break;
        }
    }
    
    
    
    
    
    
    var _$search = $("<input type='text' id='search' autocomplete='off'>");
    var _searchTips = "Line, stop, plate or status";
    function _search_onfocus(e)
    {
        if (_searchTimer != null)
        {
            clearInterval(_searchTimer);
            _searchTimer = null;
        }
        if (_$search.hasClass("empty"))
        {
            _$search.removeClass("empty");
            _$search.val("");
        }
        _searchTimer = setInterval(_checkSearch, 800);
    }

    function _search_onblur(e)
    {
        if (_searchTimer != null)
        {
            clearInterval(_searchTimer);
            _searchTimer = null;
        }
        
        if (_$search.val().trim() == "")
        {
            _$search.addClass("empty");
            _$search.val(_searchTips);
        }
    }
    
    var _searchTimer = null;
    var _keyword = null;
    function _checkSearch()
    {
        if (_keyword == null || _keyword != _$search.val())
        {
            _keyword = _$search.val().trim();
            if (_keyword == "")
            {
                _keyword = null;
            }
            
            if (me.frequencySwitchView.selection == "circulation")
            {
                me.circulationListView.query(_keyword);
            }
            else
            {
                me.reservedListView.query(_keyword);
            }
        }        
    }

    return me.endOfClass(arguments);
};
bds.ui.App.className = "bds.ui.App";

bds.ui.App.getTime = function()
{
    var now = new Date();        
    if (!$offline)
    {
        now = new Date(
                now.getFullYear(),
                now.getMonth(),
                now.getDate(),
                now.getUTCHours(),
                now.getUTCMinutes()
        );
        now = now.addHours(-7);
    }
    return now;
};
