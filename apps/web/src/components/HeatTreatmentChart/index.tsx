import React, { useEffect, useRef, useState } from "react";
import * as d3 from "d3";

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
    "다음 단계",
    "최종 단계",
];

// 임의의 미래 데이터 생성
const futureDummyData: DataPoint[] = FullState.map((stage) => ({
    stage,
    value: Math.random() * 50 + 50 // 50~100 사이의 임의 값
}));

const HeatTreatmentChart: React.FC = () => {
    const [data, setData] = useState<DataPoint[]>([
        { stage: "온도 하강", value: 10 },
        { stage: "온도 유지", value: 30 },
        { stage: "승온 시작", value: 50 },
        { stage: "승온 완료", value: 90 },
        { stage: "티끌 정입", value: 90 },
        { stage: "정상화", value: 85 },
    ]);
    const [fullStages, setFullStages] = useState<string[]>(FullState);
    const svgRef = useRef<SVGSVGElement | null>(null);

    useEffect(() => {
        const timer = setTimeout(() => {
            if (data.length < fullStages.length) {
                const newData = [...data, futureDummyData[data.length]];
                setData(newData);
            } else {
                const randomNumber = Math.floor(Math.random() * 100);
                setData((pre) => [...pre, {stage: "정상화", value: randomNumber}]);
                setFullStages([...data.map((d) => d.stage), "다음 단계", "최종 단계"]);
            }
        }, 5000);

        return () => clearTimeout(timer);
    }, [data]);

    useEffect(() => {
        if (!svgRef.current) return;

        const svg = d3.select(svgRef.current);
        const width = 700;
        const height = 300;
        const margin = { top: 20, right: 20, bottom: 100, left: 20 };
        const chartWidth = width - margin.left - margin.right;

        svg.attr("width", width).attr("height", height);

        const x = d3
            .scaleLinear()
            .domain([0, fullStages.length - 1])
            .range([margin.left, width - margin.right]);

        const y = d3
            .scaleLinear()
            .domain([0, 100])
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

        // 그라데이션 정의
        const gradient = svg.select("defs").empty()
            ? svg
                .append("defs")
                .append("linearGradient")
                .attr("id", "area-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", margin.left)
                .attr("y1", 0)
                .attr("x2", width - margin.right)
                .attr("y2", 0)
            : svg
                .select("defs")
                .select("linearGradient")
                .attr("id", "area-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", margin.left)
                .attr("y1", 0)
                .attr("x2", width - margin.right)
                .attr("y2", 0);

        gradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(46, 204, 113, 0)");

        gradient
            .append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "rgba(46, 204, 113, 0)");

        gradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(46, 204, 113, 0.5)");

        // 라인 그라데이션 정의
        const lineGradient = svg.select("#line-gradient").empty()
            ? svg
                .append("defs")
                .append("linearGradient")
                .attr("id", "line-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", margin.left)
                .attr("y1", 0)
                .attr("x2", width - margin.right)
                .attr("y2", 0)
            : svg
                .select("#line-gradient")
                .attr("gradientUnits", "userSpaceOnUse")
                .attr("x1", margin.left)
                .attr("y1", 0)
                .attr("x2", width - margin.right)
                .attr("y2", 0);

        lineGradient
            .append("stop")
            .attr("offset", "0%")
            .attr("stop-color", "rgba(19, 242, 135, 1)");

        gradient
            .append("stop")
            .attr("offset", "50%")
            .attr("stop-color", "rgba(19, 242, 135, 1)");

        lineGradient
            .append("stop")
            .attr("offset", "100%")
            .attr("stop-color", "rgba(19, 242, 135, 1)");

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

        // 미래 데이터 라인 그리기
        const futureLine = svg.select<SVGPathElement>('.future-line').empty() ?
            svg.append('path').attr('class', 'future-line') :
            svg.select<SVGPathElement>('.future-line');

        futureLine
            .datum(futureDummyData)
            .attr('fill', 'none')
            .attr('stroke', '#aaa')
            .attr('stroke-width', 1)
            .attr('d', line);

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
    }, [data]);

    return <svg ref={svgRef}></svg>;
};

export default HeatTreatmentChart;