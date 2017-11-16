//------------Initial data for places---------------------------------------//
var places = [{
		title: "Edinburgh Castle",
		location: {
			lat: 55.9485947,
			lng: -3.1999135
		},
		type: 'attraction',
		fourSqID: '',
		gPlaceID: 'ChIJ98CZIJrHh0gRWApM5esemkY'
	},

	{
		title: "Arthur's Seat",
		location: {
			lat: 55.94408250000001,
			lng: -3.1618324
		},
		type: 'attraction',
		fourSqID: '',
		gPlaceID: 'ChIJucbdTWO4h0gR9_dSjRgIAXs'
	}, {
		title: "Royal Yacht Britannia",
		location: {
			lat: 55.9821554,
			lng: -3.1772521
		},
		type: 'attraction',
		fourSqID: '',
		gPlaceID: 'ChIJ7xHasgG4h0gRdMGn6H6V9e8'
	}, {
		title: "The Witchery",
		location: {
			lat: 55.948789,
			lng: -3.195628
		},
		type: 'restaurant',
		fourSqID: '4bce2e1eef109521b1aa8386',
		gPlaceID: 'ChIJNfElXprHh0gR61-eo29tIRs'
	}, {
		title: "The Kitchin",
		location: {
			lat: 55.97703809999999,
			lng: -3.1726892
		},
		type: 'restaurant',
		fourSqID: '4b59ff2bf964a5209ca628e3',
		gPlaceID: 'ChIJLy3eIwS4h0gRe4oubEitnNQ'
	}
];


var map;
var defaultIcon;
var highlightIcon;
var infoWindow;
var service;
var fourSqClientID = 'PTZJNN0ILNJ4HWNC0J2LUI2UW02C0Q3SVLYBRASAJLK4MELP';
var fourSqClientSecret = '33SQ5OOVGO1HOJOZLSI3DUCWBMDGCHGUYNRBUER2RRAVV2IC';
var $error_report = $('#error_report');

// Note - have added an index, to map to the parent object called placesList
var Place = function(data, index) {
	var self = this;
	self.index = index;
	self.title = ko.observable(data.title);
	self.type = data.type;
	self.fourSqID = data.fourSqID;
	self.gPlaceID = data.gPlaceID;
	self.location = data.location;
	self.clicked = function() {
		this.marker.setMap(map);
		this.marker.icon = highlightIcon;
		this.marker.animation = google.maps.Animation.BOUNCE;
	};
	self.visible = ko.observable(true);
	self.description = self.title() + ", Edinburgh";
	
	
	
};

//-------------- ViewModel ---------------------------------------------------//
var AppViewModel = function() {
	var self = this;
	
	self.placesList = ko.observableArray([]);
	
	for (var i=0; i < places.length; i++) {
		self.placesList.push(new Place(places[i],i));
	}
	
	for (var j=0; j< self.placesList().length; j++) {
		createMarker(j);
	}
	
	// for the following code see https://discussions.udacity.com/t/project-neighborhood-map/370281/2
	// it's a response by swooding on 'functions within loops error'
	// Note - Udacity lecture code includes functions within loops!
	function createMarker(i) {
		//Get the positions from the location array
		var place = self.placesList()[i];
		place.marker = new google.maps.Marker({
			position: place.location,
			title: place.title(),
			animation: google.maps.Animation.DROP,
			gPlaceID: place.gPlaceID,
			fourSqID: place.fourSqID
		});
		place.marker.setIcon(defaultIcon);
		place.marker.setMap(map);
		place.marker.addListener('click', function() {
			clearMarkerAnimation();
			this.setIcon(highlightIcon);
			populateInfoWindow(this, infoWindow);
		//self.infoWindow.open(map, this);
		});
		place.marker.addListener('mouseover', function() {
			this.setIcon(highlightIcon);
		});
		place.marker.addListener('mouseout', function() {
			this.setIcon(defaultIcon);
		});
		
	}
	
	this.clicked = function() {
		clearMarkerAnimation();
		var marker = self.placesList()[this.index].marker;
		marker.setIcon(highlightIcon);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		marker.setMap(map);
		populateInfoWindow(marker, infoWindow);
	};
	
	//$('#hide-points').click({
	//	selection: 'all'
	//}, hidePoints);
	//$('#show-points').click({
	//	selection: 'all'
	//}, showPoints);
	//$('#hide-attractions').click({
	//	selection: 'attraction'
	//}, hidePoints);
	//$('#show-attractions').click({
	//	selection: 'attraction'
	//}, showPoints);
	//$('#hide-restaurants').click({
	//	selection: 'restaurant'
	//}, hidePoints);
	//$('#show-restaurants').click({
	//	selection: 'restaurant'
	//}, showPoints);
	$("#target").change(function() {
		var $selection = $('#target').val();
		showOnlyPoints($selection);
		}
	);
	$('#reset').click(initMap);
	
	
	
	function hidePoints(event) {
		for (var i = 0; i < self.placesList().length; i++) {
			if (event || event.data.selection == 'all') {
				self.placesList()[i].visible(false);
				self.placesList()[i].marker.setMap(null);
			} else {
				if (self.placesList()[i].type == event.data.selection) {
					self.placesList()[i].visible(false);
					self.placesList()[i].marker.setMap(null);
				}
			}
		}
	}

	function showPoints(event) {
		infoWindow.setMarker = null;
		infoWindow.close();
		clearMarkerAnimation();
		resetFilter();
		var bounds = new google.maps.LatLngBounds();
		for (var i = 0; i < self.placesList().length; i++) {
			if (event.data.selection == 'all') {
				self.placesList()[i].visible(true);
				self.placesList()[i].marker.setMap(map);
				bounds.extend(self.placesList()[i].marker.position);
			} else {
				if (self.placesList()[i].type == event.data.selection) {
					self.placesList()[i].visible(true);
					self.placesList()[i].marker.setMap(map);
					bounds.extend(self.placesList()[i].marker.position);
				}
			}
		}
		map.fitBounds(bounds);
	}
	
	function showOnlyPoints(selection) {
		hidePoints('all');
		infoWindow.close();
		var event ={data: {selection: selection}};
		showPoints(event);
	}
	
	function clearMarkerAnimation() {
		for (var i = 0; i < self.placesList().length; i++) {
			self.placesList()[i].marker.setAnimation(null);
			self.placesList()[i].marker.setIcon(defaultIcon);
		}
	}
	
	
};

//Initialize the map - this is called in callback after googlemaps api link

function initMap() {
	console.log('Google maps API call completed - initializing map');
	var edinburgh = {
		lat: 55.9533,
		lng: -3.1833
	};
	//var markers = [];

	map = new google.maps.Map(document.getElementById('map'), {
		center: edinburgh,
		zoom: 10,
		styles: styles
	});

	var bounds = new google.maps.LatLngBounds();

	// extend the bounds for all the items in places
	for (var i = 0; i < places.length; i++) {
		bounds.extend(places[i].location);
		map.fitBounds(bounds);
	}

	defaultIcon = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + '0091ef' +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));

	highlightIcon = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + 'FFFF24' +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34));
	
	infoWindow = new google.maps.InfoWindow();
	service = new google.maps.places.PlacesService(map);

	// Activate knockout.js
	ko.applyBindings(new AppViewModel());
}


function populateInfoWindow(marker, infoWindow) {
	// check to make sure the infoWindow is not already this one.
	if (infoWindow.marker != marker) {
		service.getDetails({placeId: marker.gPlaceID}, function (place, status) {
			if (status === google.maps.places.PlacesServiceStatus.OK) {
				infoWindow.marker = marker;
				var innerHTML= '';
				innerHTML += '<div>' + marker.title + '</div>';
				if (place.formatted_address) {
					innerHTML += ('<div>' +place.formatted_address +'</div>');
				} if (place.formatted_phone_number) {
					innerHTML += '<br>' + place.formatted_phone_number;
			}
			if (place.opening_hours) {
				innerHTML += '<br><br><strong>Hours:</strong><br>' +
				place.opening_hours.weekday_text[0] + '<br>' +
				place.opening_hours.weekday_text[1] + '<br>' +
				place.opening_hours.weekday_text[2] + '<br>' +
				place.opening_hours.weekday_text[3] + '<br>' +
				place.opening_hours.weekday_text[4] + '<br>' +
				place.opening_hours.weekday_text[5] + '<br>' +
				place.opening_hours.weekday_text[6];
			}
			if (place.photos) {
			innerHTML += '<br><br><img src="' + place.photos[0].getUrl(
				{maxHeight: 100, maxWidth: 200}) + '">';
			}
			innerHTML += '</div>';
			if (marker.fourSqID) {
				var fourSqUrl = ('https://api.foursquare.com/v2/venues/' + marker.fourSqID +
				'?client_id=' + fourSqClientID +
				'&client_secret=' + fourSqClientSecret +
				'&v=20171111');
	
				$.getJSON(fourSqUrl)
					.done(function(data) {
						if (data.response.venue.price.message) {
							innerHTML += '<div>' + data.response.venue.price.message +'</div>';
							infoWindow.setContent(innerHTML);
						}
					}).fail(function(e) {
						var errStr = ('Failed to retrieve data from FourSquare. ' +
						e.status + ': ' + e.statusText);
						console.log(errStr);
						$error_report.text(errStr);
						infoWindow.setContent(innerHTML);
				});
			} else {
				infoWindow.setContent(innerHTML);
			}
		}
	});
	infoWindow.addListener('closeclick', function() {
		infoWindow.setMarker = null;
	});
	
	infoWindow.open(map, marker);	
	}
	
}

function placeSearch() {
    //this is used on the placeInput button in html file, so do not delete
	var input, filter, ul, div, i;
    input = document.getElementById('placeInput');
    filter = input.value.toUpperCase();
    ul = document.getElementById("placesUL");
    div = ul.getElementsByTagName("div");
	for (i = 0; i < div.length; i++) {
        span = div[i].getElementsByTagName("span")[0];
        if (span.innerHTML.toUpperCase().indexOf(filter) > -1) {
            div[i].style.display = "";
        } else {
            div[i].style.display = "none";

        }
    }
}

function resetFilter() {
	var ul, div,  i;
    document.getElementById('placeInput').value='';
	ul = document.getElementById("placesUL");
    div = ul.getElementsByTagName("div");
	for (i = 0; i < div.length; i++) {
		div[i].style.display = "";
    }
}

var styles = [
	// Styling object for Googlemaps
	// Go to snazzymaps.com at end of Project to custom style.
	{
		"featureType": "administrative",
		"elementType": "all",
		"stylers": [{
				"visibility": "on"
			}
		]
	}, {
		"featureType": "administrative",
		"elementType": "labels.text.fill",
		"stylers": [{
				"color": "#444444"
			}
		]
	}, {
		"featureType": "administrative.country",
		"elementType": "geometry.fill",
		"stylers": [{
				"lightness": "-63"
			}
		]
	}, {
		"featureType": "administrative.province",
		"elementType": "labels",
		"stylers": [{
				"visibility": "off"
			}
		]
	}, {
		"featureType": "administrative.locality",
		"elementType": "labels",
		"stylers": [{
				"visibility": "on"
			}, {
				"color": "#ff7200"
			}, {
				"weight": "0.64"
			}
		]
	}, {
		"featureType": "administrative.land_parcel",
		"elementType": "geometry",
		"stylers": [{
				"saturation": "-47"
			}, {
				"lightness": "-22"
			}, {
				"gamma": "4.71"
			}, {
				"weight": "5.04"
			}, {
				"visibility": "on"
			}, {
				"color": "#d21f1f"
			}
		]
	}, {
		"featureType": "landscape",
		"elementType": "all",
		"stylers": [{
				"color": "#f2f2f2"
			}
		]
	}, {
		"featureType": "poi",
		"elementType": "all",
		"stylers": [{
				"visibility": "off"
			}
		]
	}, {
		"featureType": "road",
		"elementType": "all",
		"stylers": [{
				"saturation": -100
			}, {
				"lightness": 45
			}
		]
	}, {
		"featureType": "road.highway",
		"elementType": "all",
		"stylers": [{
				"visibility": "simplified"
			}
		]
	}, {
		"featureType": "road.highway",
		"elementType": "geometry.fill",
		"stylers": [{
				"visibility": "on"
			}, {
				"color": "#ffffff"
			}
		]
	}, {
		"featureType": "road.highway",
		"elementType": "geometry.stroke",
		"stylers": [{
				"color": "#be2727"
			}
		]
	}, {
		"featureType": "road.arterial",
		"elementType": "labels.icon",
		"stylers": [{
				"visibility": "off"
			}
		]
	}, {
		"featureType": "transit",
		"elementType": "all",
		"stylers": [{
				"visibility": "off"
			}
		]
	}, {
		"featureType": "water",
		"elementType": "all",
		"stylers": [{
				"color": "#46bcec"
			}, {
				"visibility": "on"
			}
		]
	}, {
		"featureType": "water",
		"elementType": "geometry.fill",
		"stylers": [{
				"color": "#003781"
			}
		]
	}
];