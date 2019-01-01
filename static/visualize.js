
var config = {
    type: 'doughnut',
    data: {
        datasets: [{
            data: [],
            backgroundColor: [
                window.chartColors.red,
                window.chartColors.blue,
                window.chartColors.green,
                window.chartColors.yellow,
                window.chartColors.orange
            ],
            label: 'Dataset 1'
        }],
        labels: [
            'Sports',
            'Politics',
            'Entertainment',
            'Art',
            'Education'
        ]
    },
    options: {
        responsive: true,
        legend: {
            position: 'top',
        },
        title: {
            display: true,
            text: 'Tweets Topics Chart'
        },
        animation: {
            animateScale: true,
            animateRotate: true
        }
    }
};

document.getElementById('changeCircleSize').addEventListener('click', function() {
    if (window.myDoughnut.options.circumference === Math.PI) {
        window.myDoughnut.options.circumference = 2 * Math.PI;
        window.myDoughnut.options.rotation = -Math.PI / 2;
    } else {
        window.myDoughnut.options.circumference = Math.PI;
        window.myDoughnut.options.rotation = -Math.PI;
    }

    window.myDoughnut.update();
});

var color = Chart.helpers.color;
var barChartData = {
    labels: [1,2,3,4,5],
    datasets: [{
        label: 'Sport Tweets',
        backgroundColor: color(window.chartColors.red).alpha(0.5).rgbString(),
        borderWidth: 1,
        data: []
    }, {
        label: 'Politics Tweets',
        backgroundColor: color(window.chartColors.blue).alpha(0.5).rgbString(),
        borderWidth: 1,
        data: []
    }, {
        label: 'Entertainment Tweets',
        backgroundColor: color(window.chartColors.green).alpha(0.5).rgbString(),
        borderWidth: 1,
        data: []
    }, {
        label: 'Art Tweets',
        backgroundColor: color(window.chartColors.orange).alpha(0.5).rgbString(),
        borderWidth: 1,
        data: []
    }, {
        label: 'Education Tweets',
        backgroundColor: color(window.chartColors.grey).alpha(0.5).rgbString(),
        borderWidth: 1,
        data: []
    }]

};

var lineChartData = {
    labels: [],
    datasets: [{
        label: 'Sport Tweets',
        borderColor: window.chartColors.green,
        backgroundColor: window.chartColors.green,
        fill: false,
        data: [],
        yAxisID: 'y-axis-1',
    }, {
        label: 'Politics Tweets',
        borderColor: window.chartColors.blue,
        backgroundColor: window.chartColors.blue,
        fill: false,
        data: [],
        yAxisID: 'y-axis-2'
    }, {
        label: 'Entertainment Tweets',
        borderColor: window.chartColors.red,
        backgroundColor: window.chartColors.red,
        fill: false,
        data: [],
        yAxisID: 'y-axis-3'
    }, {
        label: 'Art Tweets',
        borderColor: window.chartColors.orange,
        backgroundColor: window.chartColors.orange,
        fill: false,
        data: [],
        yAxisID: 'y-axis-4'
    }, {
        label: 'Education Tweets',
        borderColor: window.chartColors.black,
        backgroundColor: window.chartColors.black,
        fill: false,
        data: [],
        yAxisID: 'y-axis-5'
    }]
};

window.onload = function() {
    var ctx1 = document.getElementById('chart-area').getContext('2d');
    window.myDoughnut = new Chart(ctx1, config);
    var ctx2 = document.getElementById('canvas2').getContext('2d');
    window.myBar = new Chart(ctx2, {
        type: 'bar',
        data: barChartData,
        options: {
            responsive: true,
            legend: {
                position: 'top',
            },
            title: {
                display: true,
                text: 'Tweets per Time Intervals'
            }
        }
    });
    updateCharts();
    setInterval(updateCharts,6000);
};

function updateCharts(){
    $.getJSON('/refresh', {}, function(data) {
        var sp_data = [];
        var po_data = [];
        var en_data = [];
        var ar_data = [];
        var ed_data = [];
        var sp_count = 0;
        var po_count = 0;
        var en_count = 0;
        var ar_count = 0;
        var ed_count = 0;
        var size = 0;
        var json_data = JSON.parse(data).slice(-100);
        json_data.forEach(function(obj) {
            for (var key in obj) {
                if (obj.hasOwnProperty(key)) {
                    var obj_data = obj[key][0].split(",");
                    sp_data.push(parseInt(obj_data[3]));
                    po_data.push(parseInt(obj_data[0]));
                    en_data.push(parseInt(obj_data[4]));
                    ar_data.push(parseInt(obj_data[1]));
                    ed_data.push(parseInt(obj_data[2]));
                    sp_count += parseInt(obj_data[3]);
                    po_count += parseInt(obj_data[0]);
                    en_count += parseInt(obj_data[4]);
                    ar_count += parseInt(obj_data[1]);
                    ed_count += parseInt(obj_data[2]);
                    size++;
                    while (size > 5){
                        sp_data= sp_data.slice(-5);
                        po_data= po_data.slice(-5);
                        en_data= en_data.slice(-5);
                        ar_data= ar_data.slice(-5);
                        ed_data= ed_data.slice(-5);
                        size=5;
                    }
                }
            }
        });
        window.myBar.data.datasets[0].data = sp_data;
        window.myBar.data.datasets[1].data = po_data;
        window.myBar.data.datasets[2].data = en_data;
        window.myBar.data.datasets[3].data = ar_data;
        window.myBar.data.datasets[4].data = ed_data;
        window.myBar.update();
        window.myDoughnut.data.datasets[0].data = [sp_count,po_count,en_count,ar_count,ed_count];
        window.myDoughnut.update();
    });
}