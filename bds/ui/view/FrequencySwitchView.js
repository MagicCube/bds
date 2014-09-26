$ns("bds.ui.view");

$include("bds.res.FrequencySwitchView.css");

bds.ui.view.FrequencySwitchView = function()
{
    var me = $extend(mx.view.View);
    me.elementTag = "ul";
    me.elementClass = "FrequencySwitchView";
    var base = {};
    
    me.selection = "circulation";
    
    me.onchanged = null;

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.$container.append("<li id=circulation class=selected><a>In Circulation</a></li>");
        me.$container.append("<li id=reserved><a>Reserved</a></li>");
        me.$container.on("click", "li", _li_onclick);
    };
    
    function _li_onclick(e)
    {
        var id = e.currentTarget.id;
        if (me.selection != id)
        {
            me.$container.find("li").removeClass("selected");
            me.$container.find("li#" + id).addClass("selected");
            me.selection = id;
            me.trigger("changed");
        }
    }

    return me.endOfClass(arguments);
};
bds.ui.view.FrequencySwitchView.className = "bds.ui.view.FrequencySwitchView";
