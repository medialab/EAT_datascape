(function($) {
var methods = {
    init : function(options){
        if (!options.dates.max || !options.dates.min)
		    $.error("You must provide dates.min and dates.max")
    
        /**
        * @param v1 the known value
        * @param r1 the value range
        * @param r2 the unkown value range
        * @return the value v2 inside range r2
        */
        var ratio = function( v1, r1, r2 ){
		    return  v1 * r2 / r1;
	    }    
    
        var computatedt = function (date1, date2 ){
            var diff = new Date();
            diff.setTime(Math.abs(date1.getTime() - date2.getTime()));

            var dt = { "ms": diff.getTime() };
		    
            dt.weeks  =  Math.floor( dt.ms / (1000 * 60 * 60 * 24 * 7));
            dt.ms    -=  dt.weeks * (1000 * 60 * 60 * 24 * 7);
            dt.days   =  Math.floor( dt.ms / (1000 * 60 * 60 * 24)); 
            dt.ms    -=  dt.days * (1000 * 60 * 60 * 24);
            dt.hours  =  Math.floor( dt.ms / (1000 * 60 * 60)); 
            dt.ms    -=  dt.hours * (1000 * 60 * 60);
            dt.mins   =  Math.floor(dt.ms / (1000 * 60)); 
            dt.ms    -=  dt.mins * (1000 * 60);
            return dt;
        }
    
        var defaults ={
            dates:{
	            mint:0, // min in milliseconds, leave default
	            maxt:0, // idem, leave default
	            dt:0
            },
            pointer:{
	            tag: "<div />",
	            atts:{
		            "class" : "time_point"
	            }
            }
        } 
        
        var dt = {"weeks":0, "months":0, "years":0},
		    settings = $.extend({}, defaults, options );
		
		$.extend( dt, computatedt(settings.dates.max, settings.dates.min ) );
		
		// computate settings.dates.dt
		settings.dates.mint = settings.dates.min.getTime();
		settings.dates.maxt =  settings.dates.max.getTime();
		settings.dates.dt   = settings.dates.maxt - settings.dates.mint;
		
		var _d = new Date();
		_d.setTime( settings.dates.min.getTime() );
		dt.timestamps = {};
		console.log("timeline", dt.weeks);
		if( dt.weeks < 50 ){
			console.log( "less than 50 weeks...month by month");
			// months by months
			
			// add months by months
			dt.timestamps = {};
			while( _d.getTime() < settings.dates.maxt ){
				_d.setMonth( _d.getMonth() + 1, 1 );
				_d.setHours(0, 0, 0, 0);
				if( _d.getTime() > settings.dates.maxt ){
					break;
				}
				dt.timestamps[ $.datepicker.formatDate('M yy',_d) ] = _d.getTime();
			}
			console.log( _d, dt.timestamps );
		} else if( dt.weeks < 100 ){
			// every three months
			dt.timestamps = {};
			while( _d.getTime() < settings.dates.maxt ){
				_d.setMonth( _d.getMonth() + 3, 1 );
				_d.setHours(0, 0, 0, 0);
				if( _d.getTime() > settings.dates.maxt ){
					break;
				}
				dt.timestamps[ $.datepicker.formatDate('M yy',_d) ] = _d.getTime();
			}
			console.log( _d, dt.timestamps );
		} else if( dt.weeks < 1000 ) {
			console.log( "less than 100 weeks...years is better now");
			
			while( _d.getTime() < settings.dates.maxt ){
				_d.setFullYear( _d.getFullYear() + 1, 0, 1 );
				_d.setHours(0, 0, 0, 0);
				if( _d.getTime() > settings.dates.maxt ){
					break;
				}
				dt.timestamps[ _d.getFullYear() + "" ] = _d.getTime();
			}
		} else {
			while( _d.getTime() < settings.dates.maxt ){
				_d.setFullYear( _d.getFullYear() + 5, 0, 1 );
				_d.setHours(0, 0, 0, 0);
				if( _d.getTime() > settings.dates.maxt ){
					break;
				}
				dt.timestamps[ _d.getFullYear() + "" ] = _d.getTime();
			}
		}
		// having this times
		var utmostPointer = null;
		for( i in dt.timestamps ){
			var pointer = $( settings.pointer.tag, settings.pointer.atts )
				.css({
				    "left" : ratio(dt.timestamps[i] - settings.dates.mint, settings.dates.dt, 100) +"%",
				    "position" : "absolute"
				})
				.text( i );
				
			this.append(pointer).css("position", "relative")
			if( utmostPointer == null || dt.timestamps[i] > utmostPointer.timestamp ){
				utmostPointer = pointer;
				utmostPointer.timestamp =  dt.timestamps[i];
			} 	
		}
		if( utmostPointer != null ){
			utmostPointer.addClass("time_point_last");
		}
	}
}

$.fn.timeline = function(method){
  // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.timeline' );
    } 
};
  
})(jQuery);
