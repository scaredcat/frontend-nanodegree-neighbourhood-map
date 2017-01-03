//7250dfc0a3bf33128f44c564e09e66a3 - zomato

var map;

function initMap() {
	var canberra = new google.maps.LatLng(-35.279100, 149.131758);
	map = new google.maps.Map(document.getElementById('map'), {
		center: canberra,
		zoom: 16
	});

	var request = {
		location: canberra,
		radius: '500',
		type: 'restaurant'
	};

	service = new google.maps.places.PlacesService(map);
	service.nearbySearch(request, callback);

	// types: restaurant, cafe, bakery, bar, 
}

function callback(results, status) {
	if (status == google.maps.places.PlacesServiceStatus.OK) {
		for (var i = 0; i < results.length; i++) {
			var place = results[i];
			createMarker(results[i]);
		}
	}
}

function createMarker(place) {
	var placeLoc = place.geometry.location;

	var marker = new Marker({
		map: map,
		position: place.geometry.location,
		icon: {
			path: MAP_PIN,
			fillColor: '#00CCBB',
			fillOpacity: 1,
			strokeColor: '',
			strokeWeight: 0
		},
		map_icon_label: '<span class="map-icon map-icon-restaurant"></span>'
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

//http://map-icons.com/
