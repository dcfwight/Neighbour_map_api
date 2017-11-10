var $test=$('#test')

$test.text('Success: changed via jQuery')




var places = [
	{name: "Edinburgh Castle",
	place_id: "ChIJ98CZIJrHh0gRWApM5esemkY"},
	
	{name: "Arthur's Seat",
	place_id: "ChIJuSIvEYS4h0gR8EyTQWxGiiE"
		
	}
]

var Marker = function(data) {
	this.name=ko.observable(data.name);
	this.place_id=ko.observable(data.place_id);
};

//-------------- ViewModel ---------------------------------------------------//
var AppViewModel= function() {
	var self = this;
	
	this.testName = ko.observable('Succes - changed via knockout')
	
	this.placeList = ko.observableArray([]);
	places.forEach(function(place){
		self.placeList.push(new Marker(place));
		});

}

// Activate knockout.js
ko.applyBindings(new AppViewModel());