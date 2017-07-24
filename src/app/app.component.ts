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
        this.activeLayerGroup = L.layerGroup([]);
        this.layerGroups.push(this.activeLayerGroup);
    }

    ngAfterViewInit() {
        let el = this._elementRef.nativeElement.querySelector('.leaflet-maps');

        //leaflet.Icon.Default.imagePath = 'assets/img/theme/vendor/leaflet';
        this.map = L.map(el, {
            center: [48.225897, 11.674274],
            zoom: 13,
            layers: this.layerGroups
        });

        L.tileLayer('http://{s}.tile.osm.org/{z}/{x}/{y}.png', {
            attribution: '&copy; <a href="http://osm.org/copyright">OpenStreetMap</a>'
        }).addTo(this.map);

        //L.control.layers(this.layerGroups).addTo(this.map);

        this.map.on('pm:create', (e) => {
            this.activeLayerGroup.addLayer(e.layer);
            console.log("go");
        });

        // define toolbar options
        var options = {
            position: 'topleft', // toolbar position, options are 'topleft', 'topright', 'bottomleft', 'bottomright'
            drawMarker: true,  // adds button to draw markers
            drawPolygon: true,  // adds button to draw a polygon
            drawPolyline: false,  // adds button to draw a polyline
            editPolygon: true,  // adds button to toggle global edit mode
            deleteLayer: true   // adds a button to delete layerGroups
        };

        // add leaflet.pm controls to the map
        this.map.pm.addControls(options);

        /*
        leaflet.marker([51.5, -0.09]).addTo(map)
            .bindPopup('A pretty CSS3 popup.<br> Easily customizable.')
            .openPopup();
            */
    }

    public getShapesFromMap() {

    }

    public removeLayer() {
        this.map.removeLayer(this.activeLayerGroup);
    }

    public addCircle() {
        L.circle([48.225897, 11.674274], {radius: 200}).addTo(this.activeLayerGroup);
    }

    public addGeoJsonToMap(geoJsonData) {
        const geoJsonLayer = L.geoJson(geoJsonData).addTo(this.map);
        const bounds = geoJsonLayer.getBounds();
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
                }
            ]
        };
        this.addGeoJsonToMap(geoJsonData);
    }
}
