$ns("bds.ui.view");

$import("bds.ui.view.VehicleListView");

bds.ui.view.CirculationVehicleListView = function()
{
    var me = $extend(bds.ui.view.VehicleListView);
    me.columns = [
        { id: "line", text: "Line", width: 100, align: "center" },
        { id: "stop", text: "Last Stop", width: 300, align: "center" },
        { id: "plateNumber", text: "Plate#", width: 150,align: "center" },
    ];
    var base = {};
    

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
    };
    
    base.updateVehicle = me.updateVehicle;
    me.updateVehicle = function(p_vehicle, p_animation)
    {
        var $tr = base.updateVehicle(p_vehicle, p_animation);
        
        $tr.find("#line").html("<span>" + p_vehicle.routeNumber + "</span>");
        $tr.find("#line").find("span").css("background", p_vehicle.routeLine.color);
        $tr.find("#line").attr("title", p_vehicle.routeLine.directionDesc);
        $tr.find("#line").toggleClass("up", p_vehicle.routeLine.direction == 0);
        $tr.find("#line").toggleClass("down", p_vehicle.routeLine.direction == 1);
        
        var changed = false;
        var stopName = "N/A";
        if (p_vehicle.lastLocID != null)
        {
            var stop = bds.ui.data.RouteManager.getStop(p_vehicle.lastLocID);
            if (stop != null)
            {
                stopName = p_vehicle.lastLocID != null ? stop.desc : "N/A";
            }
        }
        if ($tr.find("#stop").text().trim() != stopName)
        {
            changed = true;
            if (!p_animation)
            {
                $tr.find("#stop").text(stopName);
            }
        }
        
        var status = null;
        if (p_vehicle.delay < 1 * 60)
        {
            $tr.removeClass();
            $tr.addClass("ontime");
            if (p_vehicle.delay > - 60)
            {
                status = "On Time";
            }
            else
            {
                status = Math.abs(Math.round(p_vehicle.delay / 60)) + "min Ahead";
            }
        }
        else
        {
            $tr.removeClass();
            if (p_vehicle.delay < 5 * 60)
            {
                $tr.addClass("delayed1");
            }
            else if (p_vehicle.delay < 15 * 60)
            {
                $tr.addClass("delayed3");
            }
            else
            {
                $tr.addClass("delayed3");
            }
            status = Math.round(p_vehicle.delay / 60) + "min Delayed";
        }
        
        if ($tr.find("#status").text().trim() != status)
        {
            changed = true;
            if (!p_animation)
            {
                $tr.find("#status").text(status);
            }
        }
        
        if (p_animation && changed)
        {
            $tr.delay(Math.random() * 1500).transition({ perspective: "1000px", rotateX: '360deg' }, 800, function()
            {
                $tr.find("#status").text(status);
                $tr.find("#stop").text(stopName);
                
                $tr.css({
                    perspective: 0,
                    rotateX: 0
                });
            });
        }
        
        return $tr;
    };

    return me.endOfClass(arguments);
};
bds.ui.view.CirculationVehicleListView.className = "bds.ui.view.CirculationVehicleListView";
