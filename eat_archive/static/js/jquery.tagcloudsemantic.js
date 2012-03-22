(function($){

var normalizeSizeC = function(start, finish, thresold_min, thresold_max) {
            console.log(start, finish, thresold_min, thresold_max);
    return function(size) {

        var diff_start = start[1] - start[0],
            diff_finish = finish[1] - finish[0];

        if (diff_start==0)
            return finish[0] + finish[1] / 2;
        else {
            if ((thresold_max && size>thresold_max) ||
                (thresold_min && size<thresold_min)) 
                return 0;
            return (size - start[0])/diff_start*diff_finish+finish[0] ;
        }
    }
}

var methods = {
    init : function(options) {
        defaults = {
            "unit"     : "em",
            "min_size" : 1, 
            "max_size" : 3
        }
        settings = $.extend({}, defaults, options);
        _.each(this, function(tag_cloud) { 
            $(tag_cloud).data("settings", settings);
            $(tag_cloud).tagcloudsemantic("render");
        });
    },
    render : function(thresold_min, thresold_max) {
        settings = $(this).data("settings");
        _.each(this, function(tag_cloud) { // tag_cloud is a class so this is an array of tag_clouds
            // find min and max
            var min_size = Infinity,
                max_size = -Infinity;
            sizes = []
            tag_cloud = $(tag_cloud);
            _.map(tag_cloud.find(".tag"), function(item) {
                size = $(item).metadata({type: 'attr', name: 'data-tag'}).size;
                sizes.push(size)
                if (size > max_size && size < (thresold_max || Infinity)) 
                    max_size = size;
                if (size < min_size && size > (thresold_min || -Infinity)) 
                    min_size = size;
            });
            $(tag_cloud).data("thresold_min", thresold_min || min_size);
            $(tag_cloud).data("thresold_max", thresold_max || max_size);
            $(tag_cloud).data("sizes", sizes);
           
            var normalizeSize = normalizeSizeC([min_size, max_size], [settings.min_size, settings.max_size], thresold_min, thresold_max); 
            _.map(tag_cloud.find(".tag"), function(item, key) {
                var size = normalizeSize(sizes[key])
                  , display =  size!=0 ? "auto" : "none" 
                  , display =  "auto" ; 
                $(item).css({
                    "font-size" : normalizeSize(sizes[key]) + settings.unit,
                    "line-height" : normalizeSize(sizes[key]) + settings.unit,
                    "display" : display,
                    "word-wrap" : "break-word",
                    "max-width" : "100%",
                });
            });
        });
    }
};

$.fn.tagcloudsemantic = function(method){
  // Method calling logic
    if ( methods[method] ) {
      return methods[ method ].apply( this, Array.prototype.slice.call( arguments, 1 ));
    } else if ( typeof method === 'object' || ! method ) {
      return methods.init.apply( this, arguments );
    } else {
      $.error( 'Method ' +  method + ' does not exist on jQuery.tagcloudsemantic' );
    } 
};
})(jQuery);
