import React, { memo, useEffect } from 'react'
import * as d3 from 'd3'

const drawChart = (id) => {
    //const w = 400
    const h = 200

    const data = Array.from({length: 6}, () => Math.floor(Math.random() * 15));;
    
    const svg = d3.select("#" + id)
                    .append("svg")
                    .attr("preserveAspectRatio", "xMinYMin meet")
                    .attr("viewBox", "0 0 400 200")
                    // .style("margin-left", 100);
                  
    svg.selectAll("rect")
      .data(data)
      .enter()
      .append("rect")
      .attr("x", (d, i) => i * 70)
      .attr("y", (d, i) => h - 10 * d)
      .attr("width", 65)
      .attr("height", (d, i) => d * 10)
      .attr("fill", "green")
    
    svg.selectAll("text")
      .data(data)
      .enter()
      .append("text")
      .text((d) => d)
      .attr('fill', 'white')
      .attr('text-anchor', 'middle')
      .attr('alignment-baseline', 'hanging')
      .attr("x", (d, i) => (i * 70) + 32.5)
      .attr("y", (d, i) => h - (10 * d) -12)
}

const BarChart = (props) =>{
    // return drawChart()

    // const [count, setCount] = useState(0);

    // Similar to componentDidMount and componentDidUpdate:
    useEffect(() => {
      drawChart(props.id)
    }, [props.id]); // Executes only once after didMount()
  
    return (
        <div id={"" + props.id}></div>
    );
}

export const BarWidget = memo( function BarWidgetInner({ wid }: { wid: string }) {
    return (
      <div
        data-wid={wid}
        style={{
          width: '100%',
          height: '100%',
          padding: '10px'
        }}
      >
        <BarChart id = {wid}> </BarChart>
      </div>
    )
  })