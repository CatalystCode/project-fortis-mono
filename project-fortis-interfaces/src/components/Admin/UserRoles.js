import React from 'react';
import { DataGrid } from './DataGrid';
import { getColumns } from './shared';

class UserRoles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
    };

    this.getUserRolesColumns = this.getUserRolesColumns.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  componentDidMount() {
    this.props.flux.actions.ADMIN.load_users();
  }

  getUserRolesColumns() {
    const columnValues = [
      {editable: true, filterable: true, sortable: true, key: "identifier", name: "Identity"},
      {editable: true, filterable: true, sortable: true, key: "role", name: "Role"}
    ];

    return getColumns(columnValues);
  }

  handleSave(users) {
    this.props.flux.actions.ADMIN.save_users(users);
  }

  handleRemove(users) {
      this.props.flux.actions.ADMIN.remove_users(users);
  }

  render() {
    return (

      /*
      this.getUserRolesColumns().length > 0 ?
        <DataGrid
          rowHeight={40}
          minHeight={500}
          rowKey="identifier"
          handleSave={this.handleSave}
          handleRemove={this.handleRemove}
          columns={this.getUserRolesColumns()}
          rows={[{"identifier": "bob", "role": "admin"}]} />
        : <div />
      */
      <p>does this work</p>
    );
  }
}

export default UserRoles;