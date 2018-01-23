import React from 'react';
import IconButton from 'material-ui/IconButton/IconButton';
import Map from 'material-ui/svg-icons/maps/map';
import { fullWhite } from 'material-ui/styles/colors';

export default class MapBoundingReset extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      expanded: false
    };
  }

  onClick = () => {
    this.props.onClick();
    this.setState({
      expanded: !this.state.expanded
    });
  }

  render() {
    const { tooltipOn, tooltipOff, tooltipPosition } = this.props;
    const { expanded } = this.state;

    return (
      <div>
        <IconButton tooltip={expanded ? tooltipOff : tooltipOn} onClick={this.onClick} tooltipPosition={tooltipPosition}>
          {expanded ? <Map color={fullWhite} /> : <Map color={fullWhite} />}
        </IconButton>
      </div>
    );
  }
}
