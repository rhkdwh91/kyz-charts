interface EnergyData {
    today: number;
    total: number;
    totalDate: string;
}

type ChartType = 'circle' | 'bar';

interface EnergyChartProps {
    data: EnergyData;
    type: ChartType;
}

import React, { useEffect, useRef } from 'react';
import * as d3 from 'd3';

const EnergyChart: React.FC<EnergyChartProps> = ({ data, type }) => {
    const chartRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        if (chartRef.current) {
            d3.select(chartRef.current).selectAll('*').remove();
            if (type === 'circle') {
                drawCircleChart();
            } else {
                drawBarChart();
            }
        }
    }, [data, type]);

    const drawCircleChart = () => {
        const svg = d3.select(chartRef.current);
        const width = 300;
        const height = 300;
        const radius = Math.min(width, height) / 2;

        svg.attr('width', width).attr('height', height);

        const g = svg.append('g')
            .attr('transform', `translate(${width / 2},${height / 2})`);

        const arc = d3.arc<any>()
            .innerRadius(radius * 0.8)
            .outerRadius(radius);

        const pie = d3.pie<number>()
            .value(d => d)
            .sort(null);

        g.selectAll('path')
            .data(pie([data.today, data.total - data.today]))
            .enter().append('path')
            .attr('d', arc as any)
            .attr('fill', (_d, i) => i === 0 ? '#ff6b6b' : '#4a4a4a');

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '-1em')
            .text('Today')
            .style('fill', 'white');

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '1em')
            .text(`${data.today}kWh`)
            .style('fill', 'white')
            .style('font-size', '24px');

        g.append('text')
            .attr('text-anchor', 'middle')
            .attr('dy', '3em')
            .text(`Total: ${data.total}kWh`)
            .style('fill', '#888')
            .style('font-size', '14px');
    };

    const drawBarChart = () => {
        const svg = d3.select(chartRef.current);
        const width = 300;
        const height = 150;

        svg.attr('width', width).attr('height', height);

        const g = svg.append('g')
            .attr('transform', 'translate(10,10)');

        const xScale = d3.scaleLinear()
            .domain([0, data.total])
            .range([0, width - 20]);

        g.append('rect')
            .attr('width', xScale(data.today))
            .attr('height', 20)
            .attr('fill', '#ff6b6b');

        g.append('rect')
            .attr('width', width - 20)
            .attr('height', 20)
            .attr('y', 40)
            .attr('fill', '#4a4a4a');

        g.append('text')
            .attr('x', 0)
            .attr('y', -5)
            .text('Today')
            .style('fill', 'white');

        g.append('text')
            .attr('x', 0)
            .attr('y', 15)
            .text(`${data.today}kWh`)
            .style('fill', 'white');

        g.append('text')
            .attr('x', 0)
            .attr('y', 35)
            .text('Total')
            .style('fill', 'white');

        g.append('text')
            .attr('x', 0)
            .attr('y', 55)
            .text(`${data.total}kWh`)
            .style('fill', 'white');
    };

    return (
        <div className="energy-chart">
            <h2>전기 사용량</h2>
            <svg ref={chartRef}></svg>
            <p>*Total : {data.totalDate} ~ 현재 기준</p>
        </div>
    );
};

export default EnergyChart;