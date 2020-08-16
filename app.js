mapboxgl.accessToken = 'pk.eyJ1IjoiaGFuZmlldiIsImEiOiJQYlFjVlNvIn0.ukrwZz0v6BXZEOsJHBdgDg';
var map = new mapboxgl.Map({
    container: 'map', // container id
    style: 'mapbox://styles/hanfiev/ckdvmg4wb2a7x19nx14njygyw', // style URL
    center: [106.82692468983879, -6.175678412080629], // starting position [lng, lat]
    zoom: 13 // starting zoom
});

var bufferData = ''
var restaurantWithin = ''
var point = turf.point([106.82692468983879, -6.175678412080629])
var resArray = ''
var selectedRestaurantPoint = ''

var header = document.getElementById("radiusOption");
var btns = header.getElementsByClassName("option");
for (var i = 0; i < btns.length; i++) {
    btns[i].addEventListener("click", function () {
        var current = document.getElementsByClassName("active");
        current[0].className = current[0].className.replace(" active", "");
        this.className += " active";

        radius = parseInt(this.innerText);
        test();
    });
}

//restaurant data
var loadData = $.ajax({
    url: 'restaurant.geojson',
    async: false,
    dataType: "json"
})
var data = loadData.responseJSON

var btnVal = 0
function searchRestaurant() {
    //find restaurants within the circle
    restaurantWithin = turf.pointsWithinPolygon(data, bufferData)

    //randomize restaurants within the circle
    resArray = restaurantWithin.features

    const random = Math.floor(Math.random() * resArray.length);
    console.log(random, resArray[random]);

    //push restaurant data to front
    document.getElementById("resultsHeader").innerHTML = "Results from " + resArray.length + " restaurants"
    document.getElementById("resultsCoord").innerHTML = "<i data-feather='map-pin'></i>" + resArray[random].geometry.coordinates[0] + ', ' + resArray[random].geometry.coordinates[1]
    document.getElementById("resultsPlace").innerHTML = "<h2>" + resArray[random].properties.name + "</h2>" + resArray[random].properties.vicinity

    //check button status
    
    if (btnVal == 0){
        $('form').hide()
        $('#results').show()
        btnVal = 1
        document.getElementById("button").innerHTML = "<p>Try Again</p>"
        selectedRestaurantPoint = turf.point(resArray[random].geometry.coordinates)
        map.getSource('selectedRestaurant').setData(selectedRestaurantPoint);
    } else {
        $('form').show()
        $('#results').hide()
        btnVal = 0
        document.getElementById("button").innerHTML = "<p>Find a random restaurant</p>"

    //generate restaurantPoint data on push to map
   



    }
}


function test() {
    console.log('jalan')

    let bufferData = turf.buffer(point, radius, {
        units: 'meters'
    })
    console.log(bufferData)
    map.getSource('buffer').setData(bufferData);
}
var size = 100;

// implementation of CustomLayerInterface to draw a pulsing dot icon on the map
// see https://docs.mapbox.com/mapbox-gl-js/api/#customlayerinterface for more info
var pulsingDot = {
    width: size,
    height: size,
    data: new Uint8Array(size * size * 4),

    // get rendering context for the map canvas when layer is added to the map
    onAdd: function () {
        var canvas = document.createElement('canvas');
        canvas.width = this.width;
        canvas.height = this.height;
        this.context = canvas.getContext('2d');
    },

    // called once before every frame where the icon will be used
    render: function () {
        var duration = 1000;
        var t = (performance.now() % duration) / duration;

        var radius = (size / 2) * 0.3;
        var outerRadius = (size / 2) * 0.7 * t + radius;
        var context = this.context;

        // draw outer circle
        context.clearRect(0, 0, this.width, this.height);
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            outerRadius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 200, 200,' + (1 - t) + ')';
        context.fill();

        // draw inner circle
        context.beginPath();
        context.arc(
            this.width / 2,
            this.height / 2,
            radius,
            0,
            Math.PI * 2
        );
        context.fillStyle = 'rgba(255, 100, 100, 1)';
        context.strokeStyle = 'white';
        context.lineWidth = 2 + 4 * (1 - t);
        context.fill();
        context.stroke();

        // update this image's data with data from the canvas
        this.data = context.getImageData(
            0,
            0,
            this.width,
            this.height
        ).data;

        // continuously repaint the map, resulting in the smooth animation of the dot
        map.triggerRepaint();

        // return `true` to let the map know that the image was updated
        return true;
    }
};

map.on('load', function () {
    map.addImage('pulsing-dot', pulsingDot, {
        pixelRatio: 2
    });

    map.addSource('points', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [106.82692468983879, -6.175678412080629]
                }
            }]
        }
    });
    map.addLayer({
        'id': 'points',
        'type': 'symbol',
        'source': 'points',
        'layout': {
            'icon-image': 'pulsing-dot'
        }
    });

    map.addSource('selectedRestaurant', {
        'type': 'geojson',
        'data': {
            'type': 'FeatureCollection',
            'features': [{
                'type': 'Feature',
                'geometry': {
                    'type': 'Point',
                    'coordinates': [106.82692468983879, -6.175678412080629]
                }
            }]
        }
    });
    map.addLayer({
        'id': 'selectedRestaurant',
        'type': 'circle',
        'source': 'selectedRestaurant',
        'paint': {
            'circle-color': '#ffffff',
            'circle-radius': 4
        }
    });

    map.addSource('buffer', {
        'type': 'geojson',
        'data': {
            'type': 'Feature',
            'geometry': {
                'type': 'Polygon',
                'coordinates': [
                    [
                        [
                            106.8314162662594,
                            -6.175678412080648
                        ],
                        [
                            106.83132996187793,
                            -6.176549589253481
                        ],
                        [
                            106.8310743653625,
                            -6.177387286224193
                        ],
                        [
                            106.83065929914386,
                            -6.17815931100014
                        ],
                        [
                            106.83010071398402,
                            -6.178835995449734
                        ],
                        [
                            106.8294200759974,
                            -6.1793913353792185
                        ],
                        [
                            106.82864354172017,
                            -6.179803989796741
                        ],
                        [
                            106.82780095292905,
                            -6.180058100972278
                        ],
                        [
                            106.8269246898388,
                            -6.1801439037882915
                        ],
                        [
                            106.82604842674853,
                            -6.180058100972278
                        ],
                        [
                            106.82520583795741,
                            -6.179803989796741
                        ],
                        [
                            106.82442930368016,
                            -6.1793913353792185
                        ],
                        [
                            106.82374866569357,
                            -6.178835995449734
                        ],
                        [
                            106.82319008053372,
                            -6.17815931100014
                        ],
                        [
                            106.82277501431508,
                            -6.177387286224193
                        ],
                        [
                            106.82251941779968,
                            -6.176549589253481
                        ],
                        [
                            106.8224331134182,
                            -6.175678412080648
                        ],
                        [
                            106.82251941779968,
                            -6.174807233474505
                        ],
                        [
                            106.82277501431508,
                            -6.173969532422072
                        ],
                        [
                            106.82319008053372,
                            -6.173197501537412
                        ],
                        [
                            106.82374866569357,
                            -6.172520809882081
                        ],
                        [
                            106.82442930368016,
                            -6.171965462746872
                        ],
                        [
                            106.82520583795741,
                            -6.171552802220636
                        ],
                        [
                            106.82604842674853,
                            -6.171298686963378
                        ],
                        [
                            106.8269246898388,
                            -6.171212882714067
                        ],
                        [
                            106.82780095292905,
                            -6.171298686963378
                        ],
                        [
                            106.82864354172017,
                            -6.171552802220636
                        ],
                        [
                            106.8294200759974,
                            -6.171965462746872
                        ],
                        [
                            106.83010071398402,
                            -6.172520809882081
                        ],
                        [
                            106.83065929914386,
                            -6.173197501537412
                        ],
                        [
                            106.8310743653625,
                            -6.173969532422072
                        ],
                        [
                            106.83132996187793,
                            -6.174807233474505
                        ],
                        [
                            106.8314162662594,
                            -6.175678412080648
                        ]
                    ]
                ]
            }
        }
    });
    map.addLayer({
        'id': 'buffer',
        'type': 'fill',
        'source': 'buffer',
        'layout': {},
        'paint': {
            'fill-color': '#fff',
            'fill-opacity': 0.1
        }
    });
});

var coord = document.getElementById('coord').value;
var radius = 500;


var currentCoord = [parseFloat(coord.split(',')[1]), parseFloat(coord.split(',')[0])]


map.on('click', function (e) {
    let data = {
        'type': 'FeatureCollection',
        'features': [{
            'type': 'Feature',
            'geometry': {
                'type': 'Point',
                'coordinates': [e.lngLat.lng, e.lngLat.lat]
            }
        }]
    }

    point = turf.point([e.lngLat.lng, e.lngLat.lat])
    bufferData = turf.buffer(point, radius, {
        units: 'meters'
    })
    console.log(data)
    console.log(bufferData)

    console.log([e.lngLat.lng, e.lngLat.lat])

    map.getSource('points').setData(data);
    map.getSource('buffer').setData(bufferData);

    document.getElementById('coord').value = e.lngLat.lng.toString().substring(0, 9) + ', ' + e.lngLat.lat.toString().substring(0, 9)


});