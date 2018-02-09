import React from 'react';
import Form from 'react-jsonschema-form';
import { Card, CardTitle, CardText } from 'material-ui/Card';
import Divider from 'material-ui/Divider';
import StreamConstants from './StreamConstants';
import { guid } from './../../../utils/Utils';
import forOwn from '../../../../node_modules/lodash/forOwn';

class CreateStream extends React.Component {
  constructor(props) {
    super(props);

    this.save = this.save.bind(this);

    this.state = {
      dropdownValue: StreamConstants.defaultStreamMap.bing
    };
  }

  save = data => {
    const stream = data.formData.stream;
    const addGuidToStreamIfNotExist = () => { if (!stream.streamId || stream.streamId.length === 0) stream.streamId = guid(); }
    
    const formatParamsForGraphqlSchema = () => {
      const paramEntries = [];
      forOwn(stream.params, (value, key) => {
        paramEntries.push({ key, value: (typeof value === 'boolean' ? value.toString() : value) });
      });
      if (paramEntries.filter(entry => entry.key === 'watchlistFilteringEnabled').length === 0) paramEntries.push({ key: "watchlistFilteringEnabled", value: "false" });
      
      stream.params = paramEntries;
    }

    const saveStream = () => this.props.flux.actions.ADMIN.save_stream([stream]);

    addGuidToStreamIfNotExist();
    formatParamsForGraphqlSchema();
    saveStream();
  }

  render() {
    return (
      <Card>
        <CardTitle title="Create Stream"/>
        <Divider />
        <CardText style={{backgroundColor: '#fafafa'}}>
          <Form schema={StreamConstants.schema}
            uiSchema={StreamConstants.uiSchema}
            liveValidate={true}
            showErrorList={false}
            onSubmit={this.save} />
        </CardText>
      </Card>
    );
  }
}

export default CreateStream;