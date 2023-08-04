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
	.then((data) => {
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


// example 2
const svg_2 = d3.select("#d3_demo_2").attr("viewBox", [0, 0, width, height]);

// add title
svg_2
	.append("text")
	.attr("x", width / 1.4)
	.attr("y", `${height - 20}`)
	.style("font-size", "20x")
	.style("text-decoration", "underline")
	.text("Map of Nigeria and it's states ");

let projection = d3.geoEquirectangular().center([0, 0]);
const pathGenerator = d3.geoPath().projection(projection);

let g = svg_2.append("g");

let tooltip = d3
	.select("body")
	.append("div")
	.attr("class", "tooltip")
	.style("opacity", 0);

Promise.all([
	d3.json(
		"https://raw.githubusercontent.com/iamspruce/intro-d3/main/data/nigeria_state_boundaries.geojson"
	),
	d3.json(
		"https://raw.githubusercontent.com/iamspruce/intro-d3/main/data/nigeria-states.json"
	)
]).then(([topoJSONdata, countryData]) => {
	countryData.forEach((d) => {
		d.info.Longitude = +d.info.Longitude;
		d.info.Latitude = +d.info.Latitude;
	});
	projection.fitSize([width, height], topoJSONdata);
	g.selectAll("path")
		.data(topoJSONdata.features)
		.join("path")
		.attr("class", "country")
		.attr("d", pathGenerator);

	g.selectAll("circle")
		.data(countryData.data)
		.join("circle")
		.attr("cx", (d) => projection([d.info.Longitude, d.info.Latitude])[0])
		.attr("cy", (d) => projection([d.info.Longitude, d.info.Latitude])[1])
		.attr("r", 5)
		.style("fill", "green")
		.on("mouseover", function (event, d) {
			tooltip.transition().duration(200).style("opacity", 0.9);
			tooltip
				.html(`<p>Population: ${d.info.Population}</a>` + `<p>Name: ${d.Name}</p>`)
				.style("left", event.pageX + "px")
				.style("top", event.pageY - 28 + "px");
		})
		.on("mouseout", function (d) {
			tooltip.transition().duration(500).style("opacity", 0);
		});

	g.selectAll("text")
		.data(countryData.data)
		.join("text")
		.attr("x", (d) => projection([d.info.Longitude, d.info.Latitude])[0])
		.attr("y", (d) => projection([d.info.Longitude, d.info.Latitude])[1])
		.attr("dy", -7)
		.style("fill", "black")
		.style("font-size", "18px")
		.attr("text-anchor", "middle")
		.text((d) => d.Name);

	let zooming = d3
		.zoom()
		.scaleExtent([1, 8])
		.extent([
			[0, 0],
			[width, height]
		])
		.on("zoom", function (event) {
			g.selectAll("path").attr("transform", event.transform);
			g.selectAll("circle")
				.attr("transform", event.transform)
				.attr("r", 5 / event.transform.k);
			g.selectAll("text")
				.attr("transform", event.transform)
				.style("font-size", `${18 / event.transform.k}`)
				.attr("dy", -7 / event.transform.k);
		});

	svg_2.call(zooming);

	d3.select("#zoomIn").on("click", () => {
		svg_2.transition().call(zooming.scaleBy, 2);
	});
	d3.select("#zoomOut").on("click", () => {
		svg_2.transition().call(zooming.scaleBy, 0.5);
	});
	d3.select("#resetZoom").on("click", () => {
		svg_2.transition().call(zooming.scaleTo, 0);
	});
});
