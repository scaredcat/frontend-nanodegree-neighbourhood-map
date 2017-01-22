var map;
var ZOMATO_KEY = '7250dfc0a3bf33128f44c564e09e66a3';
var SYMBOL_SVG = 'M12,11.5A2.5,2.5 0 0,1 9.5,9A2.5,2.5 0 0,1 12,6.5A2.5,2.5 0 0,1 14.5,9A2.5,2.5 0 0,1 12,11.5M12,2A7,7 0 0,0 5,9C5,14.25 12,22 12,22C12,22 19,14.25 19,9A7,7 0 0,0 12,2Z';
var CANBERRA = null;
var infowindow = null; //only have one global infowindow
var currentMark = null; //keep track of the marker that is currently open
var previousColour = null; //also keep the colour of the currently open icon

// stores the data received from the api call as well as state data
// for the view
var model = {
	zomatoList: [],
	googleList: [],
	sidebar: { // stores whether or not the sidebar is visible
		visible: 0,
		value: '>'
	}
};

var sideBar = function() {
	var self = this;
	this.visible = ko.observable(true);

	this.value = ko.computed(function(){
		return this.visible()? '>' : '<';
	}, self);
};

/**
* This returns an Object type of Restaurant which is then later used to filter
* the restaurants displayed on the page
*/
var Restaurant = function(data) {
	var self = this;
	this.url = data.url;
	this.name = data.name;
	this.rating = data.rating;
	this.thumb = data.thumb;
	this.latitude = data.latitude;
	this.longitude = data.longitude;
	this.colour = data.colour;

	this.content = '<h4>' + data.name+'</h4>';
	if (data.thumb) {
		this.content += '<img style="width: 100px; margin: auto; display: block" src="'+data.thumb+ '" alt="' + data.name +' picture"/>';
	} else {
		this.content += '<span class="warning">Image not available</span>';
	}

	this.marker = createMarker(
		{lat: parseFloat(data.latitude), lng: parseFloat(data.longitude)},
		this.content,
		data.colour);
};

var ViewModel = function() {
	var self = this;
	this.toggleSidebar = function(toggle) {
		this.sidebar().visible(!(this.sidebar().visible()));
	};

	this.sidebar = ko.observable(new sideBar());

	this.filter = ko.observable('');

	this.restaurants = ko.observableArray([]);

	//zomato data
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
	}).done(
		function(results) {
			model.zomatoList = results.restaurants;
			results.restaurants.forEach(function(item) {
				var restaurant = item.restaurant;

				self.restaurants.push(new Restaurant({
					url: restaurant.url,
					name: restaurant.name,
					rating: restaurant.user_rating.aggregate_rating,
					thumb: restaurant.thumb,
					latitude: restaurant.location.latitude,
					longitude: restaurant.location.longitude,
					colour: 'red'
				}));
			});
		}
	).fail(function() {
		window.alert('Unable to load Zomato data. Please refresh the page to try again.');
	});

	// load Google maps place data
	var request = {
		location: CANBERRA,
		radius: '500',
		type: 'restaurant' // types: restaurant, cafe, bakery, bar, 
	};

	var service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, function(results, status) {
		if (status == google.maps.places.PlacesServiceStatus.OK) {
			model.googleList = results;

			results.forEach(function(place) {
				var photo = '';
				if(place.hasOwnProperty('photos')) {
					photo = place.photos[0].getUrl({maxWidth: 100});
				}
				self.restaurants.push(new Restaurant({
					url: null,
					name: place.name,
					rating: place.rating,
					thumb: photo,
					latitude: place.geometry.location.lat(),
					longitude: place.geometry.location.lng(),
					colour: 'black'
				}));
			});
		} else {
			window.alert('Unable to fetch google maps Place data. Please refresh the page to try again.');
		}
	});

	// functions to control the view
	this.showAllRestaurants = function() {
		self.restaurants().forEach(function(restaurant) {
			if(restaurant.marker) {
				restaurant.marker.setVisible(true);
			}
		});
	};

	this.filtered = ko.computed(function() {
		var filter = this.filter().toLowerCase();
		if (!filter) {
			self.showAllRestaurants();
			return this.restaurants();
		} else {
			return ko.utils.arrayFilter(this.restaurants(), function(restaurant) {
				var show = restaurant.name.toLowerCase().indexOf(filter) != -1;
				restaurant.marker.setVisible(show);
				return show;
			});
		}
	}, self);

	this.focusMarker = function(item) {
		self.toggleSidebar();
		google.maps.event.trigger(item.marker, 'click');
	};
};


function initMap() {
	CANBERRA = new google.maps.LatLng(-35.279100, 149.131758);
	map = new google.maps.Map(document.getElementById('map'), {
		center: CANBERRA,
		zoom: 16,
		mapTypeControl: false
	});

	infowindow = new google.maps.InfoWindow(); //global infowindow
	ko.applyBindings(new ViewModel());
}

function createMarker(location, infoContent, colour = 'black') {
	var marker = new google.maps.Marker({
		map: map,
		position: location,
		icon: markerIcon(colour),
		originColour: colour
	});

	google.maps.event.addListener(marker, 'click', function() {
		if(currentMark) {
			currentMark.setIcon(markerIcon(previousColour));
		}
		currentMark = this;
		previousColour = marker.icon.fillColor;
		infowindow.setContent(infoContent);
		infowindow.open(map, this);
		currentMark.setIcon(markerIcon('blue'));
	});

	// change marker back to original colour
	google.maps.event.addListener(infowindow,'closeclick',function(){
		currentMark.setIcon(markerIcon(previousColour));
	});

	return marker;
}

function markerIcon(colour) {
	return {
		path: SYMBOL_SVG,
		fillColor: colour,
		fillOpacity: 1,
		anchor: {x: 12, y: 20}
	};
}