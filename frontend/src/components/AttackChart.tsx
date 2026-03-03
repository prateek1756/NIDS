import React from 'react';
import Chart from 'react-apexcharts';

interface AttackChartProps {
    data: { name: string; value: number }[];
}

const AttackChart: React.FC<AttackChartProps> = ({ data }) => {
    const options: ApexCharts.ApexOptions = {
        chart: {
            type: 'donut',
            background: 'transparent',
            foreColor: 'var(--text-secondary)',
        },
        labels: data.map(d => d.name),
        colors: ['#ff4d4d', '#ffb84d', '#7000ff', '#00f2ff', '#4dff88'],
        stroke: {
            show: false,
        },
        legend: {
            position: 'bottom',
        },
        dataLabels: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '75%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '14px',
                            fontWeight: 600,
                        },
                        value: {
                            show: true,
                            fontSize: '20px',
                            fontWeight: 700,
                            color: 'var(--text-primary)',
                        },
                        total: {
                            show: true,
                            label: 'Total',
                            color: 'var(--text-secondary)',
                        }
                    }
                }
            }
        },
        tooltip: {
            theme: 'dark',
        }
    };

    const series = data.map(d => d.value);

    return (
        <div className="w-full h-full">
            <Chart options={options} series={series} type="donut" width="100%" height="100%" />
        </div>
    );
};

export default AttackChart;
