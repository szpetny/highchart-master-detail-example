$(function () {
    //$.getJSON('test-long.json', function (data) {
    $.ajax({url: 'url', 
        type: 'GET',
        dataType: "json", 
        crossOrigin: true,
        error: function(data) {
            console.log(data);
            alert(data);
        },
        success: function (data) {
            var detailChart, masterChart;

            var selectMasterChartPart = function (event) {
                                var  detailData = [],
                                     detailErrorData = [];

                                if (event.xAxis) {
                                    var extremesObject = event.xAxis[0],
                                        min = extremesObject.min,
                                        max = extremesObject.max,
                                        xAxis = this.xAxis[0];

                                 $.ajax({url: 'url?min='+min+'&max='+max, 
                                    type: 'GET',
                                    dataType: "json", 
                                    crossOrigin: true,
                                     success: function (details) {
                                        // move the plot bands to reflect the new detail span
                                        detailData = details[0];
                                        detailErrorData = details[1];
                                        xAxis.removePlotBand('mask-before');
                                        xAxis.addPlotBand({
                                            id: 'mask-before',
                                            from: data[0][0][0],
                                            to: min,
                                            color: 'rgba(0, 0, 0, 0.2)'
                                        });

                                        xAxis.removePlotBand('mask-after');
                                        xAxis.addPlotBand({
                                            id: 'mask-after',
                                            from: max,
                                            to: data[0][data[0].length - 1][0],
                                            color: 'rgba(0, 0, 0, 0.2)'
                                        });


                                        detailChart.series[0].setData(detailData);
                                        detailChart.series[1].setData(detailErrorData);

                                        detailChart.xAxis[0].setExtremes(min,max);

                                        return false;
                                     }});
                                } else {
                                    var xAxis = event.target.axes[0];
                                     xAxis.removePlotBand('mask-before');
                                     xAxis.removePlotBand('mask-after');
                                     xAxis.addPlotBand({
                                            id: 'mask-before',
                                            from: this.series[0].data[0].x,
                                            to: this.series[0].data[this.series[0].data.length - 1].x,
                                            color: 'rgba(0, 0, 0, 0.2)'
                                     });

                                      $.each(this.series[0].data, function () {
                                           detailData.push([this.x,this.y]);
                                        });

                                       $.each(this.series[1].data, function () {
                                            detailErrorData.push([this.x,this.low,this.high]);
                                        });

                                      detailChart.series[0].setData(detailData);
                                      detailChart.series[1].setData(detailErrorData);
                                      detailChart.xAxis[0].setExtremes(null,null);
                                }
                            };

            var selectDetailChartPart = function (event) {
                                var  detailData = [],
                                     detailErrorData = [];

                                if (event.xAxis) {
                                    var extremesObject = event.xAxis[0],
                                        min = extremesObject.min,
                                        max = extremesObject.max,
                                        xAxis = this.xAxis[0];

                                 $.ajax({url: 'url?min='+min+'&max='+max, 
                                    type: 'GET',
                                    dataType: "json", 
                                    crossOrigin: true,
                                     success: function (details) {
                                        // move the plot bands to reflect the new detail span
                                        detailData = details[0];
                                        detailErrorData = details[1];

                                        masterChart.xAxis[0].removePlotBand('mask-before');
                                        masterChart.xAxis[0].addPlotBand({
                                            id: 'mask-before',
                                            from: masterChart.series[0].data[0].x,
                                            to: detailData[0][0],
                                            color: 'rgba(0, 0, 0, 0.2)'
                                        });

                                        masterChart.xAxis[0].removePlotBand('mask-after');
                                        masterChart.xAxis[0].addPlotBand({
                                            id: 'mask-after',
                                            from: detailData[detailData.length - 1][0],
                                            to: masterChart.series[0].data[masterChart.series[0].data.length-1].x,
                                            color: 'rgba(0, 0, 0, 0.2)'
                                        });

                                        detailChart.series[0].setData(detailData);
                                        detailChart.series[1].setData(detailErrorData);

                                        detailChart.xAxis[0].setExtremes(min,max);

                                        return false;
                                     }});
                                } else {
                                    var xAxis = event.target.axes[0];

                                      $.each(masterChart.series[0].data, function () {
                                           detailData.push([this.x,this.y]);
                                        });

                                       $.each(masterChart.series[1].data, function () {
                                            detailErrorData.push([this.x,this.low,this.high]);
                                        });

                                      detailChart.series[0].setData(detailData);
                                      detailChart.series[1].setData(detailErrorData);
                                      detailChart.xAxis[0].setExtremes(null,null);
                                      //masterChart
                                      masterChart.xAxis[0].removePlotBand('mask-before');
                                      masterChart.xAxis[0].removePlotBand('mask-after');
                                      masterChart.xAxis[0].addPlotBand({
                                            id: 'mask-before',
                                            from: masterChart.series[0].data[0].x,
                                            to: masterChart.series[0].data[this.series[0].data.length - 1].x,
                                            color: 'rgba(0, 0, 0, 0.2)'
                                     });
                                }
                            };

             // create the detail chart
            function createDetail(masterChart) {

                var detailData = data[0],
                    detailErrorData = data[1],
                    detailStart = data[0][0][0];

                // create a detail chart referenced by a global variable
                detailChart = Highcharts.chart('detail-container', {
                    chart: {
                        marginBottom: 120,
                        reflow: false,
                        marginLeft: 50,
                        marginRight: 20,
                        style: {
                            position: 'absolute'
                        },
                        zoomType: 'x',
                        events: {

                            // listen to the selection event on the master chart to update the
                            // extremes of the detail chart
                            selection: selectDetailChartPart
                        }
                    },
                    credits: {
                        enabled: false
                    },
                    title: {
                        text: 'THE CZART'
                    },
                    yAxis: {
                        minRange: 0.1
                    },
                    legend: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            enableMouseTracking: false
                        }
                    },
                    series: [{
                        name: 'FLUX',
                        type: 'spline',
                        pointStart: detailStart,
                        data: detailData,
                        color: 'rgb(0,0,0)'
                    }, {
                        name: 'ERROR',
                        type: 'errorbar',
                        data: detailErrorData,
                        pointStart: detailStart,
                        color: 'rgb(124,181,236)'
                    }],
                     tooltip: {
                        enabled: false,
                        shared: false
                    },
                    exporting: {
                        enabled: false
                    }
                }); // return chart
            }

            // create the master chart
            function createMaster() {
                masterChart = Highcharts.chart('master-container', {
                    chart: {
                        reflow: false,
                        borderWidth: 0,
                        backgroundColor: null,
                        marginLeft: 50,
                        marginRight: 20,
                        zoomType: 'x',
                        events: {

                            // listen to the selection event on the master chart to update the
                            // extremes of the detail chart
                            selection: selectMasterChartPart
                        }
                    },
                    title: {
                        text: null
                    },
                    xAxis: {
                        minRange: data[0][data[0].length-1][0], 
                        min: data[0][0][0],
                        max: data[0][data[0].length-1][0],
                        plotBands: [{
                            id: 'mask-before',
                            from: data[0][0][0],
                            to: data[0][data[0].length - 1][0],
                            color: 'rgba(0, 0, 0, 0.2)'
                        }],
                        title: {
                            text: null
                        }
                    },
                    yAxis: {
                        gridLineWidth: 0,
                        labels: {
                            enabled: false
                        },
                        title: {
                            text: null
                        },
                        min: 0.6,
                        showFirstLabel: false
                    },
                    tooltip: {
                        formatter: function () {
                            return false;
                        }
                    },
                    legend: {
                        enabled: false
                    },
                    credits: {
                        enabled: false
                    },
                    plotOptions: {
                        series: {
                            fillColor: {
                                linearGradient: [0, 0, 0, 70],
                                stops: [
                                    [0, Highcharts.getOptions().colors[0]],
                                    [1, 'rgba(255,255,255,0)']
                                ]
                            },
                            lineWidth: 1,
                            shadow: false,
                            enableMouseTracking: false
                        }
                    },

                    series: [{
                        type: 'area',
                        name: 'WAVE',
                        pointStart: data[0][0][0],
                        data: data[0]
                    },{
                        name: 'ERROR',
                        type: 'errorbar',
                        visible: false,
                        data: data[1],
                        pointStart: data[0][0][0]
                    }],

                    exporting: {
                        enabled: false
                    }

                }, function (masterChart) {
                    createDetail(masterChart);
                }); // return chart instance
            }

            // make the container smaller and add a second container for the master chart
            var $container = $('#container')
                .css('position', 'relative');

            $('<div id="detail-container">')
                .appendTo($container);

            $('<div id="master-container">')
                .css({
                    position: 'absolute',
                    top: 300,
                    height: 100,
                    width: '100%'
                })
                    .appendTo($container);

            // create master and in its callback, create the detail chart
            createMaster();
        }
    });
});
