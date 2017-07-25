import { Component, ElementRef } from '@angular/core';

import L from 'leaflet';
import 'leaflet.pm';
import 'leaflet.pm/dist/leaflet.pm.css';

@Component({
    selector: 'app-root',
    templateUrl: './app.component.html',
    styleUrls: ['./app.component.scss']
})
export class AppComponent {

    map: any;
    activeLayerGroup: any;
    layerGroups: any[];

    constructor(private _elementRef: ElementRef) {
        this.layerGroups = [];
        this.activeLayerGroup = L.featureGroup([]);
        this.layerGroups.push(this.activeLayerGroup);
    }

    ngAfterViewInit() {
        let el = this._elementRef.nativeElement.querySelector('.leaflet-maps');

        this.map = L.map(el, {
            center: [48.225897, 11.674274], // TODO: via constructor
            zoom: 13,
            layers: this.layerGroups
        });

        // use openstreetmap tiles as map information
        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        // add every newly created shape to the active layer
        this.map.on('pm:create', (e) => {
            this.activeLayerGroup.addLayer(e.layer);
        });

        // define toolbar options
        var options = {
            position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
            drawMarker: false,  // adds button to draw markers
            drawPolygon: true,  // adds button to draw a polygon
            drawPolyline: false,  // adds button to draw a polyline
            editPolygon: true,  // adds button to toggle global edit mode
            deleteLayer: true   // adds a button to delete layerGroups
        };

        // add leaflet.pm controls to the map
        this.map.pm.addControls(options);
    }

    public removeLayer() {
        this.map.removeLayer(this.activeLayerGroup);
    }

    /*
    * This method is responsible for converting the shapes drawn to the map into GeoJson Data
    * which state the geospatial permission settings for metadata object. Importat here is the
    * parsing of circle, since GeoJson does not support circle shapes in its specification. We
    * propose to add the radius of a circle to the properties field of the GeoJson feature
    * object.
    */
    public toGeoJson() {
        let geoJsonData = {
            "type": "FeatureCollection",
            "features": []
        }
        this.activeLayerGroup.getLayers().map(layer => {
            if (layer instanceof L.Circle) {
                let gjson = layer.toGeoJSON();
                gjson.properties.radius = layer.getRadius(); // add radius of circle shape to the properties field
                geoJsonData.features.push(gjson);
            }
            if (layer instanceof L.Polygon) {
                let gjson = layer.toGeoJSON();
                geoJsonData.features.push(gjson);
            }
        });
        return geoJsonData;
    }

    /*
    * This method is reponsible for drawing GeoJson Data onto the map. The drawing of polygons
    * is done by inversing the geojson coordinates and drawing the corresponding leaflet object.
    * Circles are drawn on the basis of their radius and middle point. At the end the map adjusts
    * itself to the boundary of the shapes.
    */
    public fromGeoJson(geoJsonData) {
        geoJsonData.features.map(feature => {
            if (feature.geometry.type == "Polygon") {
                let points = [];
                feature.geometry.coordinates[0].map(coordinate => {
                    let point = [];
                    // reverse geojson x,y to LatLng
                    point.push(coordinate[1]);
                    point.push(coordinate[0]);
                    points.push(point);
                })
                L.polygon(points).addTo(this.activeLayerGroup);
            }
            if (feature.geometry.type == "Point" && feature.properties.radius != undefined) {
                L.circle([feature.geometry.coordinates[1], feature.geometry.coordinates[0]], { radius: feature.properties.radius }).addTo(this.activeLayerGroup);
            }
        });
        // adjust map
        const bounds = this.activeLayerGroup.getBounds();
        this.map.fitBounds(bounds);
    }

    public addGeoJson() {
        let geoJsonData = {
            "type": "FeatureCollection",
            "features": [
                {
                    "type": "Feature",
                    "properties": {},
                    "geometry": {
                        "type": "Polygon",
                        "coordinates": [
                            [
                                [
                                    11.671211,
                                    48.229899
                                ],
                                [
                                    11.679244,
                                    48.226877
                                ],
                                [
                                    11.677266,
                                    48.221844
                                ],
                                [
                                    11.671288,
                                    48.222882
                                ]
                            ]
                        ]
                    }
                },
                {
                    "type": "Feature",
                    "properties": {
                        "radius": 6000
                    },
                    "geometry": {
                        "type": "Point",
                        "coordinates": [
                            11.670211,
                            48.220899
                        ]
                    }
                }
            ]
        };
        this.fromGeoJson(geoJsonData);
    }
}
