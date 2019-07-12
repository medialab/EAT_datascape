EAT.video = {
	options:{
		speed: 420,
		height:320,
		target: "#iframe-video"
	},
	target:[],
	_is_visible:false,
	_available_height:100
}
EAT.video.resize = function(){
	EAT.video.target.css({
		height:EAT.video._available_height,
		top: -EAT.video._available_height
	});
	
	EAT.video.target.children().css({
		height:EAT.video._available_height, 
		width:EAT.video.target.width()
	});
	//console.log("EAT.video.resize", EAT.video._available_height );
	if( EAT.video._is_visible ){
		// resize without animation
		$(".topbar").css({"top": EAT.video._available_height } );
		$(".view").css({"margin-top": 138 + EAT.video._available_heightt } );
		$(document).scrollTop(0);; 
	}
}
EAT.video.init = function(){
	EAT.video.target = $( EAT.video.options.target );
	EAT.video._available_height =  $(window).height() -38// menu nav height
	EAT.video._view_margin_top = parseInt( $(".view").css("margin-top").replace("px","") );
	$("#iframe-video-toggle").click( EAT.video.toggle );
	EAT.video.resize();
}

EAT.video.show = function(){
	EAT.video._is_visible = true;
	// move down the menu bar
	$(".topbar").animate({"top": EAT.video._available_height },EAT.video.options.speed );
	$(".view").animate({
		"margin-top": EAT.video._view_margin_top + EAT.video._available_height },EAT.video.options.speed );
	$(document).scrollTop(0);
}

EAT.video.hide = function(){
	// move down the menu bar
	EAT.video._is_visible = false;
	$(".topbar").animate({"top": "0px"},EAT.video.options.speed );
	$(".view").animate({"margin-top": EAT.video._view_margin_top + "px" },EAT.video.options.speed );
	$(document).scrollTop(0);
}

EAT.video.toggle = function(){
	if(EAT.video._is_visible){
		EAT.video.hide();
		$("#iframe-video-toggle").text("video introduction");
	} else {
		EAT.video.show();
		$("#iframe-video-toggle").text("back");
	}	
}


// add this to your page load handler
$( window ).load( function(){
	EAT.video.init();
});

$( window ).resize( function(){
	EAT.video._available_height =  $(window).height() -38;
	EAT.video.resize();
});


