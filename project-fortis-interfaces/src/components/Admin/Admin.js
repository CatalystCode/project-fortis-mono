import React from 'react';
import { Tab, Tabs, TabList, TabPanel } from 'react-tabs';
import Modal from 'react-bootstrap/lib/Modal';
import Button from 'react-bootstrap/lib/Button';
import { AdminSettings } from './AdminSettings';
import AdminWatchlist from './AdminWatchlist';
import { CustomEventsEditor } from './CustomEventsEditor';
import TrustedSources from './TrustedSources';
import BlacklistEditor from './BlacklistEditor';
import StreamEditor from './Streams/StreamEditor';
import UserRoles from './UserRoles';
import FontIcon from 'material-ui/FontIcon';
import ReactTooltip from 'react-tooltip'
import {blue500, blue700} from 'material-ui/styles/colors';
import '../../styles/Admin/Admin.css';

const SETTINGS_TAB = 0;
const WATCHLIST_TAB = 1;
const USERS_TAB = 2;
const CUSTOM_EVENTS_TAB = 3;
const TRUSTED_SOURCES_TAB = 4;
const BLACKLIST_TAB = 5;
const STREAM_TAB = 6;

const styles = {
  container: {
    panel: {
      marginTop: '6px'
    },
    panelHeading: {
      paddingTop: '3px',
      paddingBottom: '3px'
    }
  }
};

class Admin extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      index: 0,
      showModal: false
    };
  }

  closeModal = () => {
    this.setState({ 
      showModal: false
    });
  }

  openModal = () => {
    this.setState({ showModal: true });
  }

  handleTabChanged = (index, last) => {
    this.setState({ index });
  }

  restartPipelineAndCloseModal = () => {
    this.props.flux.actions.ADMIN.restart_pipeline();
    this.closeModal();
  }

  render() {
    const { index, showModal } = this.state;
    const { settings, watchlist } = this.props;

    const shouldShowRestartPipelineButton =
      index === SETTINGS_TAB ||
      index === WATCHLIST_TAB ||
      index === BLACKLIST_TAB;

    return (
      <div>
        <div className="container-fluid">
          <div className="col-lg-12">
            <div className="panel panel-primary" style={styles.container.panel}>
              <div className="panel-body">
                  <div className="row adminContainer">
                  <Tabs
                    onSelect={this.handleTabChanged}
                    selectedIndex={index}>
                    <TabList>
                      <Tab>Site Settings</Tab>
                      <Tab>Watchlist</Tab>
                      <Tab>Users</Tab>
                      <Tab>Event Import</Tab>
                      <Tab>Trusted Sources</Tab>
                      <Tab>Blacklisted Terms</Tab>
                      <Tab>Streams</Tab>
                    </TabList>
                    <TabPanel>
                      <h2>Settings</h2>
                      { settings && settings.properties && index === SETTINGS_TAB &&
                        <AdminSettings {...this.props}
                          index={index}
                          siteSettings={settings}
                        />}
                    </TabPanel>
                    <TabPanel>
                      <h2>Watchlist</h2>
                        <div className="adminTable">
                          {settings && settings.properties && watchlist && index === WATCHLIST_TAB &&
                            <AdminWatchlist {...this.props}/>}
                        </div>
                    </TabPanel>
                    <TabPanel>
                      <h2>Users</h2>
                      { settings && settings.properties && index === USERS_TAB &&
                        <div className="adminTable">
                          <UserRoles {...this.props}/>
                        </div>
                      }
                    </TabPanel>
                    <TabPanel>
                      <h2>Event Import</h2>
                      <div className="adminTable">
                        {settings && settings.properties && index === CUSTOM_EVENTS_TAB &&
                          <CustomEventsEditor {...this.props}/>}
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <h2>Trusted Sources</h2>
                      <div className="adminTable">
                        {settings && settings.properties && index === TRUSTED_SOURCES_TAB &&
                          <div>
                            <TrustedSources {...this.props}/>
                          </div>}
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <h2>Blacklisted Terms <FontIcon className="fa fa-question" data-tip data-for='blacklist' data-place='right' color={blue500} hoverColor={blue700}/></h2>
                      <ReactTooltip id='blacklist'>
                        <span>Provide a comma delimited list of blacklist terms, i.e. hunger, flood, hurricane. If an event matches all the blacklist terms, then it will be discarded.</span>
                      </ReactTooltip>
                      <div className="adminTable">
                        {settings && settings.properties && index === BLACKLIST_TAB &&
                          <BlacklistEditor {...this.props}/>}
                      </div>
                    </TabPanel>
                    <TabPanel>
                      <div className="adminTable">
                        {settings && settings.properties && index === STREAM_TAB &&
                          <StreamEditor {...this.props}/>}
                      </div>
                    </TabPanel>
                  </Tabs>
                  { shouldShowRestartPipelineButton ?
                  <div className="row adminContainer">
                    <Button className="pull-right" bsStyle="danger" onClick={this.openModal}>Restart Pipeline</Button>
                  </div> : null }
                </div>
              </div>
            </div>
          </div>
        </div>
        <Modal show={showModal} onHide={this.closeModal}>
          <Modal.Header closeButton>
            <Modal.Title>Are you sure you want to restart the pipeline?</Modal.Title>
          </Modal.Header>
          <Modal.Body>
            Restarting the pipeline will prevent the intake of events for <b>several minutes</b> until the restart is complete.
          </Modal.Body>
          <Modal.Footer>
            <Button bsStyle="primary" onClick={this.restartPipelineAndCloseModal}>Yes, I&#8217;m sure</Button>
            <Button onClick={this.closeModal}>No, don&#8217;t restart</Button>
          </Modal.Footer>
        </Modal>
      </div>
    )
  }
}

export default Admin;