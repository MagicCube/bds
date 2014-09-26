$ns("bds.ui.view");

$include("bds.res.ChatView.css");

bds.ui.view.ChatView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "ChatView";
    me.frame = { width: 460, height: 280 };
    var base = {};
    
    me.vehicle = null;
    
    var _$header = $("<div id=header> <div id=name>Crew Name</div> <div id=time>00:00</div></div>");
    var _$content = $("<div id=content></div>");
    var _$footer = $("<div id=footer> <input type=text> <div id=send>Send</div></div>");
    
    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        me.$container.append(_$header);
        me.$container.append(_$content);
        me.$container.append(_$footer);
        me.$container.find("#send").click(_sendMessage);
        me.$container.find("input").on("keydown", function(e)
        {
            if (e.keyCode == 13)
            {
                _sendMessage();
            }
        });        
    };
    

    me.setVehicle = function(p_vehicle)
    {
        me.clear();
        me.vehicle = p_vehicle;
        _$header.find("#name").text(me.vehicle.crew.name);
        _$header.find("#time").text($format(me.vehicle.messages.last().time, "HH:mm"));
        p_vehicle.messages.forEach(function(p_message)
        {
            me.appendMessage(p_message);
        });
    };
    
    me.clear = function()
    {
        _$content.html("");
    };
    
    me.appendMessage = function(p_message, p_animate)
    {
        var p_speaker = p_message.speaker;
        var p_text = p_message.text;
        var $message =$("<div class=message>");
        $message.addClass(p_speaker);
        
        var $bubble = $("<div class=bubble></div>");
        $message.append($bubble);
        $bubble.text(p_text);
        $bubble.append("<div id=tail>");
        
        _$content.append($message);
        
        $message.css("height", $bubble.height() + 20);
        
        _$content.scrollTop(100000);
        
        if (p_animate)
        {
            $bubble.css({
                scale: 0.1
            });
            $bubble.transit({
                scale: 1
            });
        }
    };
    
    
    function _sendMessage()
    {
        var $input = me.$container.find("input");
        var text = $input.val().trim();
        if (text != "")
        {
            $input.val("");
            var message = { speaker: "operator", text: text, time: bds.ui.App.getTime() };
            if (me.vehicle != null)
            {
                me.vehicle.messages.add(message);
            }
            me.appendMessage(message, true);
        }
    }

    return me.endOfClass(arguments);
};
bds.ui.view.ChatView.className = "bds.ui.view.ChatView";
