function Chart(trips){

    this.charts = {};
    
    this.createRowChart = function(id, data, onclick) {
        var heightScale = d3.scale.linear().domain([1,15]).range([100,350]);
        this.charts[id] = c3.generate({
            bindto: '#'+ id,
            data: {
                json: data,
                type: 'bar',
                keys: {
                    x: 'key',
                    value: ['value.avg'],
                },
                onclick: onclick,
            },
            bar: {
                width: {
                    ratio: 0.5 
                },
                // width: 10
            },
            axis: {
                x: {
                    type: 'category'
                },
                rotated: true,
                y: {
                    tick: {
                        count: 5,
                        format: d3.format('.2f')
                    }
                }
            },
            size: {
                height: heightScale(data.length > 15 ? 15 : data.length),
                width: 250
            },
        });
    };

    this.createBarChart = function(id,data){
        this.charts[id] = c3.generate({
            bindto: '#'+ id,
            data: {
                json: data,
                type: 'bar',
                keys: {
                    x: 'key',
                    value: ['value.avg'],
                }
            },
            bar: {
                width: {
                    ratio: 0.5 
                },
                // width: 10
            },
            axis: {
                x: {
                    type: 'category'
                },
                y: {
                    tick: {
                        count: 5,
                        format: d3.format('.2f')
                    }
                }
            },
            size: {
                height: 200,
                width: 250
            },
        });
    };

    this.typeChart = function(type) {
        trips.typeFilter(type);
        if(d3.selectAll('#topDestination svg')){
            d3.selectAll('#topDestination svg').remove();
        }
        var destinations = destinationData();
        this.createRowChart('topDestination', destinations);
    };

    this.destinationCharts = function(origin){
        trips.originFilter(origin);
        this.typeChart();
    }

    function destinationData(){
        var destinations = trips.destinationsFilter()
            .filter(d => { return d.value.count > 0; });

        if(destinations.length > 15) {
            destinations = destinations.slice(destinations.length - 15, destinations.length);
        }
        destinations.sort((a,b) => { return a.value.avg - b.value.avg; });
        return destinations;
    }

    this.travelCharts = function(destination, month) {
        
        trips.destinationsFilter(destination);
        trips.typeFilter();

        // var postWday = trips.postWdayFilter();
        // this.createRowChart('post-wday', postWday);

        var startWday = trips.startWdayFilter();
        this.createRowChart('start-wday', startWday);

        var startMonth = trips.startMonthFilter(month);
        this.createRowChart('start-month', startMonth);

        var preTravel = trips.preTravelFilter();
        this.createRowChart('pre-travel', preTravel);

        // var carrier = trips.carrierFilter();
        // this.createRowChart('carrier', carrier);

        document.getElementById("destinantion-tab").className = 'nav-link';
        document.getElementById("destinantionTab").className = 'tab-pane fade';
        document.getElementById("travel-tab").className = 'nav-link active';
        document.getElementById("travelTab").className = 'tab-pane fade active show';
        
    };

    this.viewComparationChart = function() {
        document.getElementById("travel-tab").className = 'nav-link';
        document.getElementById("travelTab").className = 'tab-pane fade';
        document.getElementById("compare-tab").className = 'nav-link active';
        document.getElementById("compareTab").className = 'tab-pane fade active show';
    }

    function recreateMonthChart(d, i) {
        console.log('aqui')
        months = ["Janeiro","Fevereiro","Marco","Abril","Maio","Junho",
        "Julho","Agosto","Septembro","Outubro","Novembro","Dezembro"];
        
        d3.selectAll('#post-wday svg').remove();
        d3.selectAll('#start-wday svg').remove();
        d3.selectAll('#start-month svg').remove();
        d3.selectAll('#pre-travel svg').remove();
        d3.selectAll('#carrier svg').remove();
        
        charts.travelCharts(trips.filter.destination, months[d.index+1]);
    }

    this.cleanTravelTap = function(){
        d3.selectAll('#post-wday svg').remove();
        d3.selectAll('#start-wday svg').remove();
        d3.selectAll('#start-month svg').remove();
        d3.selectAll('#pre-travel svg').remove();
        d3.selectAll('#carrier svg').remove();
    }

    this.comparationData = {destinies: [], data: [], chat: null};
    this.comparation = function(destination) {
        if (destination && !this.comparationData.destinies.includes(destination)) {
            this.comparationData.destinies.push(destination);
            trips.destinationsFilter(destination)
            var newData = trips.startMonthFilter()
            this.comparationData.data = organizeComparationData(newData, this.comparationData.data, destination);
            if (this.comparationData.destinies[0]) {
                d3.selectAll('#comparation svg').remove();
                this.comparationData.chart = comparationChart('comparation',this.comparationData.data);
            } else {
                this.comparationData.chart = comparationChart('comparation',this.comparationData.data);
            }
        } else {
            this.comparationData.chart = comparationChart('comparation',this.comparationData.data);
        }
    }

    function organizeComparationData(data, comparation, destination) {
        data.forEach(element => {
            var achou = false;
            comparation.forEach(element2 => {
                if(element.key == element2.month){
                    achou = true;
                    element2[destination] = element.value.avg;
                }
            });
            if(!achou) {
                var compa = {};
                compa.month = element.key;
                compa[destination] = element.value.avg;
                comparation.push(compa);
            }
        });
        return comparation;
    }

    function comparationChart(id,data){
        c3.generate({
            bindto: '#'+ id,
            data: {
                json: data,
                type: 'bar',
                keys: {
                    x: 'month',
                    value: Object.keys(data[0]).filter(d => d != 'month'),
                },
            },
            bar: {
                width: {
                    ratio: 0.5 
                },
                // width: 10
            },
            axis: {
                x: {
                    type: 'category'
                },
                rotated: true,
                y: {
                    tick: {
                        count: 5,
                        format: d3.format('.2f')
                    }
                }
            },
            size: {
                height: 600,
                width: 250
            },
        });
    }

    this.removeComparation = function(destinantion) {
        var indexRemove = this.comparationData.destinies.indexOf(destinantion);
        this.comparationData.destinies.splice(indexRemove,1);
        this.comparationData.data.forEach(element => {
            delete element[destinantion];
        });
    };
}
