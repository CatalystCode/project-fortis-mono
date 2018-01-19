'use strict';

const Promise = require('promise');
const cassandraConnector = require('../../clients/cassandra/CassandraConnector');
const { PlaceholderForSecret, withRunTime, getTermsByCategory, getSiteDefinition } = require('../shared');
const { trackException, trackEvent } = require('../../clients/appinsights/AppInsightsClient');
const loggingClient = require('../../clients/appinsights/LoggingClient');
const { requiresRole } = require('../../auth');

function users(args, res) { // eslint-disable-line no-unused-vars
  return new Promise((resolve, reject) => {
    cassandraConnector.executeQuery('SELECT * FROM fortis.users', [])
      .then(rows => {
        const users = rows.map(cassandraRowToUser);
        resolve({
          users
        });
      })
      .catch(error => {
        trackException(error);
        reject(error);
      });
  });
}

function cassandraRowToUser(row) {
  return {
    identifier: row.identifier,
    role: row.role
  };
}

function terms(args, res) { // eslint-disable-line no-unused-vars
  return new Promise((resolve, reject) => {
    const { translationLanguage, category } = args;
    const ignoreCache = true;

    getTermsByCategory(translationLanguage, category, ignoreCache)
      .then(resolve)
      .catch(error => {
        trackException(error);
        reject(error);
      });
  });
}

function hideSecret(obj, key) {
  if (obj[key]) {
    obj[key] = PlaceholderForSecret;
  }
}

function sites(args, res) { // eslint-disable-line no-unused-vars
  return new Promise((resolve, reject) => {
    getSiteDefinition()
      .then(value => {
        hideSecret(value.site.properties, 'translationSvcToken');
        hideSecret(value.site.properties, 'cogSpeechSvcToken');
        hideSecret(value.site.properties, 'cogVisionSvcToken');
        hideSecret(value.site.properties, 'cogTextSvcToken');
        resolve(value);
      })
      .catch(reject);
  });
}

function streams(args, res) { // eslint-disable-line no-unused-vars
  return new Promise((resolve, reject) => {
    cassandraConnector.executeQuery('SELECT * FROM fortis.streams', [])
      .then(rows => {
        const streams = rows.map(cassandraRowToStream);
        resolve({
          streams
        });
      })
      .catch(error => {
        trackException(error);
        reject(error);
      });
  });
}

function trustedSources(args, res) { // eslint-disable-line no-unused-vars
  return new Promise((resolve, reject) => {
    const query = 'SELECT * FROM fortis.trustedsources';
    const params = [];

    cassandraConnector.executeQuery(query, params)
      .then(rows => resolve({
        sources: rows.map(cassandraRowToSource)
      }))
      .catch(error => {
        trackException(error);
        reject(error);
      });
  });
}

function cassandraRowToStream(row) {
  if (row.enabled == null) row.enabled = false;
  return {
    streamId: row.streamid,
    pipelineKey: row.pipelinekey,
    pipelineLabel: row.pipelinelabel,
    pipelineIcon: row.pipelineicon,
    streamFactory: row.streamfactory,
    params: paramsToParamsEntries(row.params),
    enabled: row.enabled
  };
}

function cassandraRowToSource(row) {
  return {
    rowKey: row.pipelinekey + ',' + row.externalsourceid + ',' + row.sourcetype + ',' + row.rank,
    externalsourceid: row.externalsourceid,
    sourcetype: row.sourcetype,
    displayname: row.displayname || row.externalsourceid,
    pipelinekey: row.pipelinekey,
    rank: row.rank,
    reportingcategory: row.reportingcategory
  };
}

function paramsToParamsEntries(params) {
  const paramsEntries = [];
  for (const key of Object.keys(params)) {
    let value = params[key];
    let paramsEntry = {
      key,
      value
    };
    paramsEntries.push(paramsEntry);
  }
  return paramsEntries;
}

function cassandraRowToTermFilter(row) {
  return {
    id: row.id,
    isLocation: !!row.islocation,
    filteredTerms: row.conjunctivefilter
  };
}

function termBlacklist(args, res) { // eslint-disable-line no-unused-vars
  return new Promise((resolve, reject) => {
    const blacklistQuery = 'SELECT id, conjunctivefilter, islocation FROM fortis.blacklist';
    cassandraConnector.executeQuery(blacklistQuery, [])
      .then(rows => {
        const filters = rows.map(cassandraRowToTermFilter);
        resolve({ filters });
      })
      .catch(reject);
  });
}

module.exports = {
  users: requiresRole(trackEvent(withRunTime(users), 'users', loggingClient.usersExtraProps(), loggingClient.usersExtraMetrics()), 'user'),
  sites: requiresRole(trackEvent(withRunTime(sites), 'sites'), 'user'),
  streams: requiresRole(trackEvent(withRunTime(streams), 'streams', loggingClient.streamsExtraProps(), loggingClient.streamsExtraMetrics()), 'user'),
  siteTerms: requiresRole(trackEvent(withRunTime(terms), 'terms', loggingClient.termsExtraProps(), loggingClient.keywordsExtraMetrics()), 'user'),
  trustedSources: requiresRole(trackEvent(withRunTime(trustedSources), 'trustedSources', loggingClient.trustedSourcesExtraProps(), loggingClient.trustedSourcesExtraMetrics()), 'user'),
  termBlacklist: requiresRole(trackEvent(withRunTime(termBlacklist), 'termBlacklist'), 'user')
};