function convertData(d) {
    d['pre_travel'] = +d['pre_travel'];
    d['mean_price'] = +d['mean_price'];
    d['median_price'] = +d['median_price'];
    d['n'] = +d['n'];
    d['start_month'] = +d['start_month'];
    d['post_wday'] = +d['post_wday'];
    d['start_wday'] = +d['start_wday'];
    d['carrier'] = d['carrier_name'];
    return d;
}

function Data(csv) {

    csv.forEach(convertData);
    
    this.trips = crossfilter(csv);
    
    var reducer = reductio()
        .count(true)
        .sum(function(d) { return d['median_price']; })
        .avg(true);
        
    this.dimensions = {};

    this.dimensions.origin = this.trips.dimension(d => { return d.origin; });
    this.dimensions.destination = this.trips.dimension(d => { return d.destination; });
    this.dimensions.pre_travel = this.trips.dimension(d => { 
        return Math.floor(d.pre_travel/30);
     });
    this.dimensions.start_month = this.trips.dimension(d => { return d.start_month; });
    this.dimensions.start_wday = this.trips.dimension(d => { return d.start_wday; });
    this.dimensions.post_wday = this.trips.dimension(d => { return d.post_wday; });
    this.dimensions.type = this.trips.dimension(d => { return d.type; });
    this.dimensions.carrier = this.trips.dimension(d => { return d.carrier; });
        
    this.groups = {};
    
    this.groups.origin = this.dimensions.origin.group();
    this.groups.destination = this.dimensions.destination.group();
    reducer(this.groups.destination);
    this.groups.pre_travel = this.dimensions.pre_travel.group();
    reducer(this.groups.pre_travel);
    this.groups.start_month = this.dimensions.start_month.group();
    reducer(this.groups.start_month);
    this.groups.start_wday = this.dimensions.start_wday.group();
    reducer(this.groups.start_wday);
    this.groups.post_wday = this.dimensions.post_wday.group();
    reducer(this.groups.post_wday);
    this.groups.type = this.dimensions.type.group();
    this.groups.carrier = this.dimensions.carrier.group();
    reducer(this.groups.carrier);

    this.filter = {
        origin: null,
        destination: null,
        type: null,
        months: null
    };
    this.destinationsFilter = function(destination) {
        this.dimensions.destination.filterAll();
        this.filter.destination = destination;
        if(destination) {
            this.dimensions.destination.filter(destination);
        } 
        return this.groups.destination.order(d => { return d.avg; }).top(Infinity);
    };
    
    this.originFilter = function(origin) {
        this.dimensions.origin.filterAll();
        this.filter.origin = origin;
        if(origin) {
            this.dimensions.origin.filter(origin);
        } 
        return this.groups.origin.all();
    };

    this.typeFilter = function(type) {
        this.dimensions.type.filterAll();
        this.filter.type = type;
        if(origin) {
            this.dimensions.type.filter(type);
        } 
        return this.groups.type.all();
    };

    var weekdays = ['', 'Seg', 'Ter', 'Qua', 'Qui', 'Sex', 'Sáb', 'Dom'];
    function wday(element) {
        var day = +element.key;
        element.key = weekdays[day];
        return element;
    }

    this.postWdayFilter = function() {
        var wday = this.groups.post_wday.all()
        if (+wday[0]) {
            wday = wday.map(wday);
        }
        return wday;
    };

    this.startWdayFilter = function() {
        var wday = this.groups.start_wday.all();
        if (+wday[0]) {
            wday = wday.map(wday);
        }
        return wday;
    };

    var monthsNames = ['','Jan', 'Feb', 'Mar', 'Abr', 'Maio', 'Jun', 'Jul', 'Aug', 'Set', 'Out', 'Nov', 'Dez'];
    this.startMonthFilter = function(month) {
        this.dimensions.start_month.filterAll();
        
        if(month) {
            this.dimensions.start_month.filter(months);
        }
        
        var monthResults =  this.groups.start_month.all();
        if(+monthResults[0].key){
            monthResults = monthResults.map(element => {
                    var month = +element.key;
                    element.key = monthsNames[month];
                    return element;
                });

        }

        return monthResults;
    };

    this.carrierFilter = function() {
        return this.groups.carrier.all()
            .filter(d => { return d.value.count > 0; });
    };

    this.preTravelFilter = function() {
        debugger
        var a = this.groups.pre_travel.all();
        var b = a
            .map(element => {
                var i = +element.key;
                element.key = 30*i + ' - ' + 30 * (i+1); 
                return element;  
            })
        var c = b.filter(d => { return d.value.count > 0; });
        return c;
    };
}

