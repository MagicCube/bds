$ns("bds.ui.view");

$include("bds.res.PrecisionMarketingView.css");

bds.ui.view.PrecisionMarketingView = function()
{
    var me = $extend(mx.view.View);
    me.elementClass = "PrecisionMarketingView";   
    var base = {};
    me.$element = $("<div/>");

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
        
 
        _initPM();
        
        // TODO add your own initializing code here.
    };
      
    function _initPM()
      {
       
        var PrecisionMarketing =$('<div id = PrecisionMarketing></div>');
        var $left = $('<div id = left class=unhoved></div>');
        var $right = $('<div id = right class=unhoved></div>');
        var PM_ul =$('<ul id = PM_ul></ul>');
       
        var hardrock = $('<li id= hardrock class=icon ></li>');
        var starbuks = $('<li id= starbuks class=icon ></li>');
        var costa = $('<li id= costa class=icon></li>');   
        var mcd = $('<li id= mcd class=icon ></li>');
        
        var $push = $('<ul id = push></ul>');
        var $push1 = $('<li id= push1 class=pushIcon><text>Push</text></li>');
        var $push2 = $('<li id= push2 class=pushIcon><text>Push</text></li>');
        var $push3 = $('<li id= push3 class=pushIcon><text>Push</text></li>');
        var $push4 = $('<li id= push4 class=pushIcon><text>Push</text></li>');
        $push.append($push1);
        $push.append($push2);
        $push.append($push3);
        $push.append($push4);
        
        PM_ul.append(starbuks);
        PM_ul.append(hardrock); 
        PM_ul.append(costa);
        PM_ul.append(mcd);   
        PrecisionMarketing.append($left);
        PrecisionMarketing.append($right);
        PrecisionMarketing.append(PM_ul);
        PrecisionMarketing.append($push);
        $left.hover(function(){
            $left.addClass("hoved").removeClass("unhoved");
        },function(){
            $left.addClass("unhoved").removeClass("hoved");
        });
        $right.hover(function(){
            $right.addClass("hoved").removeClass("unhoved");
        },function(){
            $right.addClass("unhoved").removeClass("hoved");
        });
        
        me.$element.append(PrecisionMarketing);
        

        
        hardrock.css({
            'background': 'url('+ mx.getResourcePath("bds.res.images.hardrock", "png") +')',
            'z-index': 99999,         
        });
        starbuks.css({     
            'background': 'url('+ mx.getResourcePath("bds.res.images.starbuks", "png") +')',
            'z-index': 99999,      
        });
        costa.css({       
           'background': 'url('+ mx.getResourcePath("bds.res.images.costa", "png") +')',
            'z-index': 99999,            
        });
        mcd.css({
                 
            'background': 'url('+ mx.getResourcePath("bds.res.images.mcd", "png") +')',
            'z-index': 99999,  
        });
  
        PrecisionMarketing.css({
            'width': 500,
            'height': 133,
            'position': 'absolute',
            'background': 'white',
            'opacity': 0.7,
        });
      
        
         

        
    }

    return me.endOfClass(arguments);
};
bds.ui.view.PrecisionMarketingView.className = "bds.ui.view.PrecisionMarketingView";
