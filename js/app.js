//------------Initial data for places---------------------------------------//
var places = [
				{title: "Edinburgh Castle",
				location: {lat: 55.9485947,
							lng: -3.1999135 }
				},
				
				{title: "Arthur's Seat",
				location: {lat: 55.94408250000001,
							lng: -3.1618324 }
				},
				{title: "Royal Yacht Britannia",
				location: {lat: 55.9821554,
							lng: -3.1772521 }
				}
			];

var map;

var Place = function(data) {
	var self = this;
	self.title=ko.observable(data.title);
	self.location=data.location;
	self.clicked = function() {
		console.log(self.title() + ' clicked');
		console.log("selected: " + self.selected());
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
	self.marker.setMap(map);
	self.marker.addListener('click', function() {
		self.infoWindow.open(map, this);
	});
};

//-------------- ViewModel ---------------------------------------------------//
var AppViewModel= function() {
	var self = this;
	
	self.placesList = ko.observableArray([]);
	places.forEach(function(place){
		self.placesList.push(new Place(place));
	});
}


//Initialize the map - this is called in callback after googlemaps api link
var init_lat_lng = {lat: 55.9533, lng: -3.1833};
function initMap  () {
	console.log('Google maps API call completed');

	var markers = [];

	map = new google.maps.Map(document.getElementById('map'),
		{center: init_lat_lng,
		zoom: 10,
		styles: styles
		}
	);
	var bounds = new google.maps.LatLngBounds();
	
	// extend the bounds for all the items in places
	for (var i=0; i< places.length; i++){
		bounds.extend(places[i].location);
		map.fitBounds(bounds);
		
		
		// Two event listeners - one for mouseover, one for mouseout,
		// to change the colors back and forth.
	//	marker.addListener('mouseover', function() {
	//		this.setIcon(highlightedIcon);
	//	});
	//	marker.addListener('mouseout', function() {
	//		this.setIcon(defaultIcon);
	//	});
	//
	//	map.fitBounds(bounds);
	};
	// Styled default icon
	var defaultIcon = makeMarkerIcon('0091ef');
	
	// Styled highlight icon for when the user
	// mouses over the marker.
	var highlightedIcon = makeMarkerIcon('FFFF24');
	
	var infoWindow = new google.maps.InfoWindow();
	
	document.getElementById('show-points').addEventListener('click', console.log('click'));
	document.getElementById('hide-points').addEventListener('click', console.log('click'));
	
	// Activate knockout.js
	ko.applyBindings(new AppViewModel());
}

function makeMarkerIcon(markerColor) {
	var markerImage = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|'+ markerColor +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21,34)
	);
	return markerImage;
};

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

//function showPoints() {
//	var bounds = new google.maps.LatLngBounds();
//	// Extend the boundaries of the map for each marker and display the marker
//	for (var i = 0; i < markers.length; i++) {
//		markers[i].setMap(map);
//		bounds.extend(markers[i].position);
//	}
//	map.fitBounds(bounds);
//};

//function hidePoints() {
//	for (var i = 0; i < markers.length; i++) {
//		markers[i].setMap(null);
//	}
//};
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
