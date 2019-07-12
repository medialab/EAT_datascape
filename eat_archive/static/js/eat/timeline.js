/**
 * EAT Extension
 */
				EAT.functions.ratio = function( v1,r1, r2 ){
					return v1 * r2 / r1;
				}
				EAT.functions.symmetric_parabola = function( x, a, b, c ){
					var y = (!a?0:a)*x*x + (!b?0:b)*x + (!c?0:c);
					return x > 0? y: -y;
				}
				
				EAT.navigator = { 
					info:{
						$zoom: $("#zoom-info")	
					},
					target:{ $item: $("#mz-master .dragger"), 
						min_width:$("#mz-master .dragger").width(), 
						max_width: 2000,
						zoom: 1, //auto read only
						width:-1,			// updated autonatically, by update function
						min_left: 0,		// original left
						max_left: 0,		// according to width,
						left:-1				// auto
					}, 
					pointer:{ 
						position:{ 
							center:{x:62,y:28}						
						}
						
					},
					zoom:{
						position:{ 
							center:{x:0,y:28},
							x:0,
							y:0						
						}						
					},
					speed:{x:0, y:0}, coeff:{x:10, y:.01}, pos:{},
					acc:{x:0, y:0},
					updater:{}
				};
				// smooth BACK-To-THE-CENTER function
				EAT.navigator.pointer.position.reset = function( event, ui ){
					EAT.navigator.speed.x = 0;
					$( "#time-pointer" ).animate({
						top:  EAT.navigator.pointer.position.center.y,
						left: EAT.navigator.pointer.position.center.x
					},200);
					EAT.navigator.stop() ;
				};
				EAT.navigator.zoom.position.reset = function( event, ui ){
					EAT.navigator.speed.y = 0;
					$( "#time-zoom" ).animate({
						top:	EAT.navigator.zoom.position.center.y,
						left:	EAT.navigator.zoom.position.center.x
					},200);
					EAT.navigator.stop() ;
				};				
				
				


				/** handle position, speed and ceff vector. auto call start to start timeinterval */
				EAT.navigator.navigate = function( event, ui ){

										// dispatch to the right place,
					// computate speed vector, x and y, range -1, +1
					if( event.target.id == "time-pointer" ){
						EAT.navigator.speed.y = EAT.functions.ratio( 
								ui.position.top - EAT.navigator.zoom.position.center.y,
								EAT.navigator.zoom.position.center.y, -10 
						);
					};
					
					if( EAT.navigator.started ) return;	// autoupdate with update
					EAT.navigator.start() ;
					
				};
				
				
				
				EAT.navigator.move = function(event, ui){
					
					
					if( event.target.id == "zoom-right" ){
						EAT.navigator.speed.x = -2;
					} else {
						EAT.navigator.speed.x = 2;	
					}
					
					EAT.navigator.speed.y = 0;
					if( EAT.navigator.started ) return;	// autoupdate with update
					EAT.navigator.start() ;	
				}
				
				EAT.navigator.update = function(){
					
					
					
					EAT.navigator.stop();
					
					var $w = EAT.navigator.target.$item.width();
					var $nw = $w + EAT.functions.symmetric_parabola( EAT.navigator.speed.y , 2, 2) ;
					
					// width computation
					if( $nw > EAT.navigator.target.max_width ){
						$nw = EAT.navigator.target.max_width;// flat to max_width;
					} else if( $nw < EAT.navigator.target.min_width ){
						$nw = EAT.navigator.target.min_width;// flat to min_width
					}
					
					// update zoom
					
					EAT.navigator.target.$item.width( $nw );
					// bound computations
					
					// left computation
					var $l = EAT.navigator.target.$item.css("left").split("px")[0];
					$nl = $l == "auto"? 0: parseFloat( $l ); // non numeric value handler
					// var $l = EAT.navigator.target.$item.position().left;
					if( EAT.navigator.speed.x > 0 ){
						EAT.navigator.speed.x += .25;
					}
					if( EAT.navigator.speed.x < 0 ){
						EAT.navigator.speed.x -= .25;
					}
					$nl = EAT.navigator.target.$item.position().left + EAT.functions.symmetric_parabola( EAT.navigator.speed.x, 2, 2 );
					
					console.log( "proposed left", $nl , "actual left", EAT.navigator.target.$item.css("left"));
					
					if( $nl > 0 ) $nl = 0;
					if( $nl < EAT.navigator.target.min_width - $nw ) $nl = EAT.navigator.target.min_width - $nw;
					// console.log( $nl, $l, EAT.navigator.speed.x * EAT.navigator.coeff.x );
					EAT.navigator.target.width = $nw;
					EAT.navigator.target.left  = $nl; 
					EAT.navigator.target.zoom = 1 + EAT.functions.ratio( $nw- EAT.navigator.target.min_width, EAT.navigator.target.max_width - EAT.navigator.target.min_width, EAT.navigator.target.max_width/EAT.navigator.target.min_width - 1 );
					if( isNaN( EAT.navigator.target.zoom ) )
						EAT.navigator.target.zoom = 1;
					EAT.navigator.info.$zoom.text( ( Math.round( EAT.navigator.target.zoom * 10 ) / 10 ) + "x");
					EAT.navigator.target.$item.css({"left": Math.round( $nl )+"px"});
					console.log( "left", $nl, Math.round( $nl )+"px" );
					
					EAT.navigator.propagate( {width:$nw,left:$nl} );
					
					EAT.navigator.start();
					
					// ABSOLUTE TO WINDOW…. crasp!!!
					// $( ".mz-content.dragger" ).draggable( "option", "containment", [ EAT.navigator.target.min_width - $nw, 0, $nw, 0 ] );	
					
				}
				EAT.navigator.stop = function(){
					clearInterval( EAT.navigator.timer );
					EAT.navigator.started = false;
				}
				
				EAT.navigator.propagate = function( options ){ 
					$(".mz-content").css( options );
					
				}
				
				EAT.navigator.start = function(){
					if( EAT.navigator.started ) return;
					EAT.navigator.started = true; 
					EAT.navigator.timer = setInterval( EAT.navigator.update, 25 )
				}
/**
 * time related function
 */
EAT.time = {
	milliseconds_per_year: 31556926000 // about
};

/**
 * return the desired px width.
 * @param dt			- dt in milliseconds
 * @param dt_range		- REF. dt in millisenconds
 * @param width_range	- REF w. The dt should be converted to
 */
EAT.navigator.stir_it_up = function( dt, dt_range, width_range ){
	var ugly_width = EAT.functions.ratio( dt, dt_range, width_range ); // should be different from 0 !
	var beauty_ratio = EAT.navigator.target.min_width / ugly_width;
	console.log( "EAT.navigator.stir_it_up beauty_ratio", beauty_ratio)
	
	return width_range * beauty_ratio;
}


