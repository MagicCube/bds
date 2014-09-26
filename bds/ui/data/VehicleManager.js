$ns("bds.ui.data");


bds.ui.data.VehicleManagerClass = function()
{
    var me = $extend(MXComponent);
    var base = {};
    
    me.vehicles = [];
    me.autoUpdate = true;
    me.autoUpdateInterval = 30 * 1000;
    
    me.onupdated = null;
    
    var _fakingVehicles = [];
    var _crews = [{"id":"c120054","age":34,"name":"Christa Gentry","gender":"female","phone":"+1 (927) 433-3887"},{"id":"c159139","age":34,"name":"Roberts Mccullough","gender":"male","phone":"+1 (854) 577-3795"},{"id":"c138709","age":30,"name":"Doris Chandler","gender":"female","phone":"+1 (926) 419-3024"},{"id":"c175019","age":26,"name":"Hebert Compton","gender":"male","phone":"+1 (965) 581-3361"},{"id":"c149790","age":26,"name":"Benson Austin","gender":"male","phone":"+1 (998) 563-3540"},{"id":"c123607","age":39,"name":"Fisher Ellison","gender":"male","phone":"+1 (991) 585-3449"},{"id":"c123767","age":25,"name":"Hicks Dean","gender":"male","phone":"+1 (959) 573-2517"},{"id":"c174745","age":40,"name":"Frieda Rivera","gender":"female","phone":"+1 (807) 463-2084"},{"id":"c105435","age":25,"name":"Sonya Cobb","gender":"female","phone":"+1 (878) 474-3578"},{"id":"c108472","age":26,"name":"Gaines Luna","gender":"male","phone":"+1 (967) 413-3940"},{"id":"c155369","age":34,"name":"Deirdre Sutton","gender":"female","phone":"+1 (995) 593-2186"},{"id":"c165222","age":37,"name":"Avila Delacruz","gender":"male","phone":"+1 (980) 581-3698"},{"id":"c187623","age":29,"name":"Anderson Blevins","gender":"male","phone":"+1 (906) 589-2132"},{"id":"c198359","age":22,"name":"Mamie Simmons","gender":"female","phone":"+1 (918) 483-2083"},{"id":"c146785","age":36,"name":"Kline Randall","gender":"male","phone":"+1 (848) 574-3392"},{"id":"c174319","age":27,"name":"Lynch Graham","gender":"male","phone":"+1 (976) 463-3237"},{"id":"c109807","age":25,"name":"Natasha Gallegos","gender":"female","phone":"+1 (981) 583-2202"},{"id":"c129899","age":27,"name":"Tran Schneider","gender":"male","phone":"+1 (924) 587-2912"},{"id":"c168011","age":33,"name":"Swanson Bailey","gender":"male","phone":"+1 (849) 425-3225"},{"id":"c118861","age":35,"name":"Fulton Holman","gender":"male","phone":"+1 (853) 525-2235"},{"id":"c118420","age":40,"name":"Boyle Hansen","gender":"male","phone":"+1 (932) 401-2792"},{"id":"c120213","age":35,"name":"Mccormick Pittman","gender":"male","phone":"+1 (838) 467-2567"},{"id":"c103510","age":29,"name":"King Dale","gender":"male","phone":"+1 (965) 559-2973"},{"id":"c177943","age":30,"name":"Kerr Lewis","gender":"male","phone":"+1 (837) 505-2800"},{"id":"c111965","age":29,"name":"Shelton Ward","gender":"male","phone":"+1 (836) 491-2528"},{"id":"c179775","age":27,"name":"Stacey Chapman","gender":"female","phone":"+1 (989) 492-3472"},{"id":"c147558","age":27,"name":"Helen Combs","gender":"female","phone":"+1 (973) 557-2640"},{"id":"c117293","age":22,"name":"Wilma Watts","gender":"female","phone":"+1 (806) 418-3996"},{"id":"c171177","age":27,"name":"Celia Donovan","gender":"female","phone":"+1 (990) 597-3531"},{"id":"c191432","age":28,"name":"Monique Winters","gender":"female","phone":"+1 (806) 519-3292"},{"id":"c154950","age":39,"name":"Shepherd Blake","gender":"male","phone":"+1 (810) 551-3976"},{"id":"c115139","age":31,"name":"Kayla Larsen","gender":"female","phone":"+1 (882) 454-2943"},{"id":"c105920","age":40,"name":"Tina Petty","gender":"female","phone":"+1 (846) 494-3610"},{"id":"c162749","age":22,"name":"Chapman Greer","gender":"male","phone":"+1 (840) 476-3985"},{"id":"c129965","age":37,"name":"Clements Barrett","gender":"male","phone":"+1 (980) 521-3772"},{"id":"c140294","age":38,"name":"Vickie Wiley","gender":"female","phone":"+1 (985) 588-2183"},{"id":"c143492","age":23,"name":"Brandie Horn","gender":"female","phone":"+1 (837) 535-3080"},{"id":"c199423","age":31,"name":"Reeves Wood","gender":"male","phone":"+1 (845) 531-2928"},{"id":"c160965","age":40,"name":"Meagan Head","gender":"female","phone":"+1 (813) 485-2440"},{"id":"c177802","age":30,"name":"Wilda Bradley","gender":"female","phone":"+1 (826) 487-3709"},{"id":"c146855","age":37,"name":"Lucia Calhoun","gender":"female","phone":"+1 (966) 565-3199"},{"id":"c154525","age":29,"name":"Jami Ramsey","gender":"female","phone":"+1 (989) 576-3884"},{"id":"c187787","age":27,"name":"Stephenson Mayo","gender":"male","phone":"+1 (805) 550-2362"},{"id":"c103052","age":35,"name":"Wall Kerr","gender":"male","phone":"+1 (931) 481-3494"},{"id":"c165543","age":37,"name":"Kristin Ballard","gender":"female","phone":"+1 (878) 425-3450"},{"id":"c102310","age":28,"name":"Minerva Collins","gender":"female","phone":"+1 (952) 432-2739"},{"id":"c171652","age":37,"name":"Tasha Tanner","gender":"female","phone":"+1 (834) 446-3580"},{"id":"c103485","age":23,"name":"Fay Mcintyre","gender":"female","phone":"+1 (994) 566-2482"},{"id":"c136952","age":28,"name":"Melisa Gutierrez","gender":"female","phone":"+1 (935) 471-2459"},{"id":"c172473","age":37,"name":"Sheri Owen","gender":"female","phone":"+1 (974) 507-2129"},{"id":"c198739","age":30,"name":"Gail Turner","gender":"female","phone":"+1 (993) 596-3049"},{"id":"c179411","age":35,"name":"Christie Drake","gender":"female","phone":"+1 (941) 495-2756"},{"id":"c187813","age":38,"name":"Cara Pruitt","gender":"female","phone":"+1 (841) 543-2740"},{"id":"c174448","age":34,"name":"Weaver Williams","gender":"male","phone":"+1 (852) 425-2023"},{"id":"c122062","age":31,"name":"Patricia Estrada","gender":"female","phone":"+1 (971) 519-3665"},{"id":"c177612","age":22,"name":"Watkins Hooper","gender":"male","phone":"+1 (984) 456-2054"},{"id":"c131823","age":38,"name":"Darla Castillo","gender":"female","phone":"+1 (949) 505-3311"},{"id":"c128455","age":35,"name":"Paige Snider","gender":"female","phone":"+1 (882) 581-3151"},{"id":"c109315","age":23,"name":"Nannie Henderson","gender":"female","phone":"+1 (844) 405-2448"},{"id":"c119005","age":37,"name":"Luann Roth","gender":"female","phone":"+1 (940) 500-3172"},{"id":"c137015","age":38,"name":"Brown Thornton","gender":"male","phone":"+1 (920) 484-2842"},{"id":"c147269","age":31,"name":"Rogers Mclean","gender":"male","phone":"+1 (801) 481-2910"},{"id":"c157390","age":40,"name":"Cheri Guerrero","gender":"female","phone":"+1 (851) 472-2131"},{"id":"c189818","age":24,"name":"Evangelina Cleveland","gender":"female","phone":"+1 (859) 494-3373"},{"id":"c195473","age":39,"name":"Wells Wilkinson","gender":"male","phone":"+1 (873) 518-2982"},{"id":"c153349","age":29,"name":"Cline Vincent","gender":"male","phone":"+1 (959) 476-2120"},{"id":"c116278","age":31,"name":"Stokes Rosa","gender":"male","phone":"+1 (873) 430-3905"},{"id":"c120767","age":23,"name":"Alejandra Mcclain","gender":"female","phone":"+1 (813) 591-3103"},{"id":"c189215","age":24,"name":"Wynn Hawkins","gender":"male","phone":"+1 (987) 529-3815"},{"id":"c181523","age":35,"name":"Bond Walters","gender":"male","phone":"+1 (832) 427-3482"},{"id":"c195473","age":34,"name":"Ann Alvarado","gender":"female","phone":"+1 (987) 554-3259"},{"id":"c141922","age":27,"name":"Janell Gilliam","gender":"female","phone":"+1 (950) 535-2972"},{"id":"c105429","age":25,"name":"Guzman Stevenson","gender":"male","phone":"+1 (962) 600-3406"},{"id":"c125036","age":38,"name":"Hoffman Weeks","gender":"male","phone":"+1 (967) 471-3272"},{"id":"c147742","age":22,"name":"Whitney Soto","gender":"female","phone":"+1 (871) 554-2619"},{"id":"c189669","age":25,"name":"Kramer Juarez","gender":"male","phone":"+1 (981) 579-2510"},{"id":"c100147","age":37,"name":"Sharpe Osborn","gender":"male","phone":"+1 (852) 573-2450"},{"id":"c177734","age":25,"name":"Kirk Daniel","gender":"male","phone":"+1 (979) 509-2683"},{"id":"c155620","age":26,"name":"John Fuller","gender":"female","phone":"+1 (819) 594-2126"},{"id":"c106209","age":32,"name":"Vega Torres","gender":"male","phone":"+1 (941) 449-2481"},{"id":"c121748","age":24,"name":"Silvia Morrison","gender":"female","phone":"+1 (961) 434-3313"},{"id":"c149256","age":33,"name":"Jillian Lawrence","gender":"female","phone":"+1 (885) 411-2479"},{"id":"c104070","age":35,"name":"Sweeney Ware","gender":"male","phone":"+1 (932) 593-2820"},{"id":"c133288","age":34,"name":"Lupe Yates","gender":"female","phone":"+1 (818) 425-3590"},{"id":"c118121","age":32,"name":"Socorro Vaughan","gender":"female","phone":"+1 (948) 586-3239"},{"id":"c106487","age":30,"name":"Justice Bartlett","gender":"male","phone":"+1 (921) 452-2177"},{"id":"c143291","age":32,"name":"Latasha Erickson","gender":"female","phone":"+1 (841) 440-3627"},{"id":"c131882","age":40,"name":"Nikki Acosta","gender":"female","phone":"+1 (825) 444-2041"},{"id":"c132890","age":23,"name":"Mallory Mccarthy","gender":"female","phone":"+1 (946) 589-2999"},{"id":"c179226","age":40,"name":"Enid Dawson","gender":"female","phone":"+1 (887) 468-2669"},{"id":"c168358","age":38,"name":"Burns Henson","gender":"male","phone":"+1 (838) 464-2676"},{"id":"c192187","age":26,"name":"Alvarez Sharp","gender":"male","phone":"+1 (861) 419-2602"},{"id":"c161559","age":34,"name":"Sloan Gilmore","gender":"male","phone":"+1 (941) 493-3190"},{"id":"c128915","age":38,"name":"Moss Bond","gender":"male","phone":"+1 (914) 408-3101"},{"id":"c151517","age":37,"name":"Hudson Wilder","gender":"male","phone":"+1 (857) 581-2095"},{"id":"c101893","age":36,"name":"Davis Freeman","gender":"male","phone":"+1 (929) 412-3501"},{"id":"c196910","age":27,"name":"Gould Scott","gender":"male","phone":"+1 (821) 530-3369"},{"id":"c138294","age":32,"name":"Martin Dillon","gender":"male","phone":"+1 (928) 480-2341"},{"id":"c196815","age":38,"name":"Jacobs Rollins","gender":"male","phone":"+1 (818) 474-2568"},{"id":"c131251","age":29,"name":"England Avila","gender":"male","phone":"+1 (951) 409-2147"}];

    base.init = me.init;
    me.init = function(p_options)
    {
        base.init(p_options);
    };
    
    
    me.getVehicle = function(p_id)
    {
        return me.vehicles["v" + p_id];
    };

    me.getReservedVehicles = function()
    {
        var vehicles = [];
        for (var i = 1000000; i < 1000034; i++)
        {
            var vehicle = _getFakingVehicle(i);
            vehicle.vehicleID = vehicle.id;
            vehicle.status = (Math.random() > 0.8 ? "In Maintenance" : "Available");
            if (vehicle.status == "Available")
            {
                vehicle.place = "Station #" + (Math.round(Math.random() * 6) + 1);
            }
            else
            {
                vehicle.place = "Garage";
            }
            vehicles.add(vehicle);
        }
        return vehicles;
    };

    
    var _updateTimer = null;
    me.update = function()
    {
        if (_updateTimer != null)
        {
            clearTimeout(_updateTimer);
            _updateTimer = null;
        }
        var url = "http://developer.trimet.org/beta/v2/vehicles?appID=6DAD686944728A3074AC70AAE&routes=31,14,72,77,70";
        if ($offline)
        {
            url = mx.getResourcePath("bds.res.data.tremet." + "2014_03_25__" + $format(new Date(), "HH_mm"), "json");
        }
        $.ajax({
            url: url
        }).done(function(p_result)
        {
            var vehicles = p_result.resultSet.vehicle;
            me.vehicles = vehicles;
            for (var i = 0; i < me.vehicles.length; i++)
            {
                var vehicle = me.vehicles[i];
                vehicle.route = bds.ui.data.RouteManager.getRoute(vehicle.routeNumber);
                vehicle.routeLine = bds.ui.data.RouteManager.getRouteLine(vehicle.routeNumber, vehicle.direction);
                var fakingVehicle = _getFakingVehicle(vehicle.vehicleID);
                $.extend(vehicle, fakingVehicle);
                me.vehicles["v" + vehicle.vehicleID] = vehicle;
                if (vehicle.lastStopSeq == null)
                {
                    vehicle.lastStopSeq = vehicle.routeLine.stops.length - 3;
                }
                if (vehicle.nextStopSeq == null)
                {
                    vehicle.nextStopSeq = vehicle.routeLine.stops.length - 2;
                }
                
                if (vehicle.delay > 60 && vehicle.messages == null)
                {
                    var messages = [];
                    var reasonLists = [
                       "Traffic",
                       "Emergency",
                       "Mechanical Problem",
                       "Others"
                    ];
                    var x = Math.floor(Math.random() * reasonLists.length);
                    var reason = reasonLists[x];
                    messages.add({ speaker: "crew", text: "Delay reason: " + reason, time: bds.ui.app.getTime().addMinutes(-5) });
                    fakingVehicle.messages = messages;
                    vehicle.messages = messages;
                }
            }
            me.trigger("updated");
        });
        
        if (me.autoUpdate)
        {
            _updateTimer = setTimeout(me.update, me.autoUpdateInterval);
        }
    };
    
    function _getFakingVehicle(p_vehicleId)
    {
        if (_fakingVehicles["v" + p_vehicleId] == null)
        {
            var vehicle = {
                id: p_vehicleId,
                plateNumber: _getRandomPlateNumber(),
                crew: _crews[Math.round(Math.random() * (_crews.length - 1))],
                load: 25 + Math.round(40 * Math.random())
            };
            _fakingVehicles["v" + vehicle.id] = vehicle;
            _fakingVehicles.add(vehicle);
        }

        return _fakingVehicles["v" + p_vehicleId];
    };
    
    function _getRandomPlateNumber()
    {
        return "E" + (100000 + Math.round(200000 * Math.random()));
    };

    return me.endOfClass(arguments);
};
bds.ui.data.VehicleManagerClass.className = "bds.ui.data.VehicleManagerClass";
bds.ui.data.VehicleManager = new bds.ui.data.VehicleManagerClass();