import React from 'react';
import { Map, ZoomControl, Rectangle, FeatureGroup } from 'react-leaflet';
import { EditControl } from "react-leaflet-draw"
import { tileIdsForBoundingBox } from 'geotile';
import { TileLayer } from '../Insights/Maps/TileLayer';
import '../../styles/Insights/HeatMap.css';

const styles = {
    error: {
        color: 'red'
    },
    settings: {
        input: {
            width: '65%',
            marginLeft: '4px',
            fontSize: '12px'
        },
        row: {
            display: 'inline-flex',
            alignItems: 'center',
            width: '100%'
        },
        mapColumn: {
            marginLeft: '13px'
        },
        label: {
            display: 'inline-table'
        },
        locationGridColumn: {
            marginTop: '14px',
            marginLeft: '10px',
            width: '63%'
        }
    }
};

export default class AdminLocations extends React.Component {
    constructor(props) {
        super(props);

        const { defaultZoomLevel, targetBbox, mapSvcToken } = props;
        this.onEditBox = this.onEditBox.bind(this);
        this.handleSaveSettings = this.handleSaveSettings.bind(this);
        this.onViewportChanged = this.onViewportChanged.bind(this);
        this.state = {
            defaultZoomLevel: defaultZoomLevel,
            originalBounds: targetBbox,
            targetBbox: targetBbox,
            mapSvcToken,
            error: '',
            saving: false,
            locationNameBlacklist: []
        }
    }

    handleSaveSettings() {
        const {
            name,
            title,
            logo,
            defaultLanguage,
            supportedLanguages,
            featureservicenamespace,
            defaultLocation,
            translationSvcToken,
            mapSvcToken,
            cogSpeechSvcToken,
            cogVisionSvcToken,
            cogTextSvcToken
        } = this.props;

        const {
            defaultZoomLevel,
            targetBbox
        } = this.state;

        const site = {
            name,
            title,
            logo,
            defaultLanguage,
            supportedLanguages,
            featureservicenamespace,
            defaultLocation,
            translationSvcToken,
            mapSvcToken,
            cogSpeechSvcToken,
            cogVisionSvcToken,
            cogTextSvcToken,
            defaultZoomLevel,
            targetBbox
        };

        this.setState({ saving: true });

        this.props.flux.actions.ADMIN.save_settings(site);
    }

    onViewportChanged(viewport) {
        const defaultZoomLevel = this.refs.map.leafletElement.getZoom();
        this.setState({ defaultZoomLevel });
    }

    onEditBox(el) {
        const bounds = el.target.getBounds();
        const { defaultZoomLevel } = this.state;

        const geofence = {north: bounds.getNorth(), west: bounds.getWest(), south: bounds.getSouth(), east: bounds.getEast()};
        const { north, west, south, east } = geofence;

        const tileIds = tileIdsForBoundingBox(geofence, defaultZoomLevel);
        if (tileIds.length) {
            this.setState({ targetBbox: [north, west, south, east], error: '' });
        } else {
            const error = `No tile ids for fence ${JSON.stringify(geofence)} at zoom ${defaultZoomLevel}. Please select a different geo-area.`;
            this.setState({ error });
        }
    }

    renderError() {
        const { error } = this.state;

        if (!error) {
            return null;
        }

        return (
            <em style={styles.error}>{error}</em>
        )
    }

    render() {
        const { defaultZoomLevel, mapSvcToken, saving } = this.state;
        let { targetBbox, originalBounds } = this.state;
        const bboxRectangleColor = "#0ff";

        if (typeof targetBbox  === 'string') targetBbox = targetBbox.split(',');
        if (typeof originalBounds  === 'string') originalBounds = originalBounds.split(',');

        const bounds = targetBbox.length && targetBbox.length === 4 ? [[targetBbox[0], targetBbox[1]], [targetBbox[2], targetBbox[3]]] : [];
        const originalBoundsTarget = originalBounds.length && originalBounds.length === 4 ? [[originalBounds[0], originalBounds[1]], [originalBounds[2], originalBounds[3]]] : [];

        return (
            <div className="row">
                <div className="col-lg-8" style={styles.settings.mapColumn}>
                    <div className="row" style={styles.settings.row}>
                        <button onClick={this.handleSaveSettings} type="button" className={!saving ? `btn btn-primary btn-sm addSiteButton` : `btn btn-success btn-sm addSiteButton`}>
                            <i className="fa fa-cloud-upload" aria-hidden="true"></i>
                            {saving ? "Saved Changes" : "Save Settings"}
                        </button>
                    </div>
                    <div className="row" style={styles.settings.row}>
                        <label style={styles.settings.label}>Target Bbox</label>
                        <input readOnly value={targetBbox ? targetBbox.join(",") : "N/A"} type="text" style={styles.settings.input} className="form-control" />
                    </div>
                    <div className="row" style={styles.settings.row}>
                        <label style={styles.settings.label}>Default Zoom Level</label>
                        <input readOnly value={targetBbox ? defaultZoomLevel : "N/A"} type="text" style={styles.settings.input} className="form-control" />
                    </div>
                    <div className="row">
                        <Map
                            onzoomend={this.onViewportChanged}
                            bounds={originalBoundsTarget}
                            ref="map"
                            id="map"
                            zoom={defaultZoomLevel}
                            zoomControl={false} >

                            <TileLayer accessToken={mapSvcToken} />

                            <FeatureGroup>
                                <EditControl
                                    position='topright'
                                    onCreated={this.onEditBox}
                                    draw={{
                                        polyline: false,
                                        polygon: false,
                                        circle: false,
                                        marker: false,
                                        rectangle: {
                                            title: 'Select the geo fence area.',
                                            repeatMode: false
                                        }
                                    }}
                                />
                            </FeatureGroup>

                            <ZoomControl
                                position={'topright'}
                            />

                            <Rectangle
                                bounds={bounds}
                                fill={false}
                                color={bboxRectangleColor}
                            />
                        </Map>
                        {this.renderError()}
                    </div>
                </div>
            </div>
        );
    }
}