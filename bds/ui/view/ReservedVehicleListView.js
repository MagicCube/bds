$ns("bds.ui.view");

$import("bds.ui.view.VehicleListView");

bds.ui.view.ReservedVehicleListView = function()
{
    var me = $extend(bds.ui.view.VehicleListView);
    me.columns = [
        { id: "plateNumber", text: "Plate", width: 100, align: "center" },
        { id: "place", text: "Place", width: 150, align: "center" },
        { id: "crew", text: "Crew", width: 200, align: "center" }
    ];
    var base = {};
    

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.setVehicles(bds.ui.data.VehicleManager.getReservedVehicles());
    };
    
    base.updateVehicle = me.updateVehicle;
    me.updateVehicle = function(p_vehicle, p_animation)
    {
        var $tr = base.updateVehicle(p_vehicle, p_animation);
        $tr.find("#crew").text(p_vehicle.crew.name);
        $tr.find("#status").text(p_vehicle.status);
        $tr.find("#place").text(p_vehicle.place);
        if (p_vehicle.status == "In Maintenance")
        {
            $tr.addClass("maintenance");
        }
    };

    return me.endOfClass(arguments);
};
bds.ui.view.ReservedVehicleListView.className = "bds.ui.view.ReservedVehicleListView";
