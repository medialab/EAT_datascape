/** packages available */
EAT = {};
EAT.phases = {}
EAT.sources = {}
EAT.view = { stiritup: true};
EAT.z ={
	"slideshow_on": 9999,
	"slideshow_off": 0,
	"logo": 10001,
	"menu":10002,
	"slidestoggler":10000
}

/** EAT core funciton */
EAT.init = function(){
	EAT.resize();
	
	console.log( "EAT initialized" );
	EAT.phases.init();
	
	
	if( typeof( images ) != "undefined" ){
		EAT.slideshow.fromImages();
	} else if ( typeof( sources ) != "undefined" ){
		EAT.slideshow.fromSources(); 
	}
	
	EAT.slideshow.init();
	
	EAT.sources.init();
	EAT.t.init({
		start_date: new Date( "2008/12/31" ),
		end_date: new Date( "2012/02/10" )
	});
	
	EAT.zoom.init();
	EAT.video.init();
	EAT.map.init();
	
	// start tooltip
	EAT.scrolling.init();
}

EAT.resize = function(){
	EAT.header_height = $("#header-outer").height();
	EAT.height = $(window).height();
	EAT.width = $(window).width();
	// inscribe here all resizable function		
	EAT.view.resize();
	EAT.slideshow.resize();
	EAT.sources.resize();
	EAT.video.resize();
	EAT.map.resize();
}

/** SLIDESHOW */
EAT.slideshow = { images:[] };
EAT.slideshow.fromImages = function(){
	for( var i in images ){
		images[i].url = "./media/" + images[i].url;
		EAT.slideshow.images.push( images[i] );	
	}
}
EAT.slideshow.fromSources = function(){
	for( var s in sources ){
		if( sources[s].image ){
			sources[s].image["title"] = sources[s].ref_bibliographic;
			EAT.slideshow.images.push( sources[s].image );
		}
	}	
}
EAT.slideshow.init = function(){
	/* try{
	if( !sources ) return;
	} catch( e ){
		console.log( "EAT.slideshow.init","sources are not available"); return;	
	}
	// load images to lad
	for( var s in sources ){
		if( sources[s].image ){
			sources[s].image["title"] = sources[s].ref_bibliographic;
			EAT.slideshow.images.push( sources[s].image );
		}
		
	} */
	
	if( EAT.slideshow.images.length == 0 ){
		// 
		$(".item.slides").hide();
		return;	
	}
	console.log( "EAT.slideshow.init" , EAT.slideshow.images);
	
	// setuptimer
	
	$("#logo").css({"z-index": EAT.z.logo});
	
	$(".item.slides").css({"z-index": EAT.z.slidestoggler}).click(function(){
		if( !EAT.slideshow.toggled ){
			EAT.slideshow.toggled = true;
			$("#slideshow_info").show();
			$(".item.slides").addClass("selected");
			$("#slideshow").css("z-index", EAT.z.slideshow_on );
		} else {
			EAT.slideshow.toggled = false;
			$("#slideshow_info").hide();
			$(".item.slides").removeClass("selected");
			$("#slideshow").css("z-index", EAT.z.slideshow_off );
		}
	});
	
	$("#slideshow").click(function(){
		EAT.slideshow.toggled = false;
		$("#slideshow_info").hide();
		$(".item.slides").removeClass("selected");
		$("#slideshow").css("z-index", EAT.z.slideshow_off );
	});
	
	// start timer
	EAT.slideshow.cursor = 0; // image to be loaded
	EAT.slideshow.start();
}

EAT.slideshow.fadeOut = function(){
	$("#slide-container").removeClass("fade-in").addClass("fade-out");	
}

EAT.slideshow.fadeIn = function(){
	$("#slide-container").removeClass("fade-out").addClass("fade-in");
}

EAT.slideshow.timerHandler = function(){
	EAT.slideshow.cursor ++;
	if( EAT.slideshow.cursor > EAT.slideshow.images.length-1){
		EAT.slideshow.cursor = 0;// loop
	}
	// preloader
	EAT.slideshow.preloader = new Image();
	EAT.slideshow.preloader.src = EAT.slideshow.images[ EAT.slideshow.cursor ].url;
	EAT.slideshow.timer_verify_loading = setInterval( EAT.slideshow.loadingHandler,200 );
	
	
}

EAT.slideshow.pause = function(){
	EAT.slideshow.paused = true;
	clearTimeout( EAT.slideshow.timer );
}

EAT.slideshow.start = function(){
	EAT.slideshow.paused = false;
	EAT.slideshow.timer = setTimeout( EAT.slideshow.timerHandler,3000 );	
}

EAT.slideshow.loadingHandler = function(){
	// console.log( "verify loading of", EAT.slideshow.preloader );
	if( EAT.slideshow.preloader.complete ){
		clearInterval( EAT.slideshow.timer_verify_loading );
		EAT.slideshow.loadedHandler();
	}
}

EAT.slideshow.loadedHandler = function(){
	$("#slide-container").css("background","url('"+ EAT.slideshow.images[ EAT.slideshow.cursor ].url +"')");
	$("#slideshow_info").text(EAT.slideshow.images[ EAT.slideshow.cursor ].title);	
	EAT.slideshow.timer = setTimeout( EAT.slideshow.timerHandler,3000 );
}

EAT.slideshow.resize = function(){
	$("#slideshow").css({
		width: EAT.width,
		height: EAT.height	
	});
	//$("#slideshow_info")
}

/** FILTERS */
EAT.filters = { previous:false };
EAT.filters.phase = function( phase ){
	// .phase
	console.log( phase );
	
	var phase_text = "<span class'label'>filter:</label>" +( phase.description? "<b>"+ phase.description +"</b>, ":'') + (phase.tags.length>0?"<em>"+phase.tags.join(", ") + "</em> (":'') + EAT.t.format ( phase.start_date ) + " to " + EAT.t.format ( phase.end_date ) +")";
	
	EAT.filters.clear();
	if( EAT.filters.previous ){
		if( EAT.filters.previous == phase.id ) return; 
	}
	EAT.filters.previous = phase.id;
	
	$(".filters").show().append(
		$("<div/>",{"class":"filter"}).html( phase_text ),
		$("<div/>",{"class":"remove-filter"}).click( EAT.filters.clear ),
		$("<div/>",{"class":"clear"})
	);
	
	// 
	$(".actor:not(.phase_"+phase.id+")").addClass("force-display-none");
	$(".source-link:not(.phase_"+phase.id+")").addClass("force-display-none");//hide();
} 
EAT.filters.clear = function(){
	EAT.filters.previous = false;
	$(".filters").empty().hide();
	$(".force-display-none").removeClass("force-display-none");
}

/** PHASES */
EAT.phases.init = function(){
	// load vars
	try{
		if(!phases) return;
		
	} catch( e) {
		
		console.log("no phases available. skip.");return;	
	}
	$("#timeline").on("click", ".view-phase , .navigator-phase", EAT.phases.click);
	$("#timeline").on("mouseenter", ".view-phase, .navigator-phase", EAT.phases.mouseenter);
	$("#timeline").on("mouseleave", ".view-phase , .navigator-phase", EAT.phases.mouseleave);
	$(".source-link").removeClass("highlighted")
}		

EAT.phases.click = function( event){
	// get chlsss phase
	var phase =  event.currentTarget.className.split(" ")[0];// let's sassume that phase_12131 is the very first class name in class stuffs.
	var phaseobj =   EAT.phases.find( phase );
	if( phaseobj == false ) return;
	EAT.filters.phase( phaseobj);
	// build filter
}

// e.g EAT.phases.get( "phase_897" )

EAT.phases.find = function( phase ){
	for( var i in phases ){
		if( "phase_" + phases[i].id == phase)
			return phases[i]
	}	
	return false;
}

EAT.phases.formatTitle = function( phase ){
	
	return ( phase.description? "=/"+ phase.description +"/=":'') + (phase.tags.length>0?"<em>"+phase.tags.join(", ") + "</em>--":'') + EAT.t.format ( phase.start_date ) + " to " + EAT.t.format ( phase.end_date );	
}

EAT.phases.mouseenter = function( event){
	// get chlsss phase
	var phase =  event.currentTarget.className.split(" ")[0];// let's sassume that phase_12131 is the very first class name in class stuffs.
	
	$("."+phase).removeClass("highlighted").addClass("highlighted");
	// console.log( "EAT.phases.click: clicked on phase", phase); 
}
EAT.phases.mouseleave = function( event){
	// get chlsss phase
	var phase =  event.currentTarget.className.split(" ")[0];// let's sassume that phase_12131 is the very first class name in class stuffs.
	$("."+phase).removeClass("highlighted");
	// console.log( "EAT.phases.click: clicked on phase", phase); 
}



/* functions dummies */
EAT._ = {}
EAT._.ratio = function( v1, r1, r2 ){
	// v1:r1 = v2:r2
	return r2*v1/r1;
}
EAT._.min = function( obj, iterator ){
	var v = null;
	if( !iterator){
		iterator = function(v){ return v};	
	}
	for( var k in obj ){
		if( v == null ){
			v = iterator(obj[k]);
			continue;
		}
		v = Math.min( v, iterator(obj[k]) );
	}
	return v;
};
EAT._.max = function( obj, iterator ){
	var v = null;
	if( !iterator){
		iterator = function(v){ return v};	
	}
	for( var k in obj ){
		if( v == null ){
			v = iterator(obj[k]);
			continue;
		}
		console.log( k, iterator(obj[k]) );
		v = Math.max( v, iterator(obj[k]) );
	}
	return v;
}				

/* timelines */
EAT.t = { max_zoom_level:20, zoom_level:1, settings:{start_date:null, end_date:null, months:{ en_US:["Jan.","Feb.","Mar.","Apr.","May","Jun.","Jul.","Aug.","Sept.","Oct.", "Nov.","Dec."]}} };
EAT.t.drag = function( event, ui){
	// console.log( event, ui );
	EAT.t.zoooom( ui.position.left );
}

EAT.t.init = function( object  ){
	try{
		if( !phases )	return;
	} catch( e  ){
		return;
	}
	
	
	$.extend( EAT.t.settings, object );
	
	// computate max e min
	EAT.t.settings.start_time = EAT._.min(phases, function(p){ if( !p.start_date ){ p.start_date = new Date() }; p.start_date = new Date( p.start_date ); return p.start_date.getTime() });
	EAT.t.settings.end_time = EAT._.max(phases, function(p){ if( !p.end_date ){ p.end_date = new Date() }; p.end_date = new Date( p.end_date ); return p.end_date.getTime() });
	
	EAT.t.settings.start_date = new Date( EAT.t.settings.start_time );
	EAT.t.settings.end_date = new Date( EAT.t.settings.end_time );
	
	console.log( "equal???", EAT.t.settings.start_time, EAT.t.settings.end_time );
	
	if( EAT.t.settings.start_time == EAT.t.settings.end_time ) {
		console.log("uhm…. it seems that these two dates are equals. Let's make the latter bigger!");
		EAT.t.settings.end_time += 23*60*60*1000;
		EAT.t.settings.end_date = new Date( EAT.t.settings.end_time );
	
	}
	
	// EAT.t.settings.start_time = EAT.t.settings.start_date.getTime()
	// EAT.t.settings.end_time = EAT.t.settings.end_date.getTime()
	EAT.t.settings.delta_time = EAT.t.settings.end_time -  EAT.t.settings.start_time ;
	
	 
	
	// set mindate maxdate labels
	$("#min-date").text( EAT.t.format( EAT.t.settings.start_date ) ); $("#max-date").text( EAT.t.format( EAT.t.settings.end_date ));
	$("#min-view-date").text( EAT.t.format( EAT.t.settings.start_date ) ); $("#max-view-date").text( EAT.t.format( EAT.t.settings.end_date ));
	
	console.log("EAT.t.init",  EAT.t.settings.start_date,  EAT.t.settings.end_date, EAT.t.settings.delta_time  );
	
	
	// make handle drabbagle
	$( "#timeline-handle" ).draggable({ 
		axis:"x",
		containment: "#timeline-rail",
		drag: EAT.t.drag
	});
	
	EAT.t.navigator_max_width = $("#timeline-rail").width();
	
	EAT.t.draw();
	
}

EAT.t.draw = function(){
	// uses phases obejct. each phase should have a start-date and an end_Date
	$("#timeline-navigator").empty();
	
	var previous = null;
	var level = null;
	var levels = [];
	var phases_div_in_view = [];
	for( var k in phases ){
		if( level == null ) {
			level = 0;
		}
		
		var sp = EAT.t.transform_to_percentage( phases[k].start_date );
		var dp = Math.max( 1, EAT.t.transform_to_percentage( phases[k].end_date )- sp );
		var right = sp + dp;
		// create a div
		var phase_div = $("<div/>",{ 'class':"phase_"+phases[k].id +' navigator-phase',style:"left: " + sp+ "%; width:" + dp + "%"});
		
		// computate level. we need a MORE ELEGANT WAY!
		if( previous != null ){
			if( sp < previous.right ){
				level = previous.level + 1;
				if( levels[ level ] ){
					if( right > levels[ level ].right ){ levels[ level ].right = right;}	
				} else {
					levels.push({level:level, right: sp + dp});	
				}
			} else {
				// search level actual right
				var level_found = false;
				for( var i = levels.length - 1; i > -1; i-- ){
					// if( levels[i] )
					if( sp < levels[i].right ){
						level = levels[i].level + 1;
						if( !levels[ level ]){ levels.push({level:level, right: right});}	
						level_found = true;
						break;	
					}
				}
				if( !level_found){
					level = 0;
				}
				// levels[ level ] = sp + dp;
			} 
			// console.log( level );
		} else{
			// first tour
			levels.push({level:0, right:right});	
		}
		// console.log(phases[k]);
		var phase_div_in_view = $("<div/>",{ 'data-level':level, 'data-title':EAT.phases.formatTitle( phases[k] ),'class': "phase_"+phases[k].id + " view-phase level_" + level + " " + phases[k].tags.join(" ").toLowerCase(),style:"left: " + sp+ "%; width:" + dp + "%; bottom:"+(26*level)+"px"});//.text( phases[k].tags.join(", ") );
		phases_div_in_view.push( {obj:phase_div_in_view, level:level} );
		phase_div_in_view.tooltipsy({
			alignTo: 'cursor',
			offset:[10,16],
			content:EAT.tooltip.magic_wand
		})
		
		$("#timeline-view").append( phase_div_in_view );
		
		$("#timeline-navigator").append( phase_div );//console.log( phase_div );
		previous = { 
			level:	level,
			left:	sp,
			right:	sp + dp
		};
		
	}
	var step = 26;
	if( levels.length > 30 ){
		step = 3;	
		for (var i in phases_div_in_view ){
			phases_div_in_view[i].obj.addClass("more-reduced").css("bottom",step*phases_div_in_view[i].level);
		}
	} else if( levels.length > 8 ){
		step = 14;	
		for (var i in phases_div_in_view ){
			phases_div_in_view[i].obj.addClass("reduced").css("bottom",step*phases_div_in_view[i].level);
		}
	}	
	
	console.log("my step", step,  step * levels.length);
	$("#timeline-view").height( step * levels.length ).width(EAT.t.navigator_max_width);
	$("#timeline-view-outer").height( step * levels.length );
	
	
	// is there actors? (page poject)
	// console.log( "a lot of", actors_phases, phases);
	try{
		if( actors_phases == undefined ) {
			console.log("uhm, there are no actors");
			return;
		}
		// console.log("we are here");
	} catch( e ){
		console.log("there are no actors on the page, definitely");
		return;	
	}
	
	// cycle through actors.
	// append them to #actors div, if any.
	$("#actors").empty();
	for( var k in actors_phases ){
		
		var actor_phases_list = [];
		var actor_phases_div = $("<div/>",{"class":"actor-phases"});
		var actor_pases_div_outer = $("<div/>",{"class":"actor-phases-outer"});
		
		actor_phases_div.append( actor_pases_div_outer );
		
		
		for( a in actors_phases[k].data){ 
			// draw silly lines
			var start_date = new Date( actors_phases[k].data[a].start_date );
			var end_date = new Date( actors_phases[k].data[a].end_date );
			
			var sp = EAT.t.transform_to_percentage( start_date );
			var dp = Math.max( 1.5, EAT.t.transform_to_percentage( end_date ) - sp );
			level = 0;
			
			// creating phase object
			var phase_div_in_view = $("<div/>",{
				'class': "phase_"+a+ " view-phase level_" + level ,
				'style':"left: " + sp+ "%; width:" + dp + "%; bottom:"+(26*level)+"px"
			});
			
			actor_pases_div_outer.append( phase_div_in_view );
			// push phases names
			actor_phases_list.push(a);
			
		};
		
		
		
		
		
		$("#actors").append(
			$("<div/>",{"class":"actor phase_" + actor_phases_list.join(" phase_") }).append(
				$("<div/>",{"class":"grid_3 alpha"}).append(
					$("<div/>",{"class":"actor-name"}).html( '<a href="/actor/' + k + '" >' + (actors_phases[k].firstname != null?actors_phases[k].firstname:'') + " " + actors_phases[k].name +"</a>" )
				),
				$("<div/>",{"class":"grid_9 omega"}).append(
					actor_phases_div
				),
				$("<div/>",{"class":"clear"})
		))
			
	}
}

EAT.t.drawActivities = function(){
	var activities ={}
	for ( var k in phases ){
		
		var id = phases[k].activity_id ;
		
		if( !activities[ id ] ){
			// create activity element
			activities[ id ] = {
				"name":	phases[k].description,
				"data":{},
				"id":id
			}
		}
		
		// add stuff
		activities[ id ].data[ phases[k].id ] = {
			start_date: phases[k].start_date,
			end_date:phases[k].end_date,
			tags:phases[k].tags
		};
		
	} 	
	
	for (var k in activities ){
		var actor_phases_list =[];
		var actor_phases_div = $("<div/>",{"class":"actor-phases"});
		var actor_pases_div_outer = $("<div/>",{"class":"actor-phases-outer"});
		
		actor_phases_div.append( actor_pases_div_outer );
		
		
		for( a in activities[k].data){ 
			// draw silly lines
			var start_date = new Date( activities[k].data[a].start_date );
			var end_date = new Date( activities[k].data[a].end_date );
			
			var sp = EAT.t.transform_to_percentage( start_date );
			var dp = Math.max( 1.5, EAT.t.transform_to_percentage( end_date ) - sp );
			level = 0;
			
			// creating phase object
			var phase_div_in_view = $("<div/>",{
				'class': "phase_"+a+ " view-phase level_" + level ,
				'style':"left: " + sp+ "%; width:" + dp + "%; bottom:"+(26*level)+"px"
			});
			
			actor_pases_div_outer.append( phase_div_in_view );
			// push phases names
			actor_phases_list.push( "phase_"+a );
			
		};
		
		$("#actors").append(
			$("<div/>",{"class":"actor " + actor_phases_list.join(" ") }).append(
				$("<div/>",{"class":"grid_3 alpha"}).append(
					$("<div/>",{"class":"actor-name"}).html( '<a href="/project/' + k + '" >' + activities[k].name +"</a>" )
				),
				$("<div/>",{"class":"grid_9 omega"}).append(
					actor_phases_div
				),
				$("<div/>",{"class":"clear"})
		));
	}
	console.log( activities);
}

EAT.t.zoom = function( level ){
	if( level < 1 || level > EAT.t.max_zoom_level) return;
	
	if( level == 1 ){
		$( "#timeline-handle" ).removeClass("active");	
	} else {
		$( "#timeline-handle" ).addClass("active");		
	}
	
	var desired_width = 1/level*EAT.t.navigator_max_width;
	$( "#timeline-handle" ).css("width", desired_width );
	// check stupid dummy thongs
	var left = Math.min( $( "#timeline-handle" ).position().left, EAT.t.navigator_max_width - desired_width);
	
	$( "#timeline-handle" ).css("left",left);
	EAT.t.navigator_width = desired_width;
	EAT.t.zoom_level =  level;
	EAT.t.zoooom( left );

}

EAT.t.format = function( date ){
	// return date.getDate() + " " + EAT.t.settings.months.en_US[ date.getMonth() ] + " " + date.getFullYear();
	return EAT.t.settings.months.en_US[ date.getMonth() ] + " " + date.getFullYear();
}

/* build timeline world */

/** from date to percentage according to EAT.settings strat_date and end_date. return 0 to 100 */
EAT.t.transform_to_percentage = function( date ){
	return ( date.getTime() - EAT.t.settings.start_time ) /  EAT.t.settings.delta_time * 100;
}

EAT.t.transform_to_date = function( value ){
	return new Date( EAT.t.settings.start_time + value * EAT.t.settings.delta_time / 100 );
}

EAT.t.min_date = function( object, iterator ){
	return Math.min( 
	)	
}


EAT.t.propagate = function( left, width ){}

// given param left and width of the handle
EAT.t.zoooom = function( left ){
	var view_width = EAT.t.navigator_max_width * EAT.t.zoom_level ;
	// console.log( left, EAT.t.zoom_level, view_width,  -left*EAT.t.zoom_level  ); 	
	$("#timeline-view").width( view_width );
	$("#timeline-view").css( "left", -left*EAT.t.zoom_level  );
	
	var view_start_date = EAT.t.transform_to_date( left*EAT.t.zoom_level/view_width*100 );
	var view_end_date =  EAT.t.transform_to_date( (left + EAT.t.navigator_width ) * EAT.t.zoom_level/view_width*100 );
			
	
	// labels
	$("#min-view-date").text( EAT.t.format( view_start_date ) ); 
	$("#max-view-date").text( EAT.t.format( view_end_date ) );
	
	
	$(".actor-phases-outer").width( view_width );
	$(".actor-phases-outer").css( "left", -left*EAT.t.zoom_level  );
	
}


EAT.chart = {};
EAT.chart.init = function(){
	$("#chart").on( "mouseenter", ".line", EAT.chart.mouseenter);	
	$("#chart").on( "mouseleave", ".line", EAT.chart.mouseleave );
}
EAT.chart.mouseenter = function( event){
	// get chlsss phase
	var sources_phases =  $(event.currentTarget).attr("class").split(" ");
	sources_phases.shift();// let's sassume that phase_12131 is the very first class name in class stuffs.
	$( "."+ sources_phases.join(", .") ).removeClass("highlighted").addClass("highlighted");
	// console.log( "EAT.phases.click: clicked on phase", phase); 
}
EAT.chart.mouseleave = function( event){
	// get chlsss phase
	var sources_phases =  $(event.currentTarget).attr("class").split(" ");
	sources_phases.shift();
	$( "."+ sources_phases.join(", .") ).removeClass("highlighted")
	// console.log( "EAT.phases.click: clicked on phase", phase); 
}
// special functions of transformation
// EAT.t.getwidth={};

		
EAT.sources.init = function(){
	$('#source-dialog').modal({show:false});
	$("#sources-list").on( "click", ".source-link", EAT.sources.load );
	$("#sources-list").on( "mouseenter", ".source-link", EAT.sources.mouseenter );
	$("#sources-list").on( "mouseleave", ".source-link", EAT.sources.mouseleave );
	
};

EAT.sources.mouseenter = function( event){
	// get chlsss phase
	var sources_phases =  event.currentTarget.className.split(" ");
	sources_phases.shift();// let's sassume that phase_12131 is the very first class name in class stuffs.
	$( "."+ sources_phases.join(", .") ).removeClass("highlighted").addClass("highlighted");
	// console.log( "EAT.phases.click: clicked on phase", phase); 
}
EAT.sources.mouseleave = function( event){
	// get chlsss phase
	var sources_phases =  event.currentTarget.className.split(" ");
	sources_phases.shift();
	$( "."+ sources_phases.join(", .") ).removeClass("highlighted")
	// console.log( "EAT.phases.click: clicked on phase", phase); 
}


EAT.sources.load = function( event ){
	$this = $(this);
	// given an id, check idf sources[id] exists
	var nr_annotation = $this.attr("data-source");
	source = sources[ nr_annotation ];
	console.log( "EAT.sources.load", nr_annotation );
	if( !source ) return;
	previous = $this.prev().attr("data-source");
		next = $this.next().attr("data-source");
		
		
		console.log( "EAT.sources.load. next:", next, ", previous:", previous  );
		$next = "";
		if( next ){
			$next = $("<a/>",{"id":"next-source"}).click(function(event){event.preventDefault();EAT.sources.load( $this.next() )}).text(" next ");
		}
		$previous = "";
		if( previous ){
			$previous = $("<a/>",{"id":"previous-source"}).click(function(event){event.preventDefault();EAT.sources.load( $this.prev() )}).text(" previous ");
		}
		
		
		source.title = source.title.replace( /_/g," ");
		$("#source-title").empty().text( source.title );
		$("#source-header").empty().text( source.title + " ");
		//$("#source-header").append( $previous );
		//$("#source-header").append( $next );
		
		$("#source-reference").empty().text( source.ref_bibliographic );
		$("#source-authors").empty();
		$("#source-text").empty();
		$("#source-mark").empty();
		
		if( source.authors )
			$("#source-authors").empty().text( source.authors );
		
		if( source.sourcemark)
			$("#source-mark").empty().text( ", " + source.sourcemark );
		if( source.text )
			$("#source-text").empty().html( "&laquo;" + source.text.replace( /[\n\r]/g,"<br/>") + "&raquo;" );
		$("#source-image").empty();
		
		if( source.image.url ) {
			var modal_width = Math.min( EAT.width - 100, source.image.width );
			var modal_height = Math.min( EAT.height - 100, source.image.height );
			console.log("image loaded",source.image.width, EAT.width, "min:",modal_width ); 
			
			$('#source-dialog').css({
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
			$('#source-dialog').css({"margin-left": - 280, width: 560, "margin-top": - 250, "height": 500 });
			$('#note-attached').css({height:400,width:510});
		}
		$('#source-dialog').modal("hide");	
		$('#source-dialog').modal("show");
		
}

EAT.sources.resize = function(){
	
}

/* EAT view behaviour */
EAT.view.resize = function(){
	$("#view").css("margin-top", EAT.header_height);
	if( EAT.view.stiritup ){
		$("#view-right").height( EAT.height - EAT.header_height - 24 );
		$("#view-left").height( EAT.height - EAT.header_height );
	}else {
		$("#view-right").height( ( EAT.height - EAT.header_height - 24 ) /1.5 );
		$("#view-left").height( ( EAT.height - EAT.header_height) /1.5 );
	}
}



EAT.video = {
	options:{
		speed: 420,
		height:320,
		target: "#iframe-video"
	},
	target:false,
	_is_visible:false,
	_available_height:100
}

EAT.video.init = function(){
	EAT.video.target = $( EAT.video.options.target );
	$(".item.video, .video-toggle").click( EAT.video.toggle );
	// start subs
	$('video').videoSub();
	EAT.video.resize();
}

EAT.video.resize = function(){
	
	EAT.video._available_height = EAT.height; // menu nav height
	EAT.video._view_margin_top = parseInt( $("#view").css("margin-top").replace("px","") );
	if( EAT.video.target == false) return;
	
	EAT.video.target.css({
		height:EAT.video._available_height,
		top: - EAT.video._available_height
	});
	
	$('#iframe-video video').height( EAT.video._available_height );
	
	console.log( "EAT.video.resize", EAT.video._available_height);
	
	
	
	//		"margin-top": -EAT.video._available_height
	//	});
	
	// resize stuffs
	if( EAT.video._is_visible ){
		
		// resize without animation
		$("#header-outer").css({"margin-top": EAT.video._available_height } );
		
		$("#view").css({"margin-top": EAT.video._original_view_margin_top } );
		$(document).scrollTop(0);
	}
}



EAT.video.toggle = function(){
	if(EAT.video._is_visible){
		EAT.video.hide();
		EAT.slideshow.fadeIn();
		//$(".video-toggle").text("video introduction");
		$(".video.item").removeClass("selected");
	} else {
		EAT.video.show();
		EAT.slideshow.fadeOut();
		$(".video.item").addClass("selected");
		//$(".video-toggle").text("back");
	}	
}

EAT.video.show = function(){
	EAT.video._is_visible = true;
	EAT.slideshow.pause();// force pause
	// move down the menu bar
	$("#header-outer").css({"margin-top": EAT.video._available_height });
	$("#view").css({"margin-top": EAT.video._view_margin_top + EAT.video._available_height });
	$('video').show();
	
	$(".item.map").hide();
	$(".item.slides").hide();
	$(".item.top").hide();
	// $(document).scrollTop( 0 );
}

EAT.video.hide = function(){
	// move down the menu bar
	EAT.video._is_visible = false;
	EAT.slideshow.start();
	$("#header-outer").css({"margin-top": "0px"});
	$("#view").css({"margin-top":  EAT.video._view_margin_top+"px" });
	$(document).scrollTop(0);
	$("#view-left, #view-right").scrollTop(0);
	$(document).scrollTop(0);
	$(".item.map").show();
	$(".item.slides").show();
	$(".item.top").show();
}


EAT.zoom = { pointer:{ min:12, max:128, d:140}, previous_level:1 };

EAT.zoom.init = function(){
	$( "#zoom-pointer" ).draggable({ 
		axis: "x",		
		containment: "parent", 
		stop: EAT.zoom.pointer.stop,
		drag: EAT.zoom.pointer.dragging 
	});
	
}

EAT.zoom.pointer.dragging = function( event, ui){
	// console.log( ui.position.left, EAT._.ratio( ui.position.left- EAT.zoom.pointer.min, 128, 20 ));
	var level = EAT._.ratio( ui.position.left- EAT.zoom.pointer.min, 128,19 ) + 1;
	if( level == EAT.zoom.previous_level ) return;
	EAT.t.zoom( level );
	EAT.zoom.previous_level = level;
}

EAT.zoom.pointer.stop = function(){
	// console.log("stopped");
}

//
EAT.map ={}
EAT.map.init = function(){
	
	// if() $(#map).hide();
	
	$(".item.map").off('click').click( function(){
		//$("#map").show();
		//$( document ).scrollTop(
		//	$("#map").offset().top	
		//);
		if( $(document).scrollTop() ==  $("#map").offset().top ){
			return EAT.scrolling.totop();	
		}
		$('body,html').animate({scrollTop: $("#map").offset().top}, 250);
		// $(".item.map").hide();
	});
};

EAT.map.resize = function(){
	
	$("#map").height( EAT.height - EAT.header_height );
	$("#locations").height(EAT.height - EAT.header_height -24 );
	$("#google-map").height(EAT.height - EAT.header_height -24 );
	console.log( "EAT.map.resize", EAT.height - EAT.header_height );
	
}


// tooltip
EAT.tooltip ={}

/** set every = to /= as title. -- as br. **/
EAT.tooltip.magic_wand = function( el, tooltip ){
	var text = el.attr("data-title");
	text = text.replace( /--/g, "<br/>");
	text = text.replace( "=/", "<div class='title'>");
	text = text.replace( "/=", "</div>");
	// console.log( el.attr("data-title"), text );
	return text;
}

EAT.scrolling ={ linked_on:false };

EAT.scrolling.init = function(){
	$(".item.totop").click( EAT.scrolling.totop );
	$("#linked-activities-caller").tooltipsy({
		alignTo: 'cursor',
		offset:[12,12],
		content:"view all related activities"
	}).on("click",function(){
		if( EAT.scrolling.linked_on == false ){
			$(".linked-activities").css("max-height", "100%");
			 EAT.scrolling.linked_on = true;
		} else {
			$(".linked-activities").css("max-height", "2.4em");
			EAT.scrolling.linked_on = false;
			EAT.resize();
		}
		
	});
}
EAT.scrolling.totop = function(){
	$('body,html').animate({scrollTop: 0}, 250);//scrollTop( 0 );
		$("#view-left,#view-right").animate({scrollTop: 0}, 250);
}

EAT.scrolling.scroll = function(){
	// console.log( "scrolled",  );
	if( $( document ).scrollTop() > 50 ){
		$(".item.totop").fadeIn( "fast" );	
	} else {
		$(".item.totop").fadeOut( "fast" );
	}		
}

EAT.cloud = { previous: false, current: "projects" };


EAT.cloud.init = function(){
	console.log("EAT.cloud.init");
	$("#cloud-tabs").on( "click", "li", EAT.cloud.tabbed );
	
	// why don't resize
	/* $('#cloud-tabs-content .tab-pane').each(function(index) {
   		console.log( '#cloud-tabs-content .tab-pane', index );
   		$(this).children(".tag").each( function( k ){
   			console.log( 'tag', index, $(this).attr("data-size" ) );
   		});
   		
	});*/
	$('#cloud-tabs-content .tab-pane').each(function(index) {
		// console.log($(this).children(".tag"));
		var sorted = $(this).children().sorted({
			reversed:true,
			by: function(v) {
				return parseInt(v.attr('data-size'));
			}
		});
		$(this).empty().append( sorted );
		
		
		
	});

	$("#sorting-alpha").click( EAT.cloud.toggle_sort_names );
	$("#sorting-sizes").click( EAT.cloud.toggle_sort_sizes );
}

EAT.cloud.toggle_sort_names = function(){
	
	if( EAT.cloud.sorted_by_names ){
		$(this).text("A-Z");
		EAT.cloud.sortByName("#"+EAT.cloud.current, true);
		EAT.cloud.sorted_by_names = false;
	} else {
		$(this).text("Z-A");
		EAT.cloud.sorted_by_names = true;
		EAT.cloud.sortByName("#"+EAT.cloud.current, false);
	}
}
EAT.cloud.toggle_sort_sizes = function(){
	if( EAT.cloud.sorted_by_size ){
		$(this).text("0-9");
		EAT.cloud.sortBySize("#"+EAT.cloud.current, true);
		EAT.cloud.sorted_by_size = false;
	} else {
		$(this).text("9-0");
		EAT.sortBySize = true;
		EAT.cloud.sortBySize("#"+EAT.cloud.current, false);
		EAT.cloud.sorted_by_size = true;
	}
}

EAT.cloud.sortByName = function( selector, reversed ){
	var sorted = $( selector ).children().sorted({
		reversed:reversed
	});
	$( selector ).empty().append( sorted );
}

EAT.cloud.sortBySize = function( selector, reversed ){
	var sorted = $( selector ).children().sorted({
			reversed:reversed,
			by: function(v) {
				return parseInt(v.attr('data-size'));
			}
	});
	$( selector ).empty().append( sorted );
}

EAT.cloud.tabbed = function( event ) {
	event.preventDefault();
	console.log( event, event.currentTarget.className.split(" ") );
	EAT.cloud.current = event.currentTarget.className.split(" ")[0];
	$("#cloud-tabs li.active").removeClass( "active" );
	$(this).addClass( "active" );
	$("#cloud-tabs-content .tab-pane" ).hide();
	
	$("#cloud-tabs-content #"+ EAT.cloud.current ).show();
	return false;
}

