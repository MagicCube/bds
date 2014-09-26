$ns("bds.ui.view");

$include("bds.res.ClockView.css");

bds.ui.view.ClockView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "ClockView";
    var base = {};

    var _$time = null;
    var _$date = null;
    
    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        
        _$time = $("<div id=time>");
        me.$container.append(_$time);
        _$date = $("<div id=date>");
        me.$container.append(_$date);
        me.$container.append("<div id=weather>12°</div>");
        
        me.update();
    };
    
    me.update = function()
    {
        var now = bds.ui.app.getTime();
        _$time.text($format(now, "HH:mm"));
        _$date.text(now.toDateString());

        setTimeout(me.update, 1000 * 30);
    };

    return me.endOfClass(arguments);
};
bds.ui.view.ClockView.className = "bds.ui.view.ClockView";
