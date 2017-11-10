var $test=$('#test')

$test.text('Success: changed via jQuery')

var places = [
	{name: "Edinburgh Castle",
	place_id: "ChIJ98CZIJrHh0gRWApM5esemkY"},
	
	{name: "Arthur's Seat",
	place_id: "ChIJuSIvEYS4h0gR8EyTQWxGiiE"
		
	}
]


//-------------- ViewModel ---------------------------------------------------//
function AppViewModel() {
	this.testName = ko.observable('Success: changed via knockout');
}

// Activate knockout.js
ko.applyBindings(new AppViewModel());