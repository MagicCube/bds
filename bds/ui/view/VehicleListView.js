$ns("bds.ui.view");

$include("bds.res.VehicleListView.css");

bds.ui.view.VehicleListView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "VehicleListView";
    var base = {};
    
    me.columns = [];
    me.vehicles = [];
    
    me.onvehicleclick = null;
    
    var _$headerContainer = $("<div id=header>");
    var _$headerTable = $("<table cellpadding=0 cellspacing=0> <colgroup></colgroup> <tbody> <tr></tr> </tbody> </table>");
    var _$bodyContainer = $("<div id=body/>");
    var _$bodyTable = $("<table cellpadding=0 cellspacing=0><tbody/></table>");
    var _$templateRow = $("<tr>");
    
    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        
        me.$container.append(_$headerContainer);
        _$headerContainer.append(_$headerTable);
        
        me.$container.append(_$bodyContainer);
        _$bodyContainer.append(_$bodyTable);
        
        me.initColumns();
        me.setVehicles(me.vehicles);
        
        _$bodyTable.on("click", "tr", _onrowclick);
    };

    me.initColumns = function()
    {
        me.columns.add({
            id: "status",
            text: "Status",
            align: "center"
        });
        var $colgroup = _$headerTable.find("colgroup");
        var $headerRow = _$headerTable.find("tr");
        for (var i = 0; i < me.columns.length; i++)
        {
            var column = me.columns[i];
            var $col = $("<col>");
            $col.attr("id", column.id);
            if (column.width != null)
            {
                $col.attr("width", column.width);
            }
            $colgroup.append($col);
            
            var $td = $("<td>");
            $td.attr("id", column.id);
            if (column.align)
            {
                $td.attr("align", column.align);
            }
            $headerRow.append($td);
            $td.text(column.text);
        }
        _$templateRow = $headerRow.clone(true);
        _$bodyTable.append($colgroup.clone(true));
    };
    
    me.clear = function()
    {
        _$bodyTable.find("tr").remove();
    };
    
    me.setVehicles = function(p_vehicles)
    {
        me.vehicles = p_vehicles;
        for (var i = 0; i < me.vehicles.length; i++)
        {
            var vehicle = me.vehicles[i];
            var id = vehicle.vehicleID;
            var $tr = _$bodyTable.find("#v" + id);
            if ($tr.length == 0)
            {
                me.appendVehicle(vehicle, false);
            }
            else
            {
                me.updateVehicle(vehicle, true);
            }
        }
    };
    
    me.updateVehicle = function(p_vehicle, p_animation)
    {
        var $tr = _$bodyTable.find("#v" + p_vehicle.vehicleID);
        $tr.find("#plateNumber").text(p_vehicle.plateNumber);
        return $tr;
    };
    
    me.appendVehicles = function(p_vehicles)
    {
        p_vehicles.forEach(function(p_vehicle)
        {
            me.appendVehicle(p_vehicle);
        });
    };
    
    me.appendVehicle = function(p_vehicle)
    {
        var $tr = _$templateRow.clone(true);
        $tr.attr("id", "v" + p_vehicle.vehicleID);
        if (_$bodyTable.find("tr").length == 0)
        {
            _$bodyTable.find("tbody").append($tr);
        }
        else
        {
            _$bodyTable.find("tr:first-child").before($tr);
        }
        me.updateVehicle(p_vehicle, false);
        return $tr;
    };
    
    me.query = function(p_keyword)
    {
        if (p_keyword == null || p_keyword.trim() == "")
        {
            _$bodyTable.find("tr").show();
        }
        else
        {
            _$bodyTable.find("tr").each(function(p_index, tr)
            {
                var display = "none";
                for (var i = 0; i < tr.childNodes.length; i++)
                {
                    var td = tr.childNodes[i];
                    if (td.innerText.toLowerCase().contains(p_keyword))
                    {
                        var display = "";
                        break;
                    }
                }
                tr.style.display = display;
            });
        }
    }
    
    
    
    function _onrowclick(e)
    {
        var id = e.currentTarget.id;
        var vehicle = bds.ui.data.VehicleManager.getVehicle(id.substr(1));
        me.trigger("vehicleclick", { vehicle: vehicle });
    }

    return me.endOfClass(arguments);
};
bds.ui.view.VehicleListView.className = "bds.ui.view.VehicleListView";
