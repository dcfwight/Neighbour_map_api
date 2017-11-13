//------------Initial data for places---------------------------------------//
var places = [
				{title: "Edinburgh Castle",
				location: {lat: 55.9485947,
							lng: -3.1999135 },
				type: 'attraction',
				fourSqID: '',
				gPlaceID: '7656260f957b68a9673d268fed9f07d30bd5f06a'
				},
				
				{title: "Arthur's Seat",
				location: {lat: 55.94408250000001,
							lng: -3.1618324 },
				type: 'attraction',
				fourSqID: '',
				gPlaceID: '102c0de3e8d21d1511aaf54c8699ecc636cdb64d'
				},
				{title: "Royal Yacht Britannia",
				location: {lat: 55.9821554,
							lng: -3.1772521 },
				type: 'attraction',
				fourSqID: '',
				gPlaceID: '227950d8c495494a7120d1a054f55c36dd2be003'
				},
				{title: "The Witchery",
				location: {lat: 55.948789,
							lng: -3.195628},
				type: 'restaurant',
				fourSqID: '4bce2e1eef109521b1aa8386',
				gPlaceID: '729b80487507e8ddaf259370c6813b44182a28d9'
				},
				{title: "The Kitchen",
				location: {lat: 55.97703809999999,
							lng: -3.1726892},
				type: 'restaurant',
				fourSqID: '4b59ff2bf964a5209ca628e3',
				gPlaceID: 'c1b1a2a52d3d945b085f6bda7ab4a439a592428c'
				}
			];


var map;
var markers;
var defaultIcon;
var highlightIcon;
var fourSqClientID = 'PTZJNN0ILNJ4HWNC0J2LUI2UW02C0Q3SVLYBRASAJLK4MELP';
var fourSqClientSecret = '33SQ5OOVGO1HOJOZLSI3DUCWBMDGCHGUYNRBUER2RRAVV2IC';
var $error_report = $('#error_report');

// Note - have added an index, to map to the parent object called placesList
var Place = function(data, index) {
	var self = this;
	self.index = index;
	self.title=ko.observable(data.title);
	self.type = data.type;
	self.fourSqID = data.fourSqID;
	self.location=data.location;
	self.clicked = function() {
		this.marker.setMap(map);
		};
	self.selected=ko.observable(false);
	self.visible=ko.observable(true);
	self.description = self.title() + ", Edinburgh";
	self.infoWindow = new google.maps.InfoWindow({content: self.description});
	self.marker = new google.maps.Marker({
		position: self.location,
		title: self.title(),
		animation: google.maps.Animation.DROP
	});
	self.marker.setIcon(defaultIcon);
	self.marker.setMap(map);
	self.marker.addListener('click', function() {
		console.log(self.type);
		self.infoWindow.open(map, this);
	});
	self.marker.addListener('mouseover', function() {
		console.log('mouseover');
		self.marker.setIcon(highlightIcon);
	});
	self.marker.addListener('mouseout', function() {
		console.log('mouseout');
		self.marker.setIcon(defaultIcon);
	});
	//console.log(self.title() + ' added. It is a ' + self.type);
	if (self.type == 'restaurant' && self.fourSqID) {
		var fourSqUrl = ('https://api.foursquare.com/v2/venues/' + self.fourSqID+
					'?client_id=' + fourSqClientID +
					'&client_secret=' + fourSqClientSecret +
					'&v=20171111');
		
		$.getJSON(fourSqUrl)
			.done(function (data) {
				console.log(data.response);
			}).fail(function (e) {
				var errStr = ('Failed to retrieve data from FourSquare. ' +
							e.status+ ': '+ e.statusText);
				console.log(errStr);
				$error_report.text(errStr);
			});
	}
	if (self.type == 'attraction') {
		var title_adjust = self.title().replace(new RegExp(" ", "g"), '+');
		var wikiUrl = ('https://en.wikipedia.org/w/api.php?action=opensearch' +
					'&search='+ title_adjust +
					'&origin=*');
		var wikiUrlencode = encodeURI(wikiUrl);
		var mainTitle = '';
		// get wikipedia data
		$.getJSON(wikiUrlencode)
			.done(function(data) {
				var mainTitle = data[0];
				var title = data[1][0];
				var desc = data[2][0];
				var url = data[3][0];
				console.log(mainTitle +', '+ title + ', '+ desc, url);
			}).fail(function (e){
				var errStr = ('Failed to retrieve data from Wikipedia. ' +
							e.status+ ': '+ e.statusText);
				console.log(errStr);
				$error_report.text(errStr);
			});
		

	}
};

//-------------- ViewModel ---------------------------------------------------//
var AppViewModel= function() {
	var self = this;
	
	self.placesList = ko.observableArray([]);
	places.forEach(function(place, index){
		self.placesList.push(new Place(place, index));
	});
	
	$('#hide-points').click({selection: 'All'}, hidePoints);
	$('#show-points').click({selection: 'All'}, showPoints);
	$('#hide-attractions').click({selection: 'attraction'}, hidePoints);
	$('#show-attractions').click({selection: 'attraction'}, showPoints);
	$('#hide-restaurants').click({selection: 'restaurant'}, hidePoints);
	$('#show-restaurants').click({selection: 'restaurant'}, showPoints);
	
	function hidePoints(event) {
		console.log('hidePoints clicked, with selection ' + event.data.selection);
		for (var i = 0; i < self.placesList().length; i++) {
			if (event.data.selection == 'All') {
				self.placesList()[i].marker.setMap(null);
			} else {
				if (self.placesList()[i].type == event.data.selection) {
					self.placesList()[i].marker.setMap(null);
				}
			}
			
		}
	}
	
	function showPoints(event) {
		console.log('showPoints clicked, with selection ' + event.data.selection);
		for (var i = 0; i < self.placesList().length; i++) {
			if (event.data.selection == 'All') {
				self.placesList()[i].marker.setMap(map);
			} else {
				if (self.placesList()[i].type == event.data.selection) {
					self.placesList()[i].marker.setMap(map);
				}
			}
			
		}
	}
	
	
}


//Initialize the map - this is called in callback after googlemaps api link

function initMap  () {
	console.log('Google maps API call completed - initializing map');
	var edinburgh = {lat: 55.9533, lng: -3.1833};
	//var markers = [];
	
	map = new google.maps.Map(document.getElementById('map'),
		{center: edinburgh,
		zoom: 10,
		styles: styles
		}
	);
	
	
	
	var bounds = new google.maps.LatLngBounds();
	
	// extend the bounds for all the items in places
	for (var i=0; i< places.length; i++){
		bounds.extend(places[i].location);
		map.fitBounds(bounds);
	}
	
	var defaultIcon = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ '0091ef' +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34)
	);
	
	var highlightIcon = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ 'FFFF24' +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34)
	);

	// Activate knockout.js
	ko.applyBindings(new AppViewModel());
}




function populateInfoWindow(marker, infoWindow) {
// check to make sure the infoWindow is not already this one.
	if (infoWindow.marker != marker) {
		infoWindow.marker = marker;
		infoWindow.setContent('<div>' + marker.title + '</div>');
		infoWindow.open(map, marker);
		// Make sure the marker property is cleared if the infowindow is closed.
		infoWindow.addListener('closeclick',function(){
			infoWindow.setMarker = null;
		});
	}
};




var styles=[
// Styling object for Googlemaps
// Go to snazzymaps.com at end of Project to custom style.
	{
		"featureType": "administrative",
		"elementType": "all",
		"stylers": [
			{
				"visibility": "on"
			}
		]
	},{
		"featureType": "administrative",
		"elementType": "labels.text.fill",
		"stylers": [
			{
				"color": "#444444"
			}
		]
	},{
		"featureType": "administrative.country",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"lightness": "-63"
			}
		]
	},{
		"featureType": "administrative.province",
		"elementType": "labels",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},{
		"featureType": "administrative.locality",
		"elementType": "labels",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#ff7200"
			},
			{
				"weight": "0.64"
			}
		]
	},{
		"featureType": "administrative.land_parcel",
		"elementType": "geometry",
		"stylers": [
			{
				"saturation": "-47"
			},
			{
				"lightness": "-22"
			},
			{
				"gamma": "4.71"
			},
			{
				"weight": "5.04"
			},
			{
				"visibility": "on"
			},
			{
				"color": "#d21f1f"
			}
		]
	},{
		"featureType": "landscape",
		"elementType": "all",
		"stylers": [
			{
				"color": "#f2f2f2"
			}
		]
	},{
		"featureType": "poi",
		"elementType": "all",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},{
		"featureType": "road",
		"elementType": "all",
		"stylers": [
			{
				"saturation": -100
			},
			{
				"lightness": 45
			}
		]
	},{
		"featureType": "road.highway",
		"elementType": "all",
		"stylers": [
			{
				"visibility": "simplified"
			}
		]
	},{
		"featureType": "road.highway",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"visibility": "on"
			},
			{
				"color": "#ffffff"
			}
		]
	},{
		"featureType": "road.highway",
		"elementType": "geometry.stroke",
		"stylers": [
			{
				"color": "#be2727"
			}
		]
	},{
		"featureType": "road.arterial",
		"elementType": "labels.icon",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},{
		"featureType": "transit",
		"elementType": "all",
		"stylers": [
			{
				"visibility": "off"
			}
		]
	},{
		"featureType": "water",
		"elementType": "all",
		"stylers": [
			{
				"color": "#46bcec"
			},
			{
				"visibility": "on"
			}
		]
	},{
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [
			{
				"color": "#003781"
			}
		]
	}
];
