$(function () {
	var margin = {top: 20, right: 40, bottom: 20, left: 20},
		width = d3.select("#axis-example").property("clientWidth") - margin.left - margin.right,
		height = width / 1.375;

	var parse = d3.time.format("%d-%b-%y").parse;

	// Scales and axes. Note the inverted domain for the y-scale: bigger is up!
	var x = d3.time.scale().range([0, width]),
	    y = d3.scale.linear().range([height, 0]),
	    xAxis = d3.svg.axis().scale(x).tickSize(-height).tickSubdivide(true),
	    yAxis = d3.svg.axis().scale(y).ticks(4).orient("right");

	// An area generator, for the light fill.
	var area = d3.svg.area()
			.interpolate("monotone")
			.x(function(d) { return x(d.date); })
			.y0(height)
			.y1(function(d) { return y(d.close); });

	// A line generator, for the dark stroke.
	var line = d3.svg.line()
			.interpolate("monotone")
			.x(function(d) { return x(d.date); })
			.y(function(d) { return y(d.close); });

	d3.tsv("snp/data.tsv", function(error, data) {
		data.forEach(function(d) {
			d.date = parse(d.date);
			d.close = +d.close;
		});

		data.sort(function (a, b) { return a.date - b.date; });

		x.domain(d3.extent(data, function(d) { return d.date; }));
		y.domain(d3.extent(data, function(d) { return d.close; }));

		// Add an SVG element with the desired dimensions and margin.
		var svg = d3.select("#axis-example").append("svg")
				.attr("width", width + margin.left + margin.right)
				.attr("height", height + margin.top + margin.bottom)
			.append("g")
				.attr("transform", "translate(" + margin.left + "," + margin.top + ")")
				.on("click", click);

		// Add the clip path.
		svg.append("clipPath")
				.attr("id", "clip")
			.append("rect")
				.attr("width", width)
				.attr("height", height);

		// Add the area path.
		svg.append("path")
				.attr("class", "area")
				.attr("clip-path", "url(#clip)")
				.attr("d", area(data));

		// Add the x-axis.
		svg.append("g")
				.attr("class", "x axis")
				.attr("transform", "translate(0," + height + ")")
				.call(xAxis);

		// Add the y-axis.
		svg.append("g")
				.attr("class", "y axis")
				.attr("transform", "translate(" + width + ",0)")
				.call(yAxis);

		// Add the line path.
		svg.append("path")
				.attr("class", "line")
				.attr("clip-path", "url(#clip)")
				.attr("d", line(data));

		// Add a small label for the symbol name.
		svg.append("text")
				.attr("x", width - 6)
				.attr("y", height - 6)
				.style("text-anchor", "end")
				.text(data[0].symbol);

		// On click, update the x-axis.
		function click() {
			var n = data.length - 1,
					i = Math.floor(Math.random() * n / 2),
					j = i + Math.floor(Math.random() * n / 2) + 1;
			x.domain([data[i].date, data[j].date]);
			var t = svg.transition().duration(750);
			t.select(".x.axis").call(xAxis);
			t.select(".area").attr("d", area(data));
			t.select(".line").attr("d", line(data));
		}
	});

	// Parse dates and numbers. We assume values are sorted by date.
	function type(d) {
		d.date = parse(d.date);
		d.price = +d.price;
		return d;
	}

});
