import React from 'react';
import ReactApexChart from 'react-apexcharts';

const MONTH_LABELS = ['Jan', 'Feb', 'Mar', 'Apr', 'May', 'Jun', 'Jul', 'Aug', 'Sep', 'Oct', 'Nov', 'Dec'];

const AudienceReviewChart = ({ series = [] }) => {
    const options = {
        chart: {
            type: 'bar',
            height: 270,
            width: '100%',
            stacked: true,
            toolbar: { show: false },
            zoom: { enabled: false },
            foreColor: '#646A71',
            fontFamily: 'DM Sans',
        },
        grid: {
            borderColor: 'var(--bs-gray-100)',
        },
        plotOptions: {
            bar: {
                horizontal: false,
                columnWidth: '45%',
                borderRadius: 5,
                borderRadiusApplication: 'end',
                borderRadiusWhenStacked: 'last',
            },
        },
        xaxis: {
            type: 'category',
            categories: MONTH_LABELS,
            labels: {
                style: { fontSize: '12px', fontFamily: 'inherit' },
            },
            axisBorder: { show: false },
            title: {
                style: { fontSize: '12px', fontFamily: 'inherit' },
            },
        },
        yaxis: {
            labels: {
                style: { fontSize: '12px', fontFamily: 'inherit' },
            },
            title: {
                style: { fontSize: '12px', fontFamily: 'inherit' },
            },
        },
        legend: {
            show: true,
            position: 'top',
            fontSize: '15px',
            labels: { colors: '#6f6f6f' },
            markers: { size: 5, shape: 'circle' },
            itemMargin: { vertical: 5 },
        },
        colors: ['#007D88', '#25cba1', '#6366f1'],
        fill: { opacity: 1 },
        dataLabels: { enabled: false },
        noData: {
            text: 'No contact data for this period',
            align: 'center',
            verticalAlign: 'middle',
            style: { color: '#9ca3af', fontSize: '14px' },
        },
    };

    return <ReactApexChart options={options} series={series} type="bar" height={270} />;
};

export default AudienceReviewChart;
