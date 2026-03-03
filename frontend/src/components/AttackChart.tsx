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
            foreColor: '#94a3b8',
            animations: {
                enabled: true,
                speed: 800,
                animateGradually: {
                    enabled: true,
                    delay: 150
                },
                dynamicAnimation: {
                    enabled: true,
                    speed: 350
                }
            },
            dropShadow: {
                enabled: true,
                blur: 10,
                opacity: 0.2
            }
        },
        labels: data.map(d => d.name),
        colors: [
            '#00f2ff', // Cyan
            '#7000ff', // Purple
            '#ff4d4d', // Red
            '#f97316', // Orange
            '#22c55e'  // Green
        ],
        stroke: {
            show: true,
            width: 2,
            colors: ['rgba(15, 23, 42, 0.8)']
        },
        legend: {
            position: 'bottom',
            fontFamily: 'inherit',
            fontWeight: 700,
            labels: {
                colors: '#94a3b8'
            },
            itemMargin: {
                horizontal: 10,
                vertical: 5
            }
        },
        dataLabels: {
            enabled: false,
        },
        plotOptions: {
            pie: {
                donut: {
                    size: '80%',
                    labels: {
                        show: true,
                        name: {
                            show: true,
                            fontSize: '11px',
                            fontWeight: 900,
                            color: '#64748b',
                            offsetY: -10
                        },
                        value: {
                            show: true,
                            fontSize: '24px',
                            fontWeight: 900,
                            color: '#ffffff',
                            offsetY: 10,
                            formatter: (val) => String(val)
                        },
                        total: {
                            show: true,
                            label: 'TOTAL EVENTS',
                            color: '#64748b',
                            fontSize: '9px',
                            fontWeight: 900,
                            formatter: (w) => {
                                return String(w.globals.seriesTotals.reduce((a: number, b: number) => a + b, 0))
                            }
                        }
                    }
                }
            }
        },
        tooltip: {
            theme: 'dark',
            style: {
                fontSize: '12px',
                fontFamily: 'inherit'
            },
            y: {
                formatter: (val) => `${val} detections`
            }
        }
    };

    const series = data.map(d => d.value);

    return (
        <div className="w-full h-full flex items-center justify-center fade-in-up">
            <Chart options={options} series={series} type="donut" width="100%" height="320" />
        </div>
    );
};

export default AttackChart;
