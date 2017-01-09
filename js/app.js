//knockout stuff

var model = {
	zomatoList: [],
	googleList: [],
	sidebar: {
		visible: 0,
		value: '>'
	}
};

var sideBar = function() {
	var self = this;
	this.visible = ko.observable(true);

	this.value = ko.computed(function(){
		if(this.visible()) {
			return '>';
		} else {
			return '<';
		}
	}, self);
}

var viewModel = function() {
	this.toggleSidebar = function(toggle) {
		this.sidebar().visible(!(this.sidebar().visible()));
	}

	this.sidebar = ko.observable(new sideBar());
};

ko.applyBindings(new viewModel());



var map;
var ZOMATO_KEY = '7250dfc0a3bf33128f44c564e09e66a3';
var SYMBOL_SVG = 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z';


function getZomatoData() {
	$.ajax({
		url: 'https://developers.zomato.com/api/v2.1/search',
		data: {
			entity_id: 313, //canberra
			entity_type: 'city',
			radius: 500
		},
		type: 'GET',
		datatype: 'json',
		beforeSend: function(xhr) {xhr.setRequestHeader('user-key', ZOMATO_KEY);},
		success: zomatoCallback
	});
}

function zomatoCallback(results) {
	for(var i=0; i < results.restaurants.length; i++) {
		createMarker({
			lat: parseFloat(results.restaurants[i].restaurant.location.latitude), 
			lng: parseFloat(results.restaurants[i].restaurant.location.longitude)
		}, 'red');
	}
}


function initMap() {
	var canberra = new google.maps.LatLng(-35.279100, 149.131758);
	map = new google.maps.Map(document.getElementById('map'), {
		center: canberra,
		zoom: 16,
		mapTypeControl: false
	});

	var request = {
		location: canberra,
		radius: '500',
		type: 'restaurant'
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);

	// types: restaurant, cafe, bakery, bar, 

	getZomatoData();
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			var place = results[i];
			createMarker(results[i].geometry.location);
		}
	}
}

function createMarker(location, colour = 'black') {
	var marker = new google.maps.Marker({
		map: map,
		position: location,
		icon: {
			path: SYMBOL_SVG,
			fillColor: colour,
			fillOpacity: 1,
			anchor: {x: 12, y: 20}
		}
	});


	// var marker = new google.maps.Marker({
	// 	map: map,
	// 	position: place.geometry.location
	// });

	// google.maps.event.addListener(marker, 'click', function() {
	// 	infowindow.setContent(place.name);
	// 	infowindow.open(map, this);
	// });
}
