/*
    This plugin enables you to create gantt chart in a specific container.
    You just have to give it some objects having start_date and end_date and 
    it will draw it for you.

    It'll manage overlapping phases with ease.

    In this doc I will call an object with start_date and end_date a *phase* and 
    several phases make a *project*.

    Example ::
        
        JS : 
        
            <script type="text/javascript">
            dates = {
                {"start_date" : Date(2012,00, 12),
                 "end_date"   : Date(2012, 05, 13)},
                {"start_date" : Date(2012,02, 07),
                 "end_date"   : Date(2012, 04, 28)},
                {"start_date" : Date(2012,08, 12),
                 "end_date"   : Date(2012, 10, 30)},
            }
            $("#gantt").gantt(dates);
            </script>
            
        HTML :
        
            <div id="gantt"></div>
*/

(function($){


var methods = {
    init : function(phases, options) { 
        var defaults = 
                    { "sorted" : false
                    , "height" : "20px"
                    , "extraHeight" : 5
                    , "padding_y" : "4px"
                    , "customClass" : function (phase) {
                        return ""
                    }
                    , "title" : function (phase) {
                        return phase.start_date.toDateString() + " - " + phase.end_date.toDateString()
                     }
                    , "content" : function (phase) {
                            return $("<span></span>")
                                        .text(phase.label)
                                        .addClass("gantt-label")

                        }
                    }
        var settings = $.extend({}, defaults, options),
            container = this,
            
            // We calculate the minimum/maximum date of the project 
            //min_date = settings.min_date || _.min(phases, function(phase) {if (phase.start_date) return phase.start_date}).start_date,
            //max_date = settings.max_date || _.max(phases, function(phase) {if (phase.end_date) return phase.end_date} ).end_date,
            
            // Overall duration
            total = max_date - min_date,
            
            // Utility function that returns a jquery element representing
            // a phase ready to insert into a container
            draw_gantt_bar = function(phase) {
                var duration = phase.end_date - phase.start_date,
                left_offset = ( phase.start_date - min_date ) / total * 100;
                width=Math.floor(duration/total*100*10)/10
                return $("<div></div")
                               .css({   "width"  : Math.floor(duration/total*100*10)/10 + "%", 
                                        "position" : "absolute",
                                        "left"   : Math.ceil(left_offset*10)/10 + "%"  })
                                .attr("title", settings.title(phase))
                                .append(settings.content(phase))
                                .addClass("gantt-bar")
                                .addClass(settings.customClass(phase))
                                .data("level", phase.level);
            };

        // Every phase that doesn't have an end_date will have max_date as its end_date
        phases = _.map(phases, function (phase) { 
            if (!phase.end_date) {
                    phase.end_date = max_date;
            }
                return phase;
        });

        // If the phases have not been sorted by start_date before, sort them
        if (!settings.sorted) 
            phases.sort(function(a, b) { return a.start_date - b.start_date });

        var opened_phases = [],
            max_level = 0,
            y_factor = parseInt(settings.padding_y) + parseInt(settings.height);

        // let's add elements for each phase
        // We have to compute its level to prevent overlapping
        // each element will know it's level through .data()
        
        _.each(phases, function (phase, key) {
            if (key !=0) { // let's update opened_phases by removing phases that are no longer opened
                var noLongerOpen = function () {
                    return function(item) {
                        return item.end_date < phase.start_date;    
                    }
                }();
                opened_phases = _.reject(opened_phases, noLongerOpen); 
            }
            
            if (opened_phases.length > 0) {
                phase.level = _.max(opened_phases, function(item) { return item.level; }).level+1;
                max_level = _.max([max_level, phase.level])
            }
            else 
                phase.level = 0;

            opened_phases.push(phase);
            
            draw_gantt_bar(phase, total, settings).appendTo(container);                                
        });

        container.css({"position":"relative", 
                    "height" : (y_factor * (max_level+1)) + 
                                parseInt(settings.height) + 
                                settings.extraHeight + "px"
                    })
             .addClass("gantt-container")
            .data("max_date", max_date)
            .data("min_date", min_date)
            .data("max_level", max_level)
            .data("settings", settings);
        
        this.gantt('redraw');
        return this;
    },
    
    expand : function(new_height) {
        if (!new_height){
            $.error( 'Must provide a new height' );
            return this;
        }
        this.data("expanded", this.data("settings").height);
        this.data("settings").height = parseInt(new_height) + "px";
        this.addClass("expanded");
        this.gantt('redraw');
        return this;
    },
    
    // to call if changes of heights etc...
    redraw: function() {
        var settings = this.data("settings");

            var max_level = this.data("max_level"),
            barTotalHeight = parseInt(settings.height) + parseInt(settings.padding_y);
            
        _.each(this.children(".gantt-bar"), function(ganttBar) {
            ganttBar = $(ganttBar)
            var bottom = barTotalHeight * ganttBar.data("level")
            ganttBar.css({
              "height" : settings.height,
              "bottom" : bottom + "px",
            });
        });
        this.css({"height": barTotalHeight * (max_level+1) + "px"})
        return this;
    },
    info : function( ) { 
      console.log(this.data("info"));
      return this;
    },
};




$.fn.gantt = function(method){
  // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.gantt' );
    } 
};
})(jQuery);
