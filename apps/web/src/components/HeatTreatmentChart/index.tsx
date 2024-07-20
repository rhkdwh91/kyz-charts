import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

const datas = [
    { stage: "온도 하강", value: 40 },
    { stage: "온도 하강", value: 40 },
    { stage: "온도 하강", value: 30 },
    { stage: "온도 하강", value: 30 },
    { stage: "온도 유지", value: 30 },
    { stage: "온도 유지", value: 30 },
    { stage: "온도 유지", value: 30 },
    { stage: "온도 유지", value: 30 },
    { stage: "승온 시작", value: 50 },
    { stage: "승온 시작", value: 60 },
    { stage: "승온 시작", value: 60 },
    { stage: "승온 시작", value: 70 },
    { stage: "승온 완료", value: 70 },
    { stage: "티끌 정입", value: 80 },
    { stage: "정상화", value: 70 },
]

interface DataPoint {
    stage: string;
    value: number;
}

const FullState = [
    "온도 하강",
    "온도 유지",
    "승온 시작",
    "승온 완료",
    "티끌 정입",
    "정상화",
];

// 임의의 미래 데이터 생성
const futureDummyData: DataPoint[] = FullState.map((stage) => ({
    stage,
    value: Math.random() * 50 + 50 // 50~100 사이의 임의 값
}));

const HeatTreatmentChart: React.FC = () => {
    const [data, setData] = useState<DataPoint[]>([]);
    const [fullStages, setFullStages] = useState<string[]>(FullState);
    const svgRef = useRef<SVGSVGElement | null>(null);
    const svgRef2 = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.length === datas.length) return;
            setData((pre) => [...pre, datas[data.length]]);
            const findIndex = fullStages.findIndex((stage) => stage === data[data.length - 1].stage)
            const remainStages = findIndex !== -1 ? fullStages.slice(findIndex + 1) : []
            setFullStages([...data.map((d) => d.stage), ...remainStages]);
        }, 3000);

        return () => clearTimeout(timer);
    }, [data]);


    useEffect(() => {
        if (!svgRef2.current) return;

        const svg2 = d3.select(svgRef2.current);
        const width = 500;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 100, left: 20 };

        svg2.attr("width", width).attr("height", height);

        const x = d3
            .scaleLinear()
            .domain([0, fullStages.length - 1])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 120])
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line<DataPoint>()
            .x((_d, i) => x(i))
            .y((d) => y(d.value))
            .curve(d3.curveCardinal);

        // 라인 그래프 그리기
        const linePath = svg2.select<SVGPathElement>(".line-path").empty()
            ? svg2.append("path").attr("class", "line-path")
            : svg2.select<SVGPathElement>(".line-path");

        linePath
            .datum(futureDummyData)
            .attr("fill", "none")
            .attr("stroke", "#444")
            .attr("stroke-width", 1)
            .transition()
            .duration(1000)
            .attr("d", line);

    }, []);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = 500;
        const height = 200;
        const margin = { top: 20, right: 20, bottom: 100, left: 20 };
        const chartWidth = width - margin.left - margin.right;

        svg.attr("width", width).attr("height", height);

        const x = d3
            .scaleLinear()
            .domain([0, fullStages.length - 1])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 120])
            .range([height - margin.bottom, margin.top]);

        const line = d3
            .line<DataPoint>()
            .x((_d, i) => x(i))
            .y((d) => y(d.value))
            .curve(d3.curveCardinal);

        const area = d3
            .area<DataPoint>()
            .x((_d, i) => x(i))
            .y0(height - margin.bottom)
            .y1((d) => y(d.value))
            .curve(d3.curveCardinal);

        // 현재 데이터 좌측으로 rect
        const rect = svg.select<SVGRectElement>(".rect").empty()
            ? svg.append("rect").attr("class", "rect")
            : svg.select<SVGRectElement>("rect");

        rect
            .transition()
            .duration(1000)
            .attr('x', margin.left)
            .attr('y', margin.top)
            .attr('width', x(data.length - 1) - margin.left)
            .attr('height', height - margin.top - margin.bottom)
            .attr('fill', '#242424');  // 연한 녹색 배경

        if (data.length > 0) {

            // 그라데이션 정의
            const gradient = svg.select("defs").empty()
                ? svg
                    .append("defs")
                    .append("linearGradient")
                    .attr("id", "area-gradient")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", x(data.length - 2) - margin.left)
                    .attr("y1", 0)
                    .attr("x2", x(data.length - 1) - margin.left)
                    .attr("y2", 0)
                : svg
                    .select("defs")
                    .select("linearGradient")
                    .attr("id", "area-gradient")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", x(data.length - 2) - margin.left)
                    .attr("y1", 0)
                    .attr("x2", x(data.length - 1) - margin.left)
                    .attr("y2", 0);

            gradient
                .append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "rgba(46, 204, 113, 0)");

            gradient
                .append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "rgba(46, 204, 113, 0.05)");

            gradient
                .append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "rgba(46, 204, 113, 0.1)");

            // 라인 그라데이션 정의
            const lineGradient = svg.select("#line-gradient").empty()
                ? svg
                    .append("defs")
                    .append("linearGradient")
                    .attr("id", "line-gradient")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", margin.left)
                    .attr("y1", 0)
                    .attr("x2", x(data.length - 1) - margin.left)
                    .attr("y2", 0)
                : svg
                    .select("#line-gradient")
                    .attr("gradientUnits", "userSpaceOnUse")
                    .attr("x1", margin.left)
                    .attr("y1", 0)
                    .attr("x2", x(data.length - 1) - margin.left)
                    .attr("y2", 0);

            lineGradient
                .append("stop")
                .attr("offset", "0%")
                .attr("stop-color", "rgba(19, 242, 135, 0.01)");

            lineGradient
                .append("stop")
                .attr("offset", "50%")
                .attr("stop-color", "rgba(19, 242, 135, 1)");

            lineGradient
                .append("stop")
                .attr("offset", "100%")
                .attr("stop-color", "rgba(19, 242, 135, 0.01)");

            // 영역 그래프 그리기

            const areaPath = svg.select<SVGPathElement>(".area-path").empty()
                ? svg.append("path").attr("class", "area-path")
                : svg.select<SVGPathElement>(".area-path");

            areaPath
                .datum(data)
                .attr("fill", "url(#area-gradient)")
                .transition()
                .duration(1000)
                .attr("d", area);

            // 라인 그래프 그리기
            const linePath = svg.select<SVGPathElement>(".line-path").empty()
                ? svg.append("path").attr("class", "line-path")
                : svg.select<SVGPathElement>(".line-path");

            linePath
                .datum(data)
                .attr("fill", "none")
                .attr("stroke", "url(#line-gradient)")
                .attr("stroke-width", 1)
                .transition()
                .duration(1000)
                .attr("d", line);

            // 현재 데이터 포인트만 표시 (마지막 데이터)
            const currentData = data[data.length - 1];
            const dot = svg.select<SVGCircleElement>(".current-dot").empty()
                ? svg.append("circle").attr("class", "current-dot")
                : svg.select<SVGCircleElement>(".current-dot");

            dot
                .transition()
                .duration(1000)
                .attr("cx", x(data.length - 1))
                .attr("cy", y(currentData.value) - 20)
                .attr("r", 3)
                .attr("fill", "#2ecc71")
                .attr("stroke", "#2ecc71")
                .attr("stroke-width", 2);


            // 현재 데이터 세로선 표시
            const verticalLine = svg.select<SVGLineElement>(".vertical-line").empty()
                ? svg.append("line").attr("class", "vertical-line")
                : svg.select<SVGLineElement>(".vertical-line");

            verticalLine
                .transition()
                .duration(1000)
                .attr("x1", x(data.length - 1))
                .attr("y1", y(currentData.value) - 20)
                .attr("x2", x(data.length - 1))
                .attr("y2", height - margin.bottom)
                .attr("stroke", "#2ecc71")
                .attr("stroke-width", 1);
        }

        // 진행 바
        const progressBarHeight = 10;
        const progressBarY = height - margin.bottom;

        // 전체 바
        const fullBar = svg.select<SVGRectElement>(".full-bar").empty()
            ? svg.append("rect").attr("class", "full-bar")
            : svg.select<SVGRectElement>(".full-bar");

        fullBar
            .attr("x", margin.left)
            .attr("y", progressBarY)
            .attr("width", chartWidth)
            .attr("height", progressBarHeight)
            .attr("fill", "#e0e0e0");

        // 현재 진행 상태 바
        const progress = x(data.length - 1) - margin.left;

        const progressBar = svg.select<SVGRectElement>(".progress-bar").empty()
            ? svg.append("rect").attr("class", "progress-bar")
            : svg.select<SVGRectElement>(".progress-bar");

        progressBar
            .attr("x", margin.left)
            .attr("y", progressBarY)
            .transition()
            .duration(1000)
            .attr("width", progress)
            .attr("height", progressBarHeight)
            .attr("fill", "#2ecc71");


        //  스테이지 전체 바
        const stageFullBar = svg.select<SVGRectElement>(".stage-full-bar").empty()
            ? svg.append("rect").attr("class", "stage-full-bar")
            : svg.select<SVGRectElement>(".stage-full-bar");

        stageFullBar
            .datum(FullState)
            .attr("x", margin.left)
            .attr("y", progressBarY + progressBarHeight + 40)
            .attr("width", chartWidth)
            .attr("height", 1)
            .attr("fill", "#e0e0e0");

        const rectSize = 5;

        const stageScale = d3.scaleBand()
            .domain(FullState)
            .range([margin.left, (width + margin.left + margin.right) + (FullState.length * rectSize)])
            .padding(0);

        svg.selectAll('.stage-rect')
            .data(FullState)
            .join('rect')
            .attr('class', 'stage-rect')
            .attr('x', d => stageScale(d)!)
            .attr('y', progressBarY + progressBarHeight + 39)
            .attr('width', rectSize)
            .attr('height', rectSize)
            .attr('rx', (d) => (data.length > 0 && d === data[data.length - 1].stage) ? rectSize : 0)
            .attr('ry', (d) => (data.length > 0 && d === data[data.length - 1].stage) ? rectSize : 0)
            .attr('fill', (d) => (data.length > 0 && d === data[data.length - 1].stage) ? '#2ecc71' : '#e0e0e0');

        const stageLabelScale = d3.scaleBand()
            .domain(FullState)
            .range([margin.left + 17, (width + margin.left + margin.right) + (FullState.length * rectSize) - 10])
            .padding(0);

        svg.selectAll('.stage-label')
            .data(FullState)
            .join('text')
            .attr('class', 'stage-label')
            .attr('x', d => stageLabelScale(d) ?? 0)
            .attr('y', progressBarY + progressBarHeight + 30)
            .attr('text-anchor', 'middle')
            .attr('font-size', '10px')
            .attr('fill', '#fff')
            .text(d => d);

        // 현재 스테이지 그라데이션 추가
        if (data.length > 0) {
            const currentStage = data[data.length - 1].stage;
            const nextStageIndex = FullState.findIndex((stage) => stage === data[data.length - 1].stage) + 1
            const nextStage = FullState[nextStageIndex]
            const stageRect = svg.select<SVGRectElement>(".stage-guide-line").empty()
                ? svg.append("rect").attr("class", "stage-guide-line")
                : svg.select<SVGRectElement>(".stage-guide-line");
            if (nextStage && stageRect) {
                stageRect
                    .attr('x', (stageScale(currentStage) ?? 0))
                    .attr('y', progressBarY + progressBarHeight + 40)
                    .attr('width', 50)
                    .attr('height', 1)
                    .attr('fill', `#00dd6d`)
                    .transition()
                    .duration(3000);
            } else {
                stageRect.remove()
            }
        }

    }, [data]);


    return <main><svg ref={svgRef} style={{ position: "absolute" }}></svg><svg ref={svgRef2}></svg></main>;
};

export default HeatTreatmentChart;