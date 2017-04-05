var intervalID,intervalID_eventos,intervalID_paradas,gdir='';
var htmls,puntos_totales=[];
var r,pu,ls,options = {};
var lineCounter_,shapeCounter_,colorIndex_ = 0;
var ref_count=0;
var grupos = { "flota": [], "puntos": [],"lineas":[],"ruta":[],"labels":[],"eventos":[],"geocercas":[],"ruta_roadshow":[], "paradas":[],};
var COLORS = [["springgreen", "#00FF7F"], ["gold", "#FFD700"],["tomato", "#FF6347"] ,["violet", "#EE82EE"],["indigo", "#4B0082"],["greenyellow", "#ADFF2F"],["magenta", "#FF00FF"],["Coral", "#FF7F50"],["red", "#ff0000"],["orange", "#ff8800"], ["green","#008000"], ["blue", "#000080"], ["purple", "#800080"],["yellow", "#ffff00"],["gray", "#808080"],["olive", "#808000"],["maroon", "#800000"],["fuchsia", "#ff00ff"],["lime", "#00ff00"],["navy", "#000080"],["aqua", "#00ffff"],["teal", "#008080"],["silver", "#c0c0c0"],["black", "#000000"],["white", "#ffffff"]];
var click_geo;var click_geo2;
var click_line;
var line,geo;
jQuery.fn.googleMaps = function(options) {
    var opts = $.extend({},{
		center: new google.maps.LatLng(options.latitude, options.longitude),
		zoom: options.depth,
		mapTypeId: google.maps.MapTypeId.HYBRID,
		mapTypeControl: true,
      	zoomControl: true,
	  	streetViewControl: false
  }, options);
    return this.each(function() {

        $.googleMaps.gMap = new google.maps.Map(this, opts);
        $.googleMaps.mapsConfiguration(opts);
    });
};
$.googleMaps = {
	directions: {},
	latitude: '',
	longitude: '',
	latlong: {},
	maps: {},
	marker: {},
	rutas:[],
	gMap: {},
	moviles:"",
	
	mapsConfiguration: function(opts) {
			var center 	=  new google.maps.LatLng(opts.latitude, opts.longitude);

		
		if ( opts.pan ) {
			opts.pan = $.googleMaps.mapPanOptions(opts.pan);
			// Pan the Map
			window.setTimeout(function() {
				$.googleMaps.gMap.panTo($.googleMaps.mapLatLong(opts.pan.panLatitude, opts.pan.panLongitude));
			}, opts.pan.timeout);
		}
		if ( opts.markers ){
		if(intervalID!=''){
				clearInterval(intervalID);
			}
			
			$.googleMaps.mapMarkers(opts.markers,opts.variables, opts.polyline,grupos,0);
		}
		if ( opts.polyline )
			//if(opts.variables.vehiculo>=1000){
			$.googleMaps.mapPolyLine(opts.polyline,opts.variables);
			//}
		if ( opts.markeventos ){
		if(intervalID_eventos!=''){
				clearInterval(intervalID_eventos);
			}
			$.googleMaps.mapEventos(center, opts.markeventos,opts.variables, '',grupos,0);
		}
		if ( opts.paradas ){
			if(intervalID_paradas!=''){
				clearInterval(intervalID_paradas);
			}
			$.googleMaps.mapParadas(opts.paradas,opts.variables, '',grupos,0);
		}
		
			
	},
	mapLatLong: function(latitude, longitude) {
		return new google.maps.LatLng(latitude, longitude);
	},
	mapMarkers: function( markers, variables, polylineas, grupos,recargar) {
        
	   if (typeof(markers.length) == 'undefined')
            markers = [markers];
        var j = 0;
        for (i = 0; i < markers.length; i++) {

            if (markers[i].latitude && markers[i].longitude) {
             	
				var markerOpts = {
				   position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude),
				   draggable: false,
				  
				   map: $.googleMaps.gMap,
				   icon:new google.maps.MarkerImage(markers[i].icon.image, 
				   									null,
													new google.maps.Point(0, 0),
													new google.maps.Point(10, 10)),
				   labelContent: (markers[i].info.chapa) ? markers[i].info.chapa : "",
				   labelAnchor: new google.maps.Point(15, 25), 
				  	labelClass:'LabeledMarker_flota id'+markers[i].info.id,
				   labelStyle: {opacity: 0.75}
			};
			console.log(markers[i].info);
			
		
	 	var point = "";
      	var html = markers[i].info.layer || "";
			 if ( markers[i].latitude && markers[i].longitude ) {
				if(recargar!='no recargar'){
					$.googleMaps.marker[i] =crear_puntos(point,html,markerOpts);
				 	grupos['flota'].push($.googleMaps.marker[i]);
				 }
			 }
		}
		}
		intervalID = setInterval(function(){
			$.googleMaps.onlinemarkers(markers, variables, polylineas, intervalID,grupos);
			 },variables.tiempoRecarga);
	},
	onlinemarkers: function(markers,variables,polylineas, intervalID,grupos) {
		clearInterval(intervalID);//borrar el primer each
		if(variables.SqlOnlineAjax){//si existe la variable onlineAjax y es true
		 	$.ajax({
			url: "php/procesos-ajax.php",
			data: variables.SqlOnlineAjax+"=&id_movil="+variables.vehiculo,
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data.error!=0){
				if(	data.latitud!=markers[0].latitude && data.longitud!=markers[0].longitude){
					if(data.orientacion!='stop'){
						var ultimaOrientacion=data.orientacion;
					}
					var markerNew = {
						latitude:	data.latitud,
						longitude:	data.longitud,
						orientacion: data.orientacion,
						info:{
							layer:data.layer,
							chapa: data.chapa
						},
						icon:{ 
							image: 'gdimages/orientacion.php?posicion=true&imagen='+((data.velocidad!=0)?'movil_green_chapa.png':'movil_red_chapa.png')+'&orientacion='+data.orientacion.toUpperCase()+'&posicion=0&ultimaOrientacion='+ultimaOrientacion.toUpperCase()+"&id="+variables.vehiculo,
							iconSize:'18, 27',
						}
					}
					//$.googleMaps.cerrarTodosLosMarkers();
					//if(variables.vehiculo>=1000){
						eliminar_overlay(grupos['lineas']);
					//}else{
						//polylineas = "";
					//}	
					eliminar_overlay(grupos['flota']);
					markers[0].icon.image='gdimages/orientacion.php?posicion=true&imagen=flecha.png&orientacion='+data.orientacion.toUpperCase();
					markers.unshift(markerNew);
					console.log(markers.length);
					$.googleMaps.mapMarkers(markers, variables, polylineas,grupos);
					ref_count++;
					grupos["flota"][ref_count].labelContent='';
					grupos["flota"][0].labelContent=(markers[0].info.chapa) ? markers[0].info.chapa : "";
					//if(polylineas!="" && variables.vehiculo>=1000){
					var polylineaNew = {
							color: 			'#CB6700',
							pixels: 		3,
							endLatitude:	data.latitud,	
							endLongitude:	data.longitud,	
							startLatitude: 	data.latitud,
							startLongitude:	data.longitud,
						}
					polylineas.unshift(polylineaNew);
					$.googleMaps.mapPolyLine(polylineas,variables);
					//}
					contarmarklabels();
					$.googleMaps.gMap.panTo($.googleMaps.mapLatLong(data.latitud, data.longitud));
				if(values){	
					$('#lugar').html(data.direccion);
					$('#fecha_d').html(data.fecha);
					$('#odometro').html(data.odometro);
					$(values).animate({
						v1: data.velocidad
					},{duration: 3000,step: function () {
						var scales = $('#jqRadialGauge').jqLinearGauge('option', 'scales');
						var val = Math.floor(this.v1);
						scales[0].needles[0].value = val;
						$('#jqRadialGauge').jqLinearGauge('option', 'annotations')[0].text=val+' KpH';
						$('#jqRadialGauge').jqLinearGauge('update');
					}
				});
					$(values).animate({
					v2: data.senal
					},{duration: 3000,
					step: function () {
						var val = Math.floor(this.v2);
					   $('#jqLinearGauge').jqLinearGauge('option', 'scales')[0].needles[0].value=val;
					   $('#jqLinearGauge').jqLinearGauge('update');
					   $("#senal").html(val + " %");
					}
					});
				}
					
					
			}else{
				//if(variables.vehiculo>=1000){
					eliminar_overlay(grupos['lineas']);
				//}else{
					//polylineas="";	
				//}
				//eliminar_overlay(grupos['flota']);
				//if(polylineas!="" && variables.vehiculo>=1000){
					$.googleMaps.mapPolyLine(polylineas,variables);
				//}
				
				$.googleMaps.mapMarkers(markers, variables, polylineas,grupos,'no recargar');
				contarmarklabels();
			}
		}
	}
	});	}
		if(variables.flota){
			$.ajax({
			url: "php/procesos-ajax.php",
			data: "flotaOnline=&id_movil="+variables.moviles,
			type: "POST",
			dataType: "json",
			success: function(data){
				if(data.error!=0){
				if(data.vehiculos.length>0){
					
					markerNew =[];
					var arr = data.vehiculos;
					for(i in arr){
						markerNew.push({
							latitude:	arr[i][1],
							longitude:	arr[i][2],
							info:{
								layer:arr[i][4],
								chapa: arr[i][5]
							},
							icon:{ 
								image: arr[i][3],
								iconSize:'18, 27'
							}
						}
						);		
					}
					eliminar_overlay(grupos['flota']);
					$.googleMaps.mapMarkers(markerNew, variables, polylineas,grupos);
			}else{
				
				$.googleMaps.mapMarkers(markers, variables, polylineas,grupos,'no recargar');
				contarmarklabels();
			}
		}else{
			$.googleMaps.mapMarkers(markers, variables, polylineas,grupos,'no recargar');	
		}
				}
			});
		}
},
	mapPolyLine: function(options,variables) {
	options = [options];
	 var coord = new Array();
	 for ( i = 0; i<options[0].length; i++) {
				coord[i]=new google.maps.LatLng(options[0][i].startLatitude, options[0][i].startLongitude);
				coord[i]=new google.maps.LatLng(options[0][i].endLatitude, options[0][i].endLongitude);
		}
    var pol = new google.maps.Polyline({
     	 path:coord,
	 	strokeColor:options[0][0].color,
	 	strokeWeight:options[0][0].pixels,
		strokeWeight: 4,
		strokeOpacity: 0.8
	});
    	pol.setMap($.googleMaps.gMap);
  		grupos['lineas'].push(pol);
	},
	ajax:function(array,variables){
		$.ajax({
			url: "php/procesos-ajax.php",
			data: "traer_ultima_posicion=&latitud="+array[0].endLatitude+"&longitud="+array[0].endLongitude+"&id_movil="+variables.vehiculo,
			type: "POST",
			dataType: "json",
			success: function(data){
				var a = {
					color: 			'#CB6700',
					pixels: 		3,
					endLatitude:	data.latitud,	
					endLongitude:	data.longitud,	
					startLatitude: 	data.latitud,
					startLongitude:	data.longitud,
				}
				array.unshift(a);
				$.googleMaps.mapPolyLine(array,variables);
			}
		});
	},mapParadas: function(markers, variables, polylineas, grupos) {
		if (typeof(markers.length) == 'undefined')
            markers = [markers];
        var j = 0;
        for (i = 0; i < markers.length; i++) {
            if (markers[i].latitude && markers[i].longitude) {            
				var markerOpts = {
				   position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude),
				   draggable: false,
				   animation: google.maps.Animation.DROP,
				   map: $.googleMaps.gMap,
				   icon:markers[i].icon.image,
				   labelContent: (markers[i].info.descripcion)? markers[i].info.descripcion:"",
				   labelAnchor: new google.maps.Point(20, 40), 
				   labelClass: 'LabeledMarker_paradas',
				   labelStyle: {opacity: 0.75}
				};
		
	 			var point = "";
      			var html = markers[i].info.layer || "";
			 	if ( markers[i].latitude && markers[i].longitude ) {
					$.googleMaps.marker[i] =crear_puntos(point,html,markerOpts);
				}
			 	grupos['paradas'].push($.googleMaps.marker[i]);
			}
		}

	},
	mapEventos: function(markers, variables, polylineas, grupos) {
		if (typeof(markers.length) == 'undefined')
            markers = [markers];
        var j = 0;
        for (i = 0; i < markers.length; i++) {
            if (markers[i].latitude && markers[i].longitude) {            
				var markerOpts = {
				   position: new google.maps.LatLng(markers[i].latitude, markers[i].longitude),
				   draggable: false,
				   animation: google.maps.Animation.DROP,
				   map: $.googleMaps.gMap,
				   icon:markers[i].icon.image,
				   labelContent: (markers[i].info.descripcion)? markers[i].info.descripcion:"",
				   labelAnchor: new google.maps.Point(20, 40), 
				   labelClass: 'LabeledMarker_eventos',
				   labelStyle: {opacity: 0.75}
				};
		
	 			var point = "";
      			var html = markers[i].info.layer || "";
			 	if ( markers[i].latitude && markers[i].longitude ) {
					$.googleMaps.marker[i] =crear_puntos(point,html,markerOpts);
				}
			 	grupos['eventos'].push($.googleMaps.marker[i]);
			}
		}

	}
}
function contarmarklabels(){
var $vs='';
	$('.LabeledMarker_flota').each(function(i){
		//$vs += i+'->'+$(this).find('label').html()+', ';
		if(i!=0){
			$(this).find('label').remove();	
			//$(this).remove();
		}
		});}
function contarmarklabels_eventos(){
var $vs='';
	$('.LabeledMarker_eventos').each(function(i){
		$vs += i+'->'+$(this).find('label').html()+', ';
		if(i!=0){
			$(this).find('label').remove();	
		}
		});}
function eliminar_overlay(grupo){
	if(grupo.length>0){
	grupo.pop().setMap(null);
	if(grupo.length>0){
		for (iLoopIndex=0;iLoopIndex<grupo.length;iLoopIndex++){
			grupo[iLoopIndex].setMap(null);
		}	
	}
	grupo.length=0;
	}
}
var isad=0;
function crear_puntos(punto, html,markerOpts) {
	var marker = new MarkerWithLabel(markerOpts);
	var direccion= '';
	var geocoder = new google.maps.Geocoder();  
	
	  var point = new google.maps.LatLng(marker.getPosition().lat(), marker.getPosition().lng());
	  geocoder.geocode({ 'latLng': point }, function (results, status) {
		  
    if (status == google.maps.GeocoderStatus.OK) {
	  var iw = new google.maps.InfoWindow({
			content: html+ "<br><b>Direccion:</b>"+results[0].formatted_address+"<br></div>"
	  });
	  		
	google.maps.event.addListener(marker, "click", function (e) {
		if (marker.getAnimation() != null) {
    			marker.setAnimation(null);
  			} else {
    			marker.setAnimation(google.maps.Animation.DROP);
  			}
		iw.open($.googleMaps.gMap, marker);
		});
    }else{
		var iw = new google.maps.InfoWindow({
			content: html+ "</div>"
	 	 });
		google.maps.event.addListener(marker, "click", function (e) {
			if (marker.getAnimation() != null) {
    			marker.setAnimation(null);
  			} else {
    			//marker.setAnimation(google.maps.Animation.BOUNCE);
  			}
			iw.open($.googleMaps.gMap, marker)});
	}
  });
	return marker;
  }
function dump(arr,level) {
	var dumped_text = "";
	if(!level) level = 0;
	var level_padding = "";
	for(var j=0;j<level+1;j++) level_padding += "    ";
	if(typeof(arr) == 'object') {
		for(var item in arr) {
			var value = arr[item];
			
			if(typeof(value) == 'object') {
				dumped_text += level_padding + "'" + item + "' ...\n";
				dumped_text += dump(value,level+1);
			} else {
				dumped_text += level_padding + "'" + item + "' => \"" + value + "\"\n";
			}
		}
	} else {
		dumped_text = "===>"+arr+"<===("+typeof(arr)+")";
	}
	return dumped_text;
}
function getColor(named) {
  	return COLORS[(colorIndex_++) % COLORS.length][named ? 0 : 1];}
	
function extendsMapBounds(){
      var radius = distanceInMeter($.googleMaps.gMap.getCenter(), $.googleMaps.gMap.getBounds().getNorthEast()), 
        circle = new google.maps.Circle({
          center: $.googleMaps.gMap.getCenter(),
          radius: 1.25 * radius // + 25%
        });
      return circle.getBounds();
    }
	function distanceInMeter(){
      var lat1, lat2, lng1, lng2, e, f, g, h;
      if (arguments[0] instanceof google.maps.LatLng){
        lat1 = arguments[0].lat();
        lng1 = arguments[0].lng();
        if (arguments[1] instanceof google.maps.LatLng){
          lat2 = arguments[1].lat();
          lng2 = arguments[1].lng();
        } else {
          lat2 = arguments[1];
          lng2 = arguments[2];
        }
      } else {
        lat1 = arguments[0];
        lng1 = arguments[1];
        if (arguments[2] instanceof google.maps.LatLng){
          lat2 = arguments[2].lat();
          lng2 = arguments[2].lng();
        } else {
          lat2 = arguments[2];
          lng2 = arguments[3];
        }
      }
      e = Math.PI*lat1/180;
      f = Math.PI*lng1/180;
      g = Math.PI*lat2/180;
      h = Math.PI*lng2/180;
      return 1000*6371 * Math.acos(Math.min(Math.cos(e)*Math.cos(g)*Math.cos(f)*Math.cos(h)+Math.cos(e)*Math.sin(f)*Math.cos(g)*Math.sin(h)+Math.sin(e)*Math.sin(g),1));
    }