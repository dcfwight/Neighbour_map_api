var $test=$('#test')

$test.text('Success: changed via jQuery')

//-------------- ViewModel ---------------------------------------------------//
function AppViewModel() {
	this.testName = ko.observable('Success: changed via knockout');
}

// Activate knockout.js
ko.applyBindings(new AppViewModel());