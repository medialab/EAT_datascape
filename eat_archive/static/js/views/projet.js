
/**
 * Main script for view/project
 */
$(window).load( function(){
	console.log("view script loaded. Init session...");
	var pc = new EnlightController();
	var vc = new VisualizeController( pc );
	 
	
	$("#legend .element").mouseenter(function(){
		$(this).addClass( "element_hover");	
	});
	
	$("#legend .element").mouseleave(function(){
		$(this).removeClass( "element_hover");	
	});
	
});

var VisualizeController = function( enlightControllerInstance ){
	var $this = this;
	this.enlightControllerInstance = enlightControllerInstance;
	
	this.sourceClickHandler = function( event ){
		
		var phaseId = event.currentTarget.id.split("_")[1];
		var sourceId = event.currentTarget.id.split("_")[2];
		
		// phaseId, sourceId , annotations);
		var currentObject = false;
		currentObject = EAT.annotations[phaseId]['annotations'][sourceId]; 
		// console.log( event.currentTarget.id, phaseId, sourceId , currentObject);
		
		if( !currentObject ){
			alert("could not show you this content. please reload the page");
			return;
		}
		$("#source_dialog").attr("title",  EAT.annotations[phaseId].actionTags.join(", ") );
		$(".ui-dialog .ui-dialog-title").text( EAT.annotations[phaseId].actionTags.join(", ") );
		
		$("#annotation_title").text( currentObject.annotation_title );
		
		
		$("#source_title").text( currentObject.source_title );
		$("#source_mark").text( currentObject.sourcemark );
		$("#source_reference").text( currentObject.ref_bibliographic );
		
		// append authors
		$("#annotation_authors").empty();
		var c = 0;
		for( var i in currentObject.authors){
			if( c > 0 ){
				$("#annotation_authors").append( " &bull; ");
			}
			$("#annotation_authors").append(
				$("<span/>",{'class':'annotation_author'}).text(currentObject.authors[i])
			);
			c++;
		}
		
		$("#source_text .source_image").empty();
		
		$("#source_text .long_text").text( currentObject.text );
		
		if( currentObject.image_url ){
			$("#source_text .source_image").append(
				$("<img />", {'src':currentObject.image_url})
			);
			 if( currentObject.text == "" ){
				$("#source_text .source_image").css("width","100%");
			}
		} 
		
		$("#source_dialog").dialog("open");
	};
	
	var sourceMouseOverHandler = function( event ){
	
	};
	
	this.resizeHandler = function ( event, ui ){
		// console.log( $("#source_text")[0].offsetHeight, event.target.clientHeight );
		// $("#source_text").css({"height": Math.max( 100, event.target.clientHeight- $("#source_text")[0].offsetHeight) } );
	}
	
	this.init = function(){
		
		// listen events
		$("#source_dialog").dialog({ 
			autoOpen: false,
			height: 400,
			width: 550,
			resizeStop:  $this.resizeHandler
		});
		$(".source").css("cursor","pointer").click( $this.sourceClickHandler ).hover( 
			function () {$(this).addClass("source_hover");},
			function () {$(this).removeClass("source_hover");}
		);
		//$("#source_content").tinyscrollbar();
	
		// console.log("VisualizeController initialized");
	};
	
	this.init();
}

var EnlightController = function(){
	var $this = this;
	
	this.lockSelectedPhases = false;
	
	/**
	 * return the id from object class string
	 */
	this.getPhasesId = function( _HTMLDivElement ){
		var classList = _HTMLDivElement.className.split(/\s+/);
		var ids = [-1];
		$.each( classList, function(index, item){
			
			var matches = item.match(/phase_(\d+)/);
			if( matches ){
			// console.log( "getPhasesId", item, index  );
			ids.push( matches[1] );
			}
		});
		return ids;
	}
	
	/**
	 * activate all the related phases in every group of a given id
	 * @param id 	- array of int phase identifier
	 */
	this.activeRelatedPhases = function( ids ){
		if( $this.lockSelectedPhases ) return;
		// console.log( "activeRelatedPhases",id);
		for( var i in ids ){
			$(".phase_"+ids[i]).addClass("phase_hover");
			// name add class
		}
	}
	
	/**
	 * disactivate all the related phases in every group
	 */
	this.disactiveRelatedPhases = function(){
		if( $this.lockSelectedPhases ) return;
		$(".phase_hover").removeClass("phase_hover");
	}
	
	/**
	 * click on phase listener
	 */
	this.phaseClickHandler = function( event ){
		$this.lockSelectedPhases = true;
		// enlight
		$("#locker .phase_locked").html( $(event.currentTarget).attr("title"));
		$("#locker").show();
		$("#bigtimeline .phase_hover").removeClass("phase_hover");
		var ids = $this.getPhasesId(  event.currentTarget );
		for( var i in ids ){
			$(".phase_"+ids[i]).addClass("phase_hover");
			// name add class
		}
		
		
	};
	
	/**
	 * 
	 */
	this.unlockClickHandler = function(){
		
		$this.lockSelectedPhases = false;
		$this.disactiveRelatedPhases();
		$("#locker").hide();
	}
	
	/**
	 * mouseover phase listener
	 */
	this.phaseMouseOverHandler = function( event ){
		if( $this.lockSelectedPhases == true ){
			clearTimeout( $this.timer );
			return;
		};
		console.log( "phaseMouseOverHandler",event,event.target.className);
		clearTimeout( $this.timer );
		$this.disactiveRelatedPhases();
		$this.activeRelatedPhases( $this.getPhasesId(  event.currentTarget ) );
	}
	
	this.actorMouseOverHandler = function( event ){
		console.log( "phaseMouseOverHandler",event,event.target.className);
		clearTimeout( $this.timer );
		$(event.currentTarget ).addClass("actor_hover");
		$this.disactiveRelatedPhases();
		$this.activeRelatedPhases( $this.getPhasesId(  event.currentTarget.parentNode ) );
	}
	
	
	
	/**
	 * mouseout phase listener
	 */
	this.phaseMouseOutHandler = function( event ){
		// start counter, then wait
		$this.timer = setTimeout( $this.disactiveRelatedPhases, 000 );
		$( event.currentTarget ).removeClass("actor_hover");
	}
	
	
	this.init = function(){
		console.log("PhaseController initialized");
		// listen events
		$(".phase").click( $this.phaseClickHandler ).mouseenter( $this.phaseMouseOverHandler).mouseleave( $this.phaseMouseOutHandler  );
		$(".source").mouseenter( $this.phaseMouseOverHandler).mouseleave( $this.phaseMouseOutHandler  );
		$(".name").mouseenter( $this.actorMouseOverHandler).mouseleave( $this.phaseMouseOutHandler  );
		// $(".element .legend_color").mouseenter( $this.legendMouseOverHandler ).mouseleave( $this.phaseMouseOutHandler  );
		$("#locker button").click( $this.unlockClickHandler );
		
	};
	
	this.timer = 0;
	
	this.init();
};

/**
 * TinyScrollbar Plugin
 */
(function($){$.tiny=$.tiny||{};$.tiny.scrollbar={options:{axis:'y',wheel:40,scroll:true,size:'auto',sizethumb:'auto'}};$.fn.tinyscrollbar=function(options){var options=$.extend({},$.tiny.scrollbar.options,options);this.each(function(){$(this).data('tsb',new Scrollbar($(this),options));});return this;};$.fn.tinyscrollbar_update=function(sScroll){return $(this).data('tsb').update(sScroll);};function Scrollbar(root,options){var oSelf=this;var oWrapper=root;var oViewport={obj:$('.viewport',root)};var oContent={obj:$('.overview',root)};var oScrollbar={obj:$('.scrollbar',root)};var oTrack={obj:$('.track',oScrollbar.obj)};var oThumb={obj:$('.thumb',oScrollbar.obj)};var sAxis=options.axis=='x',sDirection=sAxis?'left':'top',sSize=sAxis?'Width':'Height';var iScroll,iPosition={start:0,now:0},iMouse={};function initialize(){oSelf.update();setEvents();return oSelf;}
this.update=function(sScroll){oViewport[options.axis]=oViewport.obj[0]['offset'+sSize];oContent[options.axis]=oContent.obj[0]['scroll'+sSize];oContent.ratio=oViewport[options.axis]/oContent[options.axis];oScrollbar.obj.toggleClass('disable',oContent.ratio>=1);oTrack[options.axis]=options.size=='auto'?oViewport[options.axis]:options.size;oThumb[options.axis]=Math.min(oTrack[options.axis],Math.max(0,(options.sizethumb=='auto'?(oTrack[options.axis]*oContent.ratio):options.sizethumb)));oScrollbar.ratio=options.sizethumb=='auto'?(oContent[options.axis]/oTrack[options.axis]):(oContent[options.axis]-oViewport[options.axis])/(oTrack[options.axis]-oThumb[options.axis]);iScroll=(sScroll=='relative'&&oContent.ratio<=1)?Math.min((oContent[options.axis]-oViewport[options.axis]),Math.max(0,iScroll)):0;iScroll=(sScroll=='bottom'&&oContent.ratio<=1)?(oContent[options.axis]-oViewport[options.axis]):isNaN(parseInt(sScroll))?iScroll:parseInt(sScroll);setSize();};function setSize(){oThumb.obj.css(sDirection,iScroll/oScrollbar.ratio);oContent.obj.css(sDirection,-iScroll);iMouse['start']=oThumb.obj.offset()[sDirection];var sCssSize=sSize.toLowerCase();oScrollbar.obj.css(sCssSize,oTrack[options.axis]);oTrack.obj.css(sCssSize,oTrack[options.axis]);oThumb.obj.css(sCssSize,oThumb[options.axis]);};function setEvents(){oThumb.obj.bind('mousedown',start);oThumb.obj[0].ontouchstart=function(oEvent){oEvent.preventDefault();oThumb.obj.unbind('mousedown');start(oEvent.touches[0]);return false;};oTrack.obj.bind('mouseup',drag);if(options.scroll&&this.addEventListener){oWrapper[0].addEventListener('DOMMouseScroll',wheel,false);oWrapper[0].addEventListener('mousewheel',wheel,false);}
else if(options.scroll){oWrapper[0].onmousewheel=wheel;}};function start(oEvent){iMouse.start=sAxis?oEvent.pageX:oEvent.pageY;var oThumbDir=parseInt(oThumb.obj.css(sDirection));iPosition.start=oThumbDir=='auto'?0:oThumbDir;$(document).bind('mousemove',drag);document.ontouchmove=function(oEvent){$(document).unbind('mousemove');drag(oEvent.touches[0]);};$(document).bind('mouseup',end);oThumb.obj.bind('mouseup',end);oThumb.obj[0].ontouchend=document.ontouchend=function(oEvent){$(document).unbind('mouseup');oThumb.obj.unbind('mouseup');end(oEvent.touches[0]);};return false;};function wheel(oEvent){if(!(oContent.ratio>=1)){oEvent=$.event.fix(oEvent||window.event);var iDelta=oEvent.wheelDelta?oEvent.wheelDelta/120:-oEvent.detail/3;iScroll-=iDelta*options.wheel;iScroll=Math.min((oContent[options.axis]-oViewport[options.axis]),Math.max(0,iScroll));oThumb.obj.css(sDirection,iScroll/oScrollbar.ratio);oContent.obj.css(sDirection,-iScroll);oEvent.preventDefault();};};function end(oEvent){$(document).unbind('mousemove',drag);$(document).unbind('mouseup',end);oThumb.obj.unbind('mouseup',end);document.ontouchmove=oThumb.obj[0].ontouchend=document.ontouchend=null;return false;};function drag(oEvent){if(!(oContent.ratio>=1)){iPosition.now=Math.min((oTrack[options.axis]-oThumb[options.axis]),Math.max(0,(iPosition.start+((sAxis?oEvent.pageX:oEvent.pageY)-iMouse.start))));iScroll=iPosition.now*oScrollbar.ratio;oContent.obj.css(sDirection,-iScroll);oThumb.obj.css(sDirection,iPosition.now);;}
return false;};return initialize();};})(jQuery);


