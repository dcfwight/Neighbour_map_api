//------------Initial data for markers---------------------------------------//
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
var Marker = function(data) {
	this.title=ko.observable(data.title);
	this.location=ko.observable(data.location);
};

//-------------- ViewModel ---------------------------------------------------//
var AppViewModel= function() {
	var self = this;
	
	this.placesList = ko.observableArray([]);
	places.forEach(function(place){
		self.placesList.push(new Marker(place));
		});

}

// Activate knockout.js
ko.applyBindings(new AppViewModel());