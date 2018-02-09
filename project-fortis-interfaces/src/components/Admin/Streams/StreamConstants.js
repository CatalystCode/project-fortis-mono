import values from './../../../../node_modules/lodash/values';

const defaultStreamMap = {
  bing: {
    pipelineKey: 'Bing',
    pipelineLabel: 'Bing',
    pipelineIcon: 'Bing Icon',
    streamFactory: 'Bing',
    enabled: true
  },
  eventHub: {
    pipelineKey: 'EventHub',
    pipelineLabel: 'EventHub',
    pipelineIcon: 'EventHub Icon',
    streamFactory: 'EventHub',
    enabled: true
  },
  facebookComment: {
    pipelineKey: 'FacebookComment',
    pipelineLabel: 'FacebookComment',
    pipelineIcon: 'Facebook Comment Icon',
    streamFactory: 'FacebookComment',
    enabled: true
  },
  facebookPost: {
    pipelineKey: 'FacebookPost',
    pipelineLabel: 'FacebookPost',
    pipelineIcon: 'Facebook Post Icon',
    streamFactory: 'FacebookPost',
    enabled: true
  },
  html: {
    pipelineKey: 'HTML',
    pipelineLabel: 'HTML',
    pipelineIcon: 'HTML Icon',
    streamFactory: 'HTML',
    enabled: true
  },
  instagramLocation: {
    pipelineKey: 'InstagramLocation',
    pipelineLabel: 'InstagramLocation',
    pipelineIcon: 'Instagram Location Icon',
    streamFactory: 'InstagramLocation',
    enabled: true
  },
  instagramTag: {
    pipelineKey: 'InstagramTag',
    pipelineLabel: 'InstagramTag',
    pipelineIcon: 'Instagram Tag Icon',
    streamFactory: 'InstagramTag',
    enabled: true
  },
  rss: {
    pipelineKey: 'RSS',
    pipelineLabel: 'RSS',
    pipelineIcon: 'RSS Icon',
    streamFactory: 'RSS',
    enabled: true
  },
  radio: {
    pipelineKey: 'Radio',
    pipelineLabel: 'Radio',
    pipelineIcon: 'Radio Icon',
    streamFactory: 'Radio',
    enabled: true
  },
  reddit: {
    pipelineKey: 'Reddit',
    pipelineLabel: 'Reddit',
    pipelineIcon: 'Reddit Icon',
    streamFactory: 'Reddit',
    enabled: true
  },
  twitter: {
    pipelineKey: 'Twitter',
    pipelineLabel: 'Twitter',
    pipelineIcon: 'fa fa-twitter',
    streamFactory: 'Twitter',
    enabled: true
  }
};

const schema = {
  type: 'object',
  properties: { 
    stream: {
      $ref: "#/definitions/stream"
    }
  },
  definitions: {
    stream: {
      title: '',
      type: 'object',
      properties: {
        streamId: {
          type: 'string',
          default: ''
        },
        pipelineKey: {
          title: 'Stream Type',
          type: 'string',
          enum: (values(defaultStreamMap).map(defaultStream => defaultStream.pipelineKey)),
          default: defaultStreamMap.bing.pipelineKey
        },
        pipelineLabel: {
          type: 'string',
          enum: (values(defaultStreamMap).map(defaultStream => defaultStream.pipelineLabel)),
          default: defaultStreamMap.bing.pipelineLabel
        },
        pipelineIcon: {
          type: 'string',
          enum: (values(defaultStreamMap).map(defaultStream => defaultStream.pipelineIcon)),
          default: defaultStreamMap.bing.pipelineIcon
        },
        streamFactory: {
          type: 'string',
          enum: (values(defaultStreamMap).map(defaultStream => defaultStream.streamFactory)),
          default: defaultStreamMap.bing.streamFactory
        },
        enabled: {
          type: 'boolean',
          default: true
        },
        params: {
          type: 'object'
        }
      },
      dependencies: {
        pipelineKey: {
          oneOf: [
            {
              properties: {
                pipelineKey: {
                  enum: [
                    'Bing'
                  ]
                },
                pipelineLabel: {
                  type: 'string',
                  default: defaultStreamMap.bing.pipelineLabel
                },
                pipelineIcon: {
                  type: 'string',
                  default: defaultStreamMap.bing.pipelineIcon
                },
                streamFactory: {
                  type: 'string',
                  default: defaultStreamMap.bing.streamFactory
                },
                enabled: {
                  type: 'boolean',
                  default: defaultStreamMap.bing.enabled
                },
                params: {
                  title: 'Bing Stream Parameters',
                  type: 'object',
                  properties: {
                    accessToken: {
                      title: 'Access Token',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    searchInstanceId: {
                      title: 'Search Instance Id',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    keywords: {
                      title: 'Keywords',
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  },
                  required: [
                    'accessToken',
                    'searchInstanceId',
                    'keywords'
                  ]
                }
              },
            },
            {
              properties: {
                pipelineKey: {
                  enum: [
                    'EventHub'
                  ]
                },
                pipelineLabel: {
                  type: 'string',
                  default: defaultStreamMap.eventHub.pipelineLabel
                },
                pipelineIcon: {
                  type: 'string',
                  default: defaultStreamMap.eventHub.pipelineIcon
                },
                streamFactory: {
                  type: 'string',
                  default: defaultStreamMap.eventHub.streamFactory
                },
                enabled: {
                  type: 'boolean',
                  default: defaultStreamMap.eventHub.enabled
                },
                params: {
                  title: 'Event Hub Stream Parameters',
                  type: 'object',
                  properties: {
                    namespace: {
                      title: 'Namespace',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    name: {
                      title: 'Name',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    policyName: {
                      title: 'Policy Name',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    policyKey: {
                      title: 'Policy Key',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    partitionCount: {
                      title: 'Partition Count',
                      type: 'number'
                    },
                    consumerGroup: {
                      title: 'Consumer Group',
                      type: 'string',
                      pattern: '\\w+'
                    }
                  },
                  required: [
                    'namespace',
                    'name',
                    'policyName',
                    'policyKey',
                    'partitionCount',
                    'consumerGroup'
                  ]
                }
              },
            },
            {
              properties: {
                pipelineKey: {
                  enum: [
                    'Twitter'
                  ]
                },
                pipelineLabel: {
                  type: 'string',
                  default: defaultStreamMap.twitter.pipelineLabel
                },
                pipelineIcon: {
                  type: 'string',
                  default: defaultStreamMap.twitter.pipelineIcon
                },
                streamFactory: {
                  type: 'string',
                  default: defaultStreamMap.twitter.streamFactory
                },
                enabled: {
                  type: 'boolean',
                  default: defaultStreamMap.twitter.enabled
                },
                params: {
                  title: 'Twitter Stream Parameters',
                  type: 'object',
                  properties: {
                    consumerKey: {
                      title: 'Consumer Key',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    consumerSecret: {
                      title: 'Consumer Secret',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    accessToken: {
                      title: 'Access Token',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    accessTokenSecret: {
                      title: 'Access Token Secret',
                      type: 'string',
                      pattern: '\\w+'
                    },
                    watchlistFilteringEnabled: {
                      title: 'Watchlist Filtering Enabled',
                      type: 'boolean'
                    },
                    userIds: {
                      title: 'Twitter User Ids',
                      type: 'array',
                      items: {
                        type: 'string'
                      }
                    }
                  },
                  required: [
                    'consumerKey',
                    'consumerSecret',
                    'accessToken',
                    'accessTokenSecret',
                    'userIds'
                  ]
                }
              }
            }
          ]
        }
      }
    }
  }
};

const uiSchema = {
  stream: {
    streamId: {
      "ui:widget": "hidden"
    },
    pipelineLabel: {
      "ui:widget": "hidden"
    },
    pipelineIcon: {
      "ui:widget": "hidden"
    },
    streamFactory: {
      "ui:widget": "hidden"
    },
    enabled: {
      "ui:widget": "hidden"
    },
    params: {
      accessToken: {
        classNames: "settings secret"
      },
      searchInstanceId: {
        classNames: "settings secret"
      },
      policyKey: {
        classNames: "settings secret"
      },
      consumerKey: {
        classNames: "settings secret"
      },
      consumerSecret: {
        classNames: "settings secret"
      },
      accessTokenSecret: {
        classNames: "settings secret"
      },
    }
  }
};

module.exports = {
  defaultStreamMap,
  schema,
  uiSchema
};