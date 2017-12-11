var trips,
    map,
    charts;

d3.csv('data/groupLATAM.csv', function(csv){
    console.log(csv[1])
    trips = new Data(csv);
    charts = new Chart(trips);

    d3.json('../data/coord.json', function(err,data){
        if(err) {
            console.log(err);
        } else {
            map = new Map(data, trips, charts); 
            map.markerInit();
        }
    });
    
    var typeChoosed = 'all';
    $("#type-all").click(function(){
        if(trips.filter.type && trips.filter.origin) {
            charts.typeChart();
        }
    });

    $("#type-nac").click(function(){
        if(trips.filter.type != 'national' && trips.filter.origin) {
            charts.typeChart('national');
        }
    });

    $("#type-int").click(function(){
        if(trips.filter.type != 'international' && trips.filter.origin) {
            charts.typeChart('international');
        }
    });
});
