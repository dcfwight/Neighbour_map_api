//------------Initial data for places---------------------------------------//
// var places is stored in separate js file - ./data/places----------------//

var map;
var defaultIcon, highlightIcon, selectIcon;
var infoWindow;
var service;
var fourSqClientID = 'PTZJNN0ILNJ4HWNC0J2LUI2UW02C0Q3SVLYBRASAJLK4MELP';
var fourSqClientSecret = '33SQ5OOVGO1HOJOZLSI3DUCWBMDGCHGUYNRBUER2RRAVV2IC';
var $error_report = $('#error_report');
var $reset = $('#reset');

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
	self.selected = false;
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
	self.currentFilter = ko.observable(''); // property to store the filter
	
	self.filterPlaces = ko.computed(function() {
		var filter = self.currentFilter().toLowerCase();
		if (!filter) {
			for (var k=0; k< self.placesList().length; k++) {
				self.placesList()[k].marker.setVisible(true);
			}
			return self.placesList();
		} else {
			var filtered =  ko.utils.arrayFilter(self.placesList(), function(place) {
				if (place.title().toLowerCase().includes(filter)) {
					place.marker.setVisible(true);
					return place;
				} else {
					place.marker.setVisible(false);
				}
			});
			return filtered;
		}
	
	self.reset = ko.observable('');
	}, AppViewModel);
	
	
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
			fourSqID: place.fourSqID,
			selected: false
		});
		place.marker.setIcon(defaultIcon);
		place.marker.setMap(map);
		place.marker.addListener('click', function() {
			clearMarkerAnimation();
			this.setIcon(highlightIcon);
			this.selected = true;
			populateInfoWindow(this, infoWindow);
		});
		place.marker.addListener('mouseover', function() {
			this.setIcon(highlightIcon);
		});
		place.marker.addListener('mouseout', function() {
			if (this.selected === false){
				this.setIcon(defaultIcon);
			}
		});
		
	}
	
	this.placeClick = function() {
		clearMarkerAnimation();
		var marker = self.placesList()[this.index].marker;
		marker.setIcon(selectIcon);
		marker.setAnimation(google.maps.Animation.BOUNCE);
		marker.setMap(map);
		populateInfoWindow(marker, infoWindow);
	};
	
	this.reset = function() {
		fitMap(map,places);
		clearMarkerAnimation();
		infoWindow.close();
	};

	function clearMarkerAnimation() {
		for (var i = 0; i < self.placesList().length; i++) {
			self.placesList()[i].marker.setAnimation(null);
			self.placesList()[i].marker.setIcon(defaultIcon);
		}
	}
};

//Initialize the map - this is called in callback after googlemaps api link

function initMap() {
	// first remove the 'loading Googlemaps text'
	$error_report.text('');
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
	
	fitMap(map,places);

	defaultIcon = markerMaker('0091ef');
	highlightIcon = markerMaker('FFFF24');
	selectIcon = markerMaker('46C646');
	
	infoWindow = new google.maps.InfoWindow();
	service = new google.maps.places.PlacesService(map);

	// Activate knockout.js
	ko.applyBindings(new AppViewModel());
}

function fitMap(map, places) {
	var bounds = new google.maps.LatLngBounds();
	// extend the bounds for all the items in places
	for (var i = 0; i < places.length; i++) {
		bounds.extend(places[i].location);
		map.fitBounds(bounds);
	}
}

function markerMaker (color) {
	var icon = new google.maps.MarkerImage(
		'http://chart.googleapis.com/chart?chst=d_map_spin&chld=1.15|0|' + color +
		'|40|_|%E2%80%A2',
		new google.maps.Size(21, 34),
		new google.maps.Point(0, 0),
		new google.maps.Point(10, 34),
		new google.maps.Size(21, 34)
	);
	return icon;
}


function populateInfoWindow(marker, infoWindow) {
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

	// NOTE on the below - have replaced the $.getJSON with the fetch command per
	// Udacity mentor suggestion. Easier to handle callbacks with promises?
	// the $.getJSON code works - have left in for future reference.
				
				//$.getJSON(fourSqUrl)
				//	.done(function(data) {
				//		if (data.response.venue.price.message) {
				//			innerHTML += '<hr><div>Price level: ' + data.response.venue.price.message +'</div>';
				//			infoWindow.setContent(innerHTML);
				//		}
				//	}).fail(function(e) {
				//		var errStr = ('Failed to retrieve data from FourSquare. ' +
				//		e.status + ': ' + e.statusText);
				//		console.log(errStr);
				//		$error_report.text(errStr);
				//		infoWindow.setContent(innerHTML);
				//});
				fetch(fourSqUrl)
					.then(
						function(response) {
							if (response.status != 200) {
								console.log('Error in fetching from FourSquare. ' +
									'Status Code: ' + response.status);
								return;
							}
							// Examine the text in the response
							response.json().then(function(data){
								if (data.response.venue.price.message) {
									innerHTML += '<hr><div>Price level: ' + data.response.venue.price.message +'</div>';
									infoWindow.setContent(innerHTML);
								}
							});
						}
					)
					.catch(function(err) {
						console.log('Fetch Error :-S', err);
					});
			} else {
				infoWindow.setContent(innerHTML);
			}
		}
	});
	infoWindow.addListener('closeclick', function() {
		infoWindow.setMarker = null;
		marker.setIcon(defaultIcon);
		marker.setAnimation(null);
	});
	infoWindow.open(map, marker);
}

function mapError() {
	// mapError is used as an error callback in index.html - do NOT delete.
	$error_report.text('Could not load google maps - check the link');
	console.log('Failed to load googlemaps from index.html script');
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