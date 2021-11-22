// example 1
// set the dimensions and margins of the graph
const margin = { top: 20, right: 30, bottom: 55, left: 70 },
	width = document.querySelector("body").clientWidth,
	height = 500;

const svg_1 = d3.select("#d3_demo_1").attr("viewBox", [0, 0, width, height]);

// add title
svg_1
	.append("text")
	.attr("x", width / 2)
	.attr("y", margin.top + 2)
	.attr("text-anchor", "middle")
	.style("font-size", "22px")
	.style("text-decoration", "underline")
	.text("Nigeria States Population");

const x_scale = d3
	.scaleBand()
	.range([margin.left, width - margin.right])
	.padding(0.1);

const y_scale = d3.scaleLinear().range([height - margin.bottom, margin.top]);

let x_axis = d3.axisBottom(x_scale);

let y_axis = d3.axisLeft(y_scale);
d3
	.json(
		"https://raw.githubusercontent.com/iamspruce/intro-d3/main/data/nigeria-states.json"
	)
	.then(({ data }) => {
		data.forEach((d) => (d.Population = +d.info.Population));

		// Scale the range of the data in the domains
		x_scale.domain(data.map((d) => d.Name));
		y_scale.domain([0, d3.max(data, (d) => d.Population)]);

		// append the rectangles for the bar chart
		svg_1
			.selectAll("rect")
			.data(data)
			.join("rect")
			.attr("class", "bar")
			.attr("x", (d) => x_scale(d.Name))
			.attr("y", (d) => y_scale(d.Population))
			.attr("width", x_scale.bandwidth())
			.attr("height", (d) => height - margin.bottom - y_scale(d.Population));

		// append x axis
		svg_1
			.append("g")
			.attr("transform", `translate(0,${height - margin.bottom})`)
			.call(x_axis)
			.selectAll("text")
			.style("text-anchor", "end")
			.attr("dx", "-.8em")
			.attr("dy", ".15em")
			.attr("transform", "rotate(-65)");

		// add y axis
		svg_1.append("g").attr("transform", `translate(${margin.left},0)`).call(y_axis);
	});

