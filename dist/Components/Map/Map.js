import SuperComponent from '../SuperComponent.js'

import { createElement } from '../../helpers.js'

const styleSource = 'dist/Components/Map/style.css';

class MapComponent extends SuperComponent {
  // Keyname and dataset to connect with
  constructor(keyName, rendererInstance) {
    super(styleSource, keyName, rendererInstance);

    const self = this;

    const propInfos = rendererInstance.data[keyName];

    const routeData = {
      "type": "Feature",
      "properties": {},
      "geometry": {
        "type": "LineString",
        "coordinates": []
      }
    };

    const pointsData = {
      "type": "FeatureCollection",
      "features": [
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-77.03238901390978, 38.913188059745586]
          },
          "properties": {
            "title": "Start",
            "icon": "circle"
          }
        },
        {
          "type": "Feature",
          "geometry": {
            "type": "Point",
            "coordinates": [-122.414, 37.776]
          },
          "properties": {
            "title": "End",
            "icon": "embassy"
          }
        }
      ]
    };
    var route = [];
    var map;

    mapboxgl.accessToken = 'pk.eyJ1IjoibWF1cmljZS1jb25yYWQiLCJhIjoiY2lpM25jbXVpMDExZXQ4bTBmYzd5cjBhbSJ9.zW17SmAFJRJPf8VjAxpang';

    const btnStyleSheet = `
      background-color: #2a8a56;
      height: 30px;
      width: 30px;
      display: inline-block;
      margin: 0 5px;
      background-size: 80%;
      background-position: center;
      background-repeat: no-repeat;
      cursor: pointer;
    `;

    const mapContainer = createElement("div", {
      className: "route-map",
      attributes: {
        style: `
          width: 100%;
          height: 400px;
          display: block;
        `,
        //style: 'position: fixed; left: 50px; top: 50px; width: 1000px; height: 800px;',
        id: "map"
      },
      childs: []
    });

    function updateRoute() {

      // Set the route's coordinates in dataset to current route
      routeData.geometry.coordinates = route;
      // Update dataset for route
      map.getSource('route').setData(routeData);

      // Set first point's coordinates in dataset to first point's one
      pointsData.features[0].geometry.coordinates = route[0];

      // Set last point's coordinates in dataset to last point's one
      pointsData.features[pointsData.features.length - 1].geometry.coordinates = route[route.length - 1];

      // Update dataset for all points
      map.getSource('points').setData(pointsData);

    }



    const btns = createElement("div", {
      className: "map-controls",
      attributes: {
        style: `
          margin: 10px 0;
        `
      },
      childs: [
        createElement("div", {
          className: "btn-map btn-remove",
          attributes: {
            style: btnStyleSheet + `
              background-image: url('data/resources/back-arrow.svg');
            `
          },
          eventListeners: [
            {
              type: "click",
              callback(event) {

                // Remove last point from route
                route = route.slice(0, route.length - 1);

                updateRoute();
              }
            }
          ]
        }),
        createElement("div", {
          className: "btn-map btn-clear",
          attributes: {
            style: btnStyleSheet + `
              background-image: url('data/resources/garbage.svg');
            `
          },
          eventListeners: [
            {
              type: "click",
              callback(event) {

                // Clear route
                route = [];

                updateRoute();
              }
            }
          ]
        }),
        createElement("div", {
          className: "btn-map btn-refresh",
          attributes: {
            style: btnStyleSheet + `
              background-image: url('data/resources/refresh.svg');
            `
          },
          eventListeners: [
            {
              type: "click",
              callback(event) {

                console.log(JSON.stringify(Array.from(route), null, 2));

                const geoJSON = {
                  "type": "FeatureCollection",
                  "features": [
                    {
                      "type": "Feature",
                      "properties": {},
                      "geometry": {
                        "type": "LineString",
                        "coordinates": Array.from(route)
                      }
                    },
                    {
                      "type": "Feature",
                      "geometry": {
                        "type": "Point",
                        "coordinates": route[0]
                      },
                      "properties": {
                        "title": "Start",
                        "icon": "airfield-15"
                      }
                    },
                    {
                      "type": "Feature",
                      "geometry": {
                        "type": "Point",
                        "coordinates": route[route.length - 1]
                      },
                      "properties": {
                        "title": "End",
                        "icon": "embassy"
                      }
                    }
                  ]
                };


                const { width, height } = propInfos.value;

                const center = map.getCenter();
                const zoom = map.getZoom() + 0.5;

                const responseObj = {
                  geo: geoJSON,
                  center: center,
                  zoom: zoom,
                  width: width,
                  height: height,
                  accessToken: mapboxgl.accessToken
                };

                self.value = responseObj;
              }
            }
          ]
        })
      ]
    });


    setTimeout(function() {

      map = new mapboxgl.Map({
        container: mapContainer,
        style: 'mapbox://styles/mapbox/streets-v9',
        center: [propInfos.value.center.lng, propInfos.value.center.lat],
        zoom: propInfos.value.zoom
      });

      map.getCanvas().style.cursor = 'crosshair';

      map.on('click', function(e) {

        route.push([
          e.lngLat.lng,
          e.lngLat.lat
        ]);

        updateRoute();

      });




      map.on("load", function() {

        map.addSource('route', {
          type: 'geojson',
          data: routeData
        });

        map.addLayer({
          "id": "route",
          "type": "line",
          "source": "route",
          "layout": {
            "line-join": "round",
            "line-cap": "round"
          },
          "paint": {
            "line-color": "#1DA64A",
            "line-opacity": 1,
            "line-width": 5
          }
        });


        map.addSource('points', {
          "type": "geojson",
          "data": pointsData
        });

        map.addLayer({
          "id": "points",
          "type": "symbol",
          "source": 'points',
          "layout": {
            "icon-image": "{icon}-15",
            "text-field": "{title}",
            "text-font": ["Open Sans Semibold", "Arial Unicode MS Bold"],
            "text-offset": [0, 0.6],
            "text-anchor": "top"
          }
        });




      });
    }, 100);

    const mainCon = createElement("div", {
      className: "map-container",
      childs: [
        mapContainer,
        btns
      ]
    });

    this.root.append(mainCon);

    this.container = this.root;


    //console.log(this.__shadow);




    //return mainCon;
  }
}


export default MapComponent;
