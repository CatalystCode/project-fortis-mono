import React from 'react';
import createReactClass from 'create-react-class';
import Fluxxor from 'fluxxor';
import Dashboard from '../components/Insights/Dashboard';

const FluxMixin = Fluxxor.FluxMixin(React);
const StoreWatchMixin = Fluxxor.StoreWatchMixin("DataStore");

export const DashboardPage = createReactClass({
  mixins: [FluxMixin, StoreWatchMixin],

  getStateFromFlux() {
    return this.getFlux().store("DataStore").getState();
  },

  propertyLiterals() {
    const { dataSource, bbox, termFilters, maintopic, externalsourceid, datetimeSelection,
            fromDate, toDate, language, zoomLevel, settings, timespanType, enabledStreams,
            conjunctivetopics, heatmapTileIds, timeSeriesGraphData, popularLocations, popularTerms,
            timeSeriesCsv, popularLocationsCsv, popularTermsCsv, topSourcesCsv, category,
            allCategories,
            topSources, trustedSources, fullTermList, selectedplace, dashboardIsLoadedFromShareLink } = this.getStateFromFlux();

    return { dataSource, maintopic, termFilters, bbox, enabledStreams,
             externalsourceid, datetimeSelection, fromDate, toDate, language,
             zoomLevel, settings, timespanType, heatmapTileIds, category,
             conjunctivetopics, timeSeriesGraphData, popularLocations, popularTerms,
             timeSeriesCsv, popularLocationsCsv, popularTermsCsv, topSourcesCsv,
             allCategories,
             topSources, trustedSources, fullTermList, selectedplace, dashboardIsLoadedFromShareLink };
  },

  render() {
    if (!this.state.bbox.length) {
      return <div />;
    }

    return (
      <div>
        <Dashboard flux={this.props.flux} {...this.propertyLiterals()} />
      </div>
  )}
});