const padding = {
  left: 35,
  right: 35,
  top: 40,
  bottom: 135
};
function drawPie(radius = 250) {
  let bounds = document.getElementById("pie").getBoundingClientRect();
  const width = bounds.width,
    height = bounds.height;
  const pie = d3
    .select("#pie")
    .append("svg")
    .attr("id", "svg-pie")
    .attr("width", width + padding.left + padding.right)
    .attr("height", height + padding.top + padding.bottom);
  $.ajax({
    method: "get",
    url: "/expence"
  }).done(data => {
    let types = getTypeArr();
    let values = types.map(el => 0);
    let colors = getRandomColors();
    let total = 0;
    data.forEach(el => {
      let i = types.indexOf(el.type);
      if (i > -1) {
        total += Number.parseFloat(el.amount);
        if (values[i]) values[i] += Number.parseFloat(el.amount);
        else values[i] = Number.parseFloat(el.amount);
      }
    });
    //console.log(types, colors, values);
    let start = 0;
    let arc = d3.arc();
    pie
      .append("g")
      .attr("transform", `translate(${width / 2},${height / 2 + 10})`)
      .selectAll("path")
      .data(d3.pie()(values))
      .enter()
      .append("path")
      .attr("d", (data, index) => {
        let d = arc({
          innerRadius: 0,
          outerRadius: radius,
          startAngle: data.startAngle,
          endAngle: data.endAngle
        });
        return d;
      })
      .attr("stroke", "#000")
      .attr("fill", (data, index) => {
        return colors[index];
      });

    //Adding legend
    const rw = 25,
      rh = 25;
    let legend = pie
      .append("g")
      .attr("transform", `translate(${padding.left},${height})`);
    legend
      .selectAll("rect")
      .data(values)
      .enter()
      .append("rect")
      .attr("x", (v, i) => {
        return (i % 3) * 120;
      })
      .attr("y", (v, i) => {
        return Math.floor(i / 3) * 30;
      })
      .attr("width", rw)
      .attr("height", rh)
      .attr("fill", (v, i) => colors[i]);

    legend
      .selectAll("text")
      .data(types)
      .enter()
      .append("text")
      .text(d => d)
      .attr(
        "transform",
        (d, i) =>
          `translate(${(i % 3) * 120 + rw + 5},${Math.floor(i / 3) * 30 + rh})`
      );
    pie
      .append("text")
      .text("Pie-chart showing expenses in different categories")
      .attr("transform", `translate(${padding.left},${padding.top})`)
      .style("font-size", 24 + "px");
  });
}

function getTypeArr() {
  let a = $("#type").children();
  let res = [];
  for (let i = 0; i < a.length; i++) {
    res.push(a[i].value);
  }
  return res;
}

function getRandomColors() {
  let res = ["#ffbb00", "#0000dd", "#d000d0", "#334455", "#00f0d0"];
  return res;
}

function drawScatter() {
  let bounds = document.getElementById("scatter").getBoundingClientRect();
  const width = bounds.width,
    height = bounds.height;

  const scat = d3
    .select("#scatter")
    .append("svg")
    .attr("id", "scat")
    .attr("width", width + padding.left + padding.right)
    .attr("height", height + padding.top + padding.bottom);
  $.ajax({
    method: "get",
    url: "/expence"
  }).done(data => {
    let types = getTypeArr();
    let colors = getRandomColors();
    let values = types.map(el => []);
    let dates = types.map(el => []);
    let timeFormat = d3.timeFormat("%e %b %Y");
    //console.log(timeFormat(new Date()));

    data.forEach(el => {
      let i = types.indexOf(el.type);
      if (i > -1) {
        values[i].push(Number.parseFloat(el.amount));
        dates[i].push(Date.parse(el.date));
      }
    });
    //console.table(values);
    //console.table(dates);

    // Y axis declaration

    const yScale = d3
      .scaleLinear()
      .domain([0, d3.max(values, el => d3.max(el)) * 1.4])
      .range([height - padding.top, padding.top]);

    const yAxis = d3.axisLeft(yScale);
    scat
      .append("g")
      .attr("id", "y-value-scale")
      .attr("transform", `translate(${padding.left},0 )`)
      .call(yAxis);

    // X axis declaration
    const xScale = d3
      .scaleTime()
      .domain([
        d3.min(dates, el => d3.min(el)) - 10000000,
        d3.max(dates, el => d3.max(el)) + 100000000
      ])
      .rangeRound([padding.left, width - padding.right]);
    //    console.log(d3.min(dates, el => d3.min(el)));

    //  console.log(xScale.domain());

    const xAxis = d3.axisBottom(xScale).tickFormat(timeFormat);
    scat
      .append("g")
      .attr("id", "x-value-scale")
      .attr("transform", `translate(0,${height - padding.top})`)
      .call(xAxis)
      .selectAll("text")
      .style("text-anchor", "end")
      .attr("dx", "-.8em")
      .attr("dy", ".15em")
      .attr("transform", "rotate(-90)");

    const g = scat
      .append("g")
      .attr("id", "main-area")
      .attr("transform", `translate(${padding.left},${0})`);
    //Adding points
    values.forEach((valueArr, index) => {
      let data = [];
      let localDates = dates[index];
      let color = colors[index];
      if (valueArr.length > 1) {
        valueArr.forEach((value, i) => {
          data.push({
            value: value,
            date: localDates[i]
          });
        });
        data.sort((a, b) => b.date - a.date);
        let line = d3
          .line()
          .x(d => xScale(d.date))
          .y(d => yScale(d.value));

        //console.log(line(data));

        g.append("path")
          .datum(data)
          .attr("fill", "none")
          .attr("stroke", color)
          .attr("stroke-linejoin", "round")
          .attr("stroke-linecap", "round")
          .attr("stroke-width", 1.5)
          .attr("d", line);
      } else if (valueArr[0]) {
        console.log(localDates[0], xScale(localDates[0]));

        g.append("circle")
          .attr("fill", color)
          .attr("stroke", color)
          .attr("r", 5)
          .attr("cx", xScale(localDates[0]))
          .attr("cy", yScale(valueArr[0]));
      }
    });
    scat
      .append("text")
      .text("Linegraph showing expenses in different categories over time")
      .attr("transform", `translate(${padding.left + 150},${padding.top})`)
      .style("font-size", 30 + "px");
  });
}
