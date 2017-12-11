function Map(data, trips, charts) {
    var map = L.map('map').setView([-15.7942287, -47.8821658], 4);
    
    L.tileLayer('https://api.tiles.mapbox.com/v4/{id}/{z}/{x}/{y}.png?access_token=pk.eyJ1IjoibWFwYm94IiwiYSI6ImNpejY4NXVycTA2emYycXBndHRqcmZ3N3gifQ.rJcFIG214AriISLbB6B5aw', {
        maxZoom: 10,
        attribution: 'Map data &copy; <a href="http://openstreetmap.org">OpenStreetMap</a> contributors, ' +
            '<a href="http://creativecommons.org/licenses/by-sa/2.0/">CC-BY-SA</a>, ' +
            'Imagery © <a href="http://mapbox.com">Mapbox</a>',
        id: 'mapbox.streets'
    }).addTo(map);

    var cities = {};
    var markers = [];

    this.markerInit = function() {
        var i = 0;
        
        data.forEach(element => {
            var coord = [element.latitude,element.longitude];
            cities[element.city] = coord;
            var icon = iconCreator('init');
            var marker = L.marker(coord, {
                icon: icon,
                draggable: true,
                city: element.city,
                id: i++
            });
            map.addLayer(marker);
            marker.bindPopup(element.city)
                .on('click', chooseOrigin)
                .on('mouseover', function(e) {
                    this.openPopup();
                })
                .on('mouseout', function(e) {
                    this.closePopup();
                });
                
            markers.push(marker);
        });
    };

    var qtyDestination = 0,
    limitDestination = 3;

    var price;
    function chooseOrigin(e) {
        firstClick = true;
        var icon = iconCreator('origin');
        e.target.setIcon(icon);
        e.target.on('click', restartChoise)
            .off('click', chooseOrigin);    

        var cityOrigin = e.target.options.city;
        document.getElementById("originName1").innerHTML = cityOrigin;
        document.getElementById("originName2").innerHTML = cityOrigin;
        charts.destinationCharts(cityOrigin);
        var destinations = trips.groups.destination.all();
        var destinationOptions = {};
        price = { max: 0, min: 5000 };
        destinations.forEach(destiny => {
            if(destiny.value.count > 0) {
                destinationOptions[destiny.key] =  destiny.value;
                var avgPrice = destiny.value.avg;
                if(avgPrice < price.min) {
                    price.min = avgPrice;
                } else if(avgPrice > price.max) {
                    price.max = avgPrice;
                }

            }
        });

        price.scale = d3.scale.linear().domain([price.min, (price.max/2)]).range(['#74c476', '#fc8d59']);
        markers.forEach(marker => {
            if(marker != e.target) {
                if(destinationOptions[marker.options.city]){
                    var priceAvg = Number(destinationOptions[marker.options.city].avg);
                    price.avg = priceAvg;
                    marker.options.price = priceAvg;
                    var icon = iconCreator('destinyOption',price);
                    marker.setIcon(icon);
                    marker.setOpacity(1);
                    marker.on('click', chosseDestination)
                        .off('click', chooseOrigin);
                    marker.bindPopup('<h3>' + marker.options.city + '</h3><p>' + priceAvg.toFixed(2) + '</p>');
                } else {
                    var icon = iconCreator('notOption');
                    marker.setIcon(icon);
                    marker.setOpacity(0.5);
                    marker.on('click', noDestination)
                        .off('click', chooseOrigin);
                }
            }
        });
    }

    function restartChoise(e) {
        firstClick = false;
        d3.selectAll('#topDestination svg').remove();
        charts.cleanTravelTap();
        d3.selectAll('#comparation svg').remove();
        document.getElementById("originName1").innerHTML = '';
        document.getElementById("originName2").innerHTML = '';
        trips.dimensions.origin.filterAll();
        trips.dimensions.destination.filterAll();

        var icon = iconCreator('init');
        markers.forEach(marker => {
            marker.setIcon(icon);
            marker.setOpacity(1);
            marker.on('click', chooseOrigin)
                .off('click', restartChoise)
                .off('click', chosseDestination)
                .off('click', noDestination);
            marker.bindPopup(marker.options.city);
        });
        qtyDestination = 0;
    }

    var firstDestination;
    function chosseDestination(e) {
        if (qtyDestination < limitDestination) {
            var cityDestinantion = e.target.options.city;
            charts.comparation(cityDestinantion);
            if(!firstDestination){
                document.getElementById("destinationName").innerHTML = cityDestinantion;
                firstDestination = cityDestinantion;
                charts.travelCharts(cityDestinantion);
            } else {
                
                charts.viewComparationChart();
            }
            var icon = iconCreator('destination');
            e.target.setIcon(icon);
            e.target.setOpacity(1);
            e.target.on('click', resetDestination)
                .off('click', chosseDestination);
            qtyDestination++;
        } else {
            alert('Não é possível escolher outro destino para a comparação');
        }
    }

    function resetDestination(e) {
        var cityReset = e.target.options.city;
        charts.removeComparation(cityReset);
        if(cityReset == firstDestination){
            document.getElementById("destinationName").innerHTML = '';
            charts.cleanTravelTap();
            firstDestination = charts.comparationData.destinies[0] ? charts.comparationData.destinies[0] : null;
            if (firstDestination) {
                charts.travelCharts(firstDestination);
                document.getElementById("destinationName").innerHTML = firstDestination;
            } 
        }
        charts.comparation();

        price.avg = e.target.options.price;
        var icon = iconCreator('destinyOption',price);
        e.target.setIcon(icon);
        e.target.setOpacity(1);
        e.target.on('click', chosseDestination)
            .off('click', resetDestination);
        qtyDestination--;
    }

    function noDestination(e) {
        alert('Esse não é um destino válido');
    }

}

function iconCreator(type,price) {
    var markerShape = {
        noclicked: 'circle-dot',
        click: 'doughnut'
    };
    
    var markerColor = {
        init: 'red',
        origin: 'blue',
        destiny: 'green',
        nodestiny: 'gray',
        destination: 'yellow'
    }

    var iconOptions = {
        borderWidth: 5,
    }
    switch (type) {
        case 'init':
            iconOptions.iconShape = markerShape.noclicked;
            iconOptions.borderColor = markerColor.init;
            break;
        case 'origin':
            iconOptions.iconShape = markerShape.click;
            iconOptions.borderColor = markerColor.origin;
            break;
        case 'destination':
            iconOptions.iconShape = markerShape.click;
            iconOptions.borderColor = markerColor.destination;
            break;
        case 'destinyOption':
            iconOptions.iconShape = markerShape.noclicked;
            iconOptions.borderColor = price.scale(price.avg);
            break;
        case 'notOption':
            iconOptions.iconShape = markerShape.noclicked;
            iconOptions.borderColor = markerColor.nodestiny;
            break;
        default:
            break;
    }
    return L.BeautifyIcon.icon(iconOptions);
}



