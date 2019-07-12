EAT = { templates:{}};

EAT.initView = function(){
	console.log("init view" );
	var h = $(".menu").height();
	$(".view").css({'margin-top': h });
	// $("#logo").animate({height: h- 20} ); // logo inner padding
	
	var ph = $(".activity").height();// pahe height
	// $("#mcs3_container").css({'height': ph}); // without padding!
	
	$(".view .annotations").css({'height': ph});
	$(".activity").css({'height': ph});
	var tagsHeight = Math.max( $("#tagclouds").height(), $("#map-side-bar").height() );
	$("#tagclouds").height( tagsHeight);
	$("#map-side-bar").height( tagsHeight );
	$("#map").height( tagsHeight ); 
	
	$(".annotations").on( "mouseenter", ".annotation-link", function(){
		$(this).addClass("highlighted");//animate({backgroundColor:"#ffffff"},200);
	});
	$(".annotations").on( "mouseleave", ".annotation-link", function(){
		//if( !$(this).hasClass("filtered"))
			$(this).removeClass("highlighted");
	})
	/*
	$(".annotation-link" ).mouseenter( function(){
		$(this).animate({backgroundColor:"#ffffff"},200);
	}). mouseleave( function(){
		$(this).animate({backgroundColor:"transparent"},200);
	});
	*/

};


EAT.templates.filter = "<div class='filter'><span class='filter-content'></span><span class='filter-remove'  title='undo selection'>x</span></div>";

/**
 * get browser bounds dimensions in height and width
 */
EAT.getBounds = function(){
	var theWidth, theHeight;
	// Window dimensions: 
	if (window.innerWidth) {
		theWidth=window.innerWidth;
	}
	else if (document.documentElement && document.documentElement.clientWidth) {
		theWidth=document.documentElement.clientWidth;
	}
	else if (document.body) {
		theWidth=document.body.clientWidth;
	}
	if (window.innerHeight) {
		theHeight=window.innerHeight;
	}
	else if (document.documentElement && document.documentElement.clientHeight) {
		theHeight=document.documentElement.clientHeight;
	}
	else if (document.body) {
		theHeight=document.body.clientHeight;
	}	
	
	return { "width": theWidth, "height": theHeight };
};

EAT.initCustomScrollbars = function(){
	/* 
	malihu custom scrollbar function parameters: 
	1) scroll type (values: "vertical" or "horizontal")
	2) scroll easing amount (0 for no easing) 
	3) scroll easing type 
	4) extra bottom scrolling space for vertical scroll type only (minimum value: 1)
	5) scrollbar height/width adjustment (values: "auto" or "fixed")
	6) mouse-wheel support (values: "yes" or "no")
	7) scrolling via buttons support (values: "yes" or "no")
	8) buttons scrolling speed (values: 1-20, 1 being the slowest)
	*/
	$("#mcs3_container").mCustomScrollbar("vertical",900,"easeOutCirc",1.05,"auto","yes","no",0);
	$("#note-attached").mCustomScrollbar("vertical",900,"easeOutCirc",1.05,"auto","yes","no",0);
}

/**
 * split a given div into two or main divs. Needs the columnizer plugin, cfr.
 * http://welcome.totheinter.net/columnizer-jquery-plugin/
 * @param target	- jQuery object, having a text()
 * @param settings	- object settings. e.g. {columns: number of columns}
 */
EAT.splitIntoColumns = function( target, settings ){
	target.columnize( settings);

}

EAT.supersize = {};
EAT.supersize.disable = function(){ // make every  isible elements of supersize navigation unvisible
	$(".load-item").hide();
	$("#supersized-loader").hide();
}

/** 
 * @param images - array of image object {image: "url", title: "title"}
 */
EAT.initSupersize = function ( images ) {
    console.log("images.length for supersize script", images.length);
	if( images.length == 0 ) return; 
	
	// supersize thing
	$(".init-supersized").click(function(){
		$("#overlay").css("z-index",998);
		$("#supersized").css("z-index",999);
		$(".load-item").css("z-index",1000);
		$(".supersized-controllers").show();
		$(".supersized-dependent").hide();
		
	});
	$("#logo, #supersized").click(function(){
		$("#overlay").css("z-index",-998);
		$("#supersized").css("z-index",-999);
		$(".supersized-controllers").hide();
		$(".supersized-dependent").show();
	});
	/*
	$.supersized({
				// Functionality
				slide_interval   :  2000,		// Length between transitions
				transition       : 0, 			// 0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
				transition_speed : 	300,		// Speed of transition					   
				// Components							
				slide_links		 :	'blank',	// Individual links for each slide (Options: false, 'num', 'name', 'blank')
				slides 		     :  images,
				slideshow			: true
	});*/
	$.supersized({
				
					// Functionality
					slideshow               :   1,			// Slideshow on/off
					autoplay				:	1,			// Slideshow starts playing automatically
					start_slide             :   1,			// Start slide (0 is random)
					stop_loop				:	0,			// Pauses slideshow on last slide
					random					: 	1,			// Randomize slide order (Ignores start slide)
					slide_interval          :   5000,		// Length between transitions
					transition              :   0, 			// 0-None, 1-Fade, 2-Slide Top, 3-Slide Right, 4-Slide Bottom, 5-Slide Left, 6-Carousel Right, 7-Carousel Left
					transition_speed		:	500,		// Speed of transition
					new_window				:	1,			// Image links open in new window/tab
					pause_hover             :   0,			// Pause slideshow on hover
					keyboard_nav            :   1,			// Keyboard navigation on/off
					performance				:	3,			// 0-Normal, 1-Hybrid speed/quality, 2-Optimizes image quality, 3-Optimizes transition speed // (Only works for Firefox/IE, not Webkit)
					image_protect			:	1,			// Disables image dragging and right click with Javascript
															   
					// Size & Position						   
					min_width		        :   0,			// Min width allowed (in pixels)
					min_height		        :   0,			// Min height allowed (in pixels)
					vertical_center         :   1,			// Vertically center background
					horizontal_center       :   1,			// Horizontally center background
					fit_always				:	0,			// Image will never exceed browser width or height (Ignores min. dimensions)
					fit_portrait         	:   1,			// Portrait images will not exceed browser height
					fit_landscape			:   0,			// Landscape images will not exceed browser width
															   
					// Components							
					slide_links				:	'blank',	// Individual links for each slide (Options: false, 'num', 'name', 'blank')
					thumb_links				:	1,			// Individual thumb links for each slide
					thumbnail_navigation    :   0,			// Thumbnail navigation
					slides 					:  /*	[			// Slideshow Images
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/kazvan-1.jpg', title : 'Image Credit: Maria Kazvan', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/kazvan-1.jpg', url : 'http://www.nonsensesociety.com/2011/04/maria-kazvan/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/kazvan-2.jpg', title : 'Image Credit: Maria Kazvan', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/kazvan-2.jpg', url : 'http://www.nonsensesociety.com/2011/04/maria-kazvan/'},  
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/kazvan-3.jpg', title : 'Image Credit: Maria Kazvan', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/kazvan-3.jpg', url : 'http://www.nonsensesociety.com/2011/04/maria-kazvan/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/wojno-1.jpg', title : 'Image Credit: Colin Wojno', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/wojno-1.jpg', url : 'http://www.nonsensesociety.com/2011/03/colin/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/wojno-2.jpg', title : 'Image Credit: Colin Wojno', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/wojno-2.jpg', url : 'http://www.nonsensesociety.com/2011/03/colin/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/wojno-3.jpg', title : 'Image Credit: Colin Wojno', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/wojno-3.jpg', url : 'http://www.nonsensesociety.com/2011/03/colin/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/shaden-1.jpg', title : 'Image Credit: Brooke Shaden', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/shaden-1.jpg', url : 'http://www.nonsensesociety.com/2011/06/brooke-shaden/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/shaden-2.jpg', title : 'Image Credit: Brooke Shaden', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/shaden-2.jpg', url : 'http://www.nonsensesociety.com/2011/06/brooke-shaden/'},
														{image : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/slides/shaden-3.jpg', title : 'Image Credit: Brooke Shaden', thumb : 'http://buildinternet.s3.amazonaws.com/projects/supersized/3.2/thumbs/shaden-3.jpg', url : 'http://www.nonsensesociety.com/2011/06/brooke-shaden/'}
												]*/ images,
												
					// Theme Options			   
					progress_bar			:	1,			// Timer for each slide							
					mouse_scrub				:	0
					
				});
}

EAT.phases={ previous:0, annotated:{} };
/** mouse over on a phase handler
 * @param phase id */
EAT.phases.mouseover = function( nr_phase, target ){
	
	console.log( "EAT.phases.mouseover", nr_phase, "previous:",EAT.phases.previous );
	
	if( EAT.phases.previous != 0 && EAT.phases.previous != nr_phase ){
			EAT.phases.mouseout( EAT.phases.previous );
	}
	EAT.phases.previous = nr_phase;
	
	$(".annotation-link."+nr_phase).addClass("highlighted");
	//$(".gantt-bar."+nr_phase).
	$(".gantt-bar."+nr_phase).parent().parent(".mz-container").parent().parent().addClass("highlighted");
	return;
	
	if( target ){
		$(target).addClass("phase-hover");	
	}
	
	// phase container
	var phasebox = $("."+nr_phase).parent().parent().parent().parent();
	// console.log( phasebox );
	if( phasebox.hasClass( "actor-container" ) ){
		phasebox.addClass( "mainHovered" );	
	}
	return;
	// background red
	$("."+nr_phase).addClass("mainHovered")
				    .parent().not("#gantt")
				    .parent().not("#mainrow").parent().addClass("mainHovered");
	return;
	
	if (EAT.hovered_phase != nr_phase) {
			old = EAT.hovered_phase;
			
			// we hide the old one
			rows = $("."+old).removeClass("mainHovered")
				   .parent().not("#gantt")
				   .parent().parent().removeClass("highlit");

			if ($("#onlySelected").is(":checked") ) {
				rows.hide();
				$(".annotation-link").hide();
			}
			
			EAT.hovered_phase = nr_phase;
			// display the one that has been selected
			rows = $("."+nr_phase).addClass("mainHovered")
				    .parent().not("#gantt")
				    .parent().not("#mainrow").parent().addClass("highlit");
			if ($("#onlySelected").is(":checked") ) {
				rows.show();
				$(".annotation-link."+nr_phase).show();
			}
		}
}

/** mouse over on a phase handler */
EAT.phases.mouseout = function( nr_phase ){
	$(".mainHovered" ).removeClass("mainHovered")// console.log( phasebox );}
	$(".phase-hover").removeClass("phase-hover");
	// $(".annotation-link").removeClass("highlighted");
	$(".highlighted").removeClass("highlighted");
	
}


/** mouse over on a phase handler */
EAT.phases.click = function( nr_phase ){
	
		// show or hide annotations
		$(".annotation-link").hide();
		$("..annotation-link."+nr_phase).show();
		
		// re-initialize scrollbars
		EAT.initCustomScrollbars();
		
		// 
		EAT.phases.filters.add( nr_phase );
		// 
		$(".actor-container").hide();
		$("."+nr_phase).parent().parent().parent( ".actor" ).parent().show();
}



/**
 * SELECTION FILTERS functions
 */
EAT.phases.hasFilter = false;

EAT.phases.filters = {};

EAT.phases.filters.add = function( nr_phase ){ // add functions 
	// $(".filters").empty();
	// if ( !EAT.phases.hasFilter ){
		$(".filters").empty().append(
			// enable reset functionality and qtip on title as well
			$( EAT.templates.filter )
		);
		var phase_id = nr_phase.replace(/[^\d]+/,'');
		console.log( "EAT.phases.filters.add modiofied" , nr_phase, phase_id );
		
		var phase_title =  EAT.phases.items[ phase_id ].tags.join(", ") + " (" + EAT.phases.items[ phase_id ].start_date.split("-")[0] +")" ; 
		
		// + " sources:" + (EAT.phases.annotated[ phase_id ]?EAT.phases.annotated[ phase_id ]:0);
		$(".filters .filter-remove").css("cursor","pointer").qtip( EAT.qTipStaticConfig ).click( EAT.phases.reset );
		$(".filters .filter-content").attr(
			"title",phase_title
		).qtip( EAT.qTipStaticConfig  ).text( 
			EAT.functions.fragment( phase_title )
		);
	// }
	EAT.phases.hasFilter = true;
}

EAT.phases.filters.reset = function(){ // Remove every selection filter
	EAT.phases.hasFilter = false;
	$(".filters").empty();		
}

/**
 * Common FUNCTIONS
 */
 EAT.functions = {};
 EAT.functions.fragment = function( t, n ){
	// @param t: text to crop
	// @param n: number of -space separated- words to be included	
	return t.split(" ").slice(0,!n?3:n).join(" ") + "…";
 }
 
 /**
  * @param option: see custom settings below
  * @return a dictionary where each iterable object is transformed in a couple key value. 
  */	
 EAT.functions.map = function( options ){
 	var settings = $.extend({
		target:[], // an iterable object (var i in…)
		key:function(el, i){return i}, // should return the key to assign to the returned object
		value:function(el, i){return el},// should return the value
	}, options);
	
	var _m = {};
	for( var i in settings.target ){
		_m[ settings.key( settings.target[i], i ) ] = settings.value( settings.target[i], i );
	}
	return _m;
 }

/*****************************/

EAT.phases.reset = function(){ 
	$(".actor-container").show();
	$(".annotation-link").show();
	// empty filters
	EAT.phases.filters.reset();
}




/**
 * TOOLTIP HANDLERS
 */
EAT.qTip = function () {
        $('div[title]').qtip(EAT.qTipConfig);
        $('a[title]').qtip(EAT.qTipConfig);
};

EAT.qTipEnable = function(){
	$('.qTip-enable').qtip(EAT.qTipStaticConfig);
}

EAT.qTipStaticConfig = {
    position : { my :"bottom center", at : "top center"	},
	style:     {    classes: 'ui-tooltip-daniele ui-tooltip-shadow'}
}

EAT.qTipConfig = {
    position : { my :"bottom center", at : "top center", target: 'mouse', 
    	viewport: $(window), // Keep it on-screen at all times if possible
		adjust: {
			x: 0,  y: -10
		}
	},
	hide: {
		fixed: true	
	},
    style:     {    classes: 'ui-tooltip-daniele ui-tooltip-shadow'}
} 

/**
 * SOURCES AKA ANNOTATIONS
 */
EAT.sources = {};
EAT.sources.load = function( $this ) {
		nr_annotation = $this.attr("data-annotation");
		source = sources[ nr_annotation ];
		if( !source ) return;
		previous = $this.prev().attr("data-annotation");
		next = $this.next().attr("data-annotation");
		
		
		console.log( "EAT.source.load", next, previous  );
		$next = "";
		if( next ){
			console.log("has next");
			$next = $("<a/>",{"id":"next-source"}).click(function(event){event.preventDefault();EAT.sources.load( $this.next() )}).text(" next ");
		}
		$previous = "";
		if( previous ){
			console.log("has previous");
			$previous = $("<a/>",{"id":"previous-source"}).click(function(event){event.preventDefault();EAT.sources.load( $this.prev() )}).text(" previous ");
		}
		
		
		source.title = source.title.replace( /_/g," ");
		$("#source-title").empty().text( source.title );
		$("#source-header").empty().text( source.title + " ");
		$("#source-header").append( $previous );
		$("#source-header").append( $next );
		
		$("#source-reference").empty().text( source.ref_bibliographic );
		$("#source-authors").empty();
		$("#source-text").empty();
		$("#source-mark").empty();
		
		if( source.authors )
			$("#source-authors").empty().text( source.authors );
		
		if( source.sourcemark)
			$("#source-mark").empty().text( ", " + source.sourcemark );
		if( source.text )
			$("#source-text").empty().html( "&laquo;" + source.text.replace( /[\n\r]+/g,"<br/><br/>") + "&raquo;" );
		$("#source-image").empty();
		
		if( source.image.url ) {
			var modal_width = Math.min( EAT.getBounds().width - 100, source.image.width );
			var modal_height = Math.min( EAT.getBounds().height - 100, source.image.height );
			console.log("image loaded",source.image.width, EAT.getBounds().width, "min:",modal_width ); 
			
			$('#annotation-dialog').css({
				"width": modal_width,
				"margin-left": - modal_width / 2,
				"margin-top": - modal_height / 2, 
				"height": modal_height,
			});
			$("#source-image").append("<img src='"+source.image.url+"' style='width:100%'/>")
			$('#note-attached').css({height:modal_height - 100,width:modal_width-50});
			/*
			var modalHeight = Math.min( EAT.getBounds().height - 100, ( source.image.height + 100 ) );
			var imageWidth = Math.min( EAT.getBounds().width - 100, ( source.image.width + 100 ) );
			var modalWidth =  Math.min( imageWidth, ( source.image.width + 100 ) );
			
			
			$('#annotation-dialog').css({
				"margin-left": - modalWidth / 2, 
				"margin-top": - modalHeight / 2, 
				"height": source.image.height, 
				"width": modalWidth });
			$('#note-attached').css({height:modalHeight - 80});
			$("#source-image").append("<img src='"+source.image.url+"' style='width:100%'/>")
			*/
			
		} else {
			$('#annotation-dialog').css({"margin-left": - 280, width: 560, "margin-top": - 250, "height": 500 });
			$('#note-attached').css({height:400,width:510});
		}
		$('#annotation-dialog').modal("hide");	
		$('#annotation-dialog').modal("show");	
}

