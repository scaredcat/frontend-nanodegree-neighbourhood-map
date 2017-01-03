//7250dfc0a3bf33128f44c564e09e66a3 - zomato

var map;

function initMap() {
       // TODO: use a constructor to create a new map JS object. You can use the coordinates
       // we used, 40.7413549, -73.99802439999996 or your own!
   map = new google.maps.Map(document.getElementById('map'), {
    center: {lat: -35.279100, lng: 149.131758},
    zoom: 16
   });
}