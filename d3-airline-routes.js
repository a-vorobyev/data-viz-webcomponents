import {html, PolymerElement} from '@polymer/polymer/polymer-element.js';
import * as d3 from 'd3';
/**
 * `d3-airline-routes`
 * d3 homework project
 *
 * @customElement
 * @polymer
 * @demo demo/index.html
 */
class D3AirlineRoutes extends PolymerElement {

  static get template() {
    return html`
      <style>
        :host {
            font-family: Helvetica, Arial, sans-serif
        }

        h1 {
            background-color: #2a5599;
            color: white;
            padding: 5px;
        }

        svg {
          border: 1px solid black;
          width: 100%;
        }

        .mainView {
          display: flex;
          flex-direction: row;
        }
      </style>

      <h1>Airlines Routes</h1>

      <div class="mainView">
          <div>
              <h2>Airlines</h2>
              <svg id="AirlinesChart"></svg>
          </div>
          <div>
              <h2>Airports</h2>
              <svg id="Map"></svg>
          </div>
      </div>
    `;
  }

  ready() {
    super.ready();

    let chart = this.shadowRoot.querySelector('#AirlinesChart');
    let map = this.shadowRoot.querySelector('#Map');

    this._drawAll(chart, map);
  }

  _drawAll(chart, map) {

    let store = {}

    function loadData() {
      return Promise.all([
        d3.csv("routes.csv"),
        d3.json("countries.geo.json")
      ]).then(dataSets => {
        store.routes = dataSets[0];
        store.geoJSON = dataSets[1];
        return store;
      });
    }

    function groupByAirline(data) {
      //Iterate over each route, producing a dictionary where the keys is are the ailines ids and the values are the information of the airline.
      let result = data.reduce((result, d) => {
          let currentData = result[d.AirlineID] || {
              "AirlineID": d.AirlineID,
              "AirlineName": d.AirlineName,
              "Count": 0
          }

          currentData.Count += //TODO: Increment the count (number of routes) of ariline.
            1

          result[d.AirlineID] = //TODO: Save the updated information in the dictionary using the airline id as key.
            currentData

          return result
      }, {})

      //We use this to convert the dictionary produced by the code above, into a list, that will make it easier to create the visualization.
      result = Object.keys(result).map(key => result[key])
      result = //TODO: Sort the data in descending order of count.
        result.sort((a,b) => d3.descending(a.Count, b.Count))

      return result
    }

    function showData() {
      //Get the routes from our store variable
      let routes = store.routes
      // Compute the number of routes per airline.
      let airlines = groupByAirline(routes)
      console.log(airlines)

      drawAirlinesChart(airlines);
      drawMap(store.geoJSON);

      let airports = groupByAirport(routes);
      drawAirports(airports);
    }

    loadData().then( showData )

    function drawAirlinesChart(airlines) {

      let config = getAirlinesChartConfig();
      let scales = getAirlinesChartScales(airlines, config);
      drawBarsAirlinesChart(airlines, scales, config);
      drawAxesAirlinesChart(airlines, scales, config);
    }

    function getAirlinesChartConfig() {
      let width = 350;
      let height = 400;
      let margin = {
          top: 10,
          bottom: 50,
          left: 130,
          right: 10
      }
      //The body is the are that will be occupied by the bars.
      let bodyHeight = height - margin.top - margin.bottom
      let bodyWidth = //TODO: Compute the width of the body by subtracting the left and right margins from the width.
        width - margin.right - margin.left

      //The container is the SVG where we will draw the chart. In our HTML is the svg tah with the id AirlinesChart
      let container = //TODO: use d3.select to select the element with id AirlinesChart
        d3.select(chart);
      container
          .attr("width", width)
         //TODO: Set the height of the container
          .attr("height", height);

      return { width, height, margin, bodyHeight, bodyWidth, container }
    }

    function getAirlinesChartScales(airlines, config) {
      let { bodyWidth, bodyHeight } = config;
      let maximunCount = //TODO: Use d3.max to get the highest Count value we have on the airlines list.
        d3.max(airlines, a => a.Count);

      let xScale = d3.scaleLinear()
          //TODO: Set the range to go from 0 to the width of the body
          .range([0, bodyWidth])
          //TODO: Set the domain to go from 0 to the maximun value fount for the field 'Count'
          .domain([0, maximunCount])

      let yScale = d3.scaleBand()
          .range([0, bodyHeight])
          .domain(airlines.map(a => a.AirlineName)) //The domain is the list of ailines names
          .padding(0.2)

      return { xScale, yScale }
    }

    function drawBarsAirlinesChart(airlines, scales, config) {
      let {margin, container} = config; // this is equivalent to 'let margin = config.margin; let container = config.container'
      let {xScale, yScale} = scales
      let body = container.append("g")
          .style("transform",
            `translate(${margin.left}px,${margin.top}px)`
          )

      let bars = body.selectAll(".bar")
          //TODO: Use the .data method to bind the airlines to the bars (elements with class bar)
          .data(airlines);

      //Adding a rect tag for each airline
      bars.enter().append("rect")
          .attr("height", yScale.bandwidth())
          .attr("y", (d) => yScale(d.AirlineName))
          //TODO: set the width of the bar to be proportional to the airline count using the xScale
          .attr("width", a => xScale(a.Count))
          .attr("fill", "#2a5599")
          .on("mouseenter", function(d) { // <- this is the new code
            //TODO: call the drawRoutes function passing the AirlineID id 'd'
            drawRoutes(d.AirlineID);
            //TODO: change the fill color of the bar to "#992a5b" as a way to highlight the bar. Hint: use d3.select(this)
            d3.select(this).attr("fill", "#992a5b");
          })
          //TODO: Add another listener, this time for mouseleave
          .on("mouseleave", function(d){
              //TODO: In this listener, call drawRoutes(null), this will cause the function to remove all lines in the chart since there is no airline withe AirlineID == null.
              drawRoutes(null);
              //TODO: change the fill color of the bar back to "#2a5599"
              d3.select(this).attr("fill", "#2a5599");
          });
      }

    function drawAxesAirlinesChart(airlines, scales, config){
      let {xScale, yScale} = scales
      let {container, margin, height} = config;
      let axisX = d3.axisBottom(xScale)
                    .ticks(5)

      container.append("g")
        .style("transform",
            `translate(${margin.left}px,${height - margin.bottom}px)`
        )
        .call(axisX)

      let axisY = //TODO: Create an axis on the left for the Y scale
        d3.axisLeft(yScale)
        // .ticks(airlines.length)
      //TODO: Append a g tag to the container, translate it based on the margins and call the axisY axis to draw the left axis.
      container.append("g")
        .style("transform", `translate(${margin.left}px, ${margin.top}px)`)
        .call(axisY)
    }

    function getMapConfig() {
      let width = 600;
      let height = 400;
      let container = //TODO: select the svg with id Map
        d3.select(map);
         //TODO: set the width and height of the conatiner to be equal the width and height variables.
      container
        .attr("width", width)
        .attr("height", height);

      return {width, height, container}
    }

    function getMapProjection(config) {
      let {width, height} = config;
      let projection = //TODO: Create a projection of type Mercator.
        d3.geoMercator();
      projection.scale(97)
                .translate([width / 2, height / 2 + 20])

      store.mapProjection = projection;
      return projection;
    }

    function drawBaseMap(container, countries, projection){

      let path = //TODO: create a geoPath generator and set its projection to be the projection passed as parameter.
        d3.geoPath(projection);

      container.selectAll("path").data(countries)
          .enter().append("path")
          .attr("d", path )//TODO: use the path generator to draw each country )
          .attr("stroke", "#ccc")
          .attr("fill", "#eee")
    }

    function drawMap(geoJson) {

      let config = getMapConfig();
      let projection = getMapProjection(config);

      drawBaseMap(config.container, geoJson.features, projection);
    }

    function groupByAirport(data) {
      //We use reduce to transform a list into a object where each key points to an aiport. This way makes it easy to check if is the first time we are seeing the airport.
      let result = data.reduce((result, d) => {
          //The || sign in the line below means that in case the first option is anything that Javascript consider false (this insclude undefined, null and 0), the second option will be used. Here if result[d.DestAirportID] is false, it means that this is the first time we are seeing the airport, so we will create a new one (second part after ||)

          let currentDest = result[d.DestAirportID] || {
              "AirportID": d.DestAirportID,
              "Airport": d.DestAirport,
              "Latitude": +d.DestLatitude,
              "Longitude": +d.DestLongitude,
              "City": d.DestCity,
              "Country": d.DestCountry,
              "Count": 0
          }
          currentDest.Count += 1
          result[d.DestAirportID] = currentDest

          //After doing for the destination airport, we also update the airport the airplane is departing from.
          let currentSource = result[d.SourceAirportID] || {
              "AirportID": d.SourceAirportID,
              "Airport": d.SourceAirport,
              "Latitude": +d.SourceLatitude,
              "Longitude": +d.SourceLongitude,
              "City": d.SourceCity,
              "Country": d.SourceCountry,
              "Count": 0
          }
          currentSource.Count += 1
          result[d.SourceAirportID] = currentSource

          return result
      }, {})

      //We map the keys to the actual ariorts, this is an way to transform the object we got in the previous step into a list.
      result = Object.keys(result).map(key => result[key])
      return result
    }

    function drawAirports(airports) {
      let config = getMapConfig(); //get the config
      let projection = getMapProjection(config) //get the projection
      let container = config.container; //get the container

      let circles = container.selectAll("circle");
      //TODO: bind the airports to the circles using the .data method.
      let join = circles.data(airports);
      //TODO: for each new airport (hint: .enter)
      //      - Set the radius to 1
      //      - set the x and y position of the circle using the projection to convert longitude and latitude to x and y porision.
      //      - Set the fill color of the circle to  "#2a5599"
      join.enter()
        .append("circle")
        .attr("r", 1)
        .attr("cx", d => projection([d.Longitude, d.Latitude])[0])
        .attr("cy", d => projection([d.Longitude, d.Latitude])[1])
        .attr("fill", "#2a5599")
    }

    /////////////drawing routes/////////////

    function drawRoutes(airlineID) {

      let routes = //TODO: get the routes from store
        store.routes
      let projection = //TODO: get the projection from the store
        store.mapProjection
      let container = //TODO: select the svg with id "Map" (our map container)
        d3.select(map)
      let selectedRoutes = //TODO: filter the routes to keep only the routes which AirlineID is equal to the parameter airlineID received by the function
        routes.filter( r => r.AirlineID === airlineID )
      let bindedData = container.selectAll("line")
          .data(selectedRoutes, d => d.ID) //This seconf parameter tells D3 what to use to identify the routes, this hepls D3 to correctly find which routes have been added or removed.

      //TODO: Use the .enter selector to append a line for each new route.
      bindedData
        .enter()
        .append("line")
      //TODO: for each line set the start of the line (x1 and y1) to be the position of the source airport (SourceLongitude and SourceLatitude) Hint: you can use projection to convert longitude and latitude to x and y.
        .attr("x1", d => projection([d.SourceLongitude, d.SourceLatitude])[0])
        .attr("y1", d => projection([d.SourceLongitude, d.SourceLatitude])[1])
      //TODO: foDest line.attr("cx", d => projection([d.Longitude, d.Latitude])[0]) set the end of the line (x2 and y2) to be the position of the source airport (DestLongitude and DestLongitude)
        .attr("x2", d => projection([d.DestLongitude, d.DestLatitude])[0])
        .attr("y2", d => projection([d.DestLongitude, d.DestLatitude])[1])
      //TODO: set the color of the stroke of the line to "#992a2a"
        .attr("stroke", "#992a2a")
      //TODO: set the opacity to 0.1
        .attr("opacity", "0.1");

      //TODO: use exit function over bindedData to remove any routes that does not satisfy the filter.
      bindedData
        .exit()
        .remove();
    }
  }
}

window.customElements.define('d3-airline-routes', D3AirlineRoutes);
