import React from 'react';
import Snackbar from 'material-ui/Snackbar';
import groupBy from 'lodash/groupBy';
import intersectionBy from 'lodash/intersectionBy';
import differenceBy from 'lodash/differenceBy';
import { DataGrid } from './DataGrid';
import { getColumns } from './shared';
const { Editors, Formatters } = require('react-data-grid-addons');
const { DropDownEditor } = Editors;
const { DropDownFormatter } = Formatters;

const roles = ['user', 'admin'];

class UserRoles extends React.Component {
  constructor(props) {
    super(props);

    this.state = {
      open: false,
      message: ''
    };

    this.getUserRolesColumns = this.getUserRolesColumns.bind(this);
    this.handleSave = this.handleSave.bind(this);
    this.handleRemove = this.handleRemove.bind(this);
  }

  componentDidMount() {
    console.log(this.props.authInfo);
    this.props.flux.actions.ADMIN.load_users()
  }

  getUserRolesColumns() {
    const columnValues = [
      {editable: true, filterable: true, sortable: true, key: "identifier", name: "Identity"},
      {editable: false, filterable: true, sortable: true, key: "role", name: "Role", editor: <DropDownEditor options={roles}/>, formatter: <DropDownFormatter options={roles}/>}
    ];

    return getColumns(columnValues);
  }

  handleSave(users) {
    this.props.flux.actions.ADMIN.add_users(users, (err, res) => {
      if (!err) {
        const adminRowsMissingUserRole = this.getAllAdminRowsWithoutUserRole();
        if (adminRowsMissingUserRole.length > 0) this.alertAddUserOnAddAdmin(adminRowsMissingUserRole);
      }
    });
  }

  handleRemove(users) {
    this.props.flux.actions.ADMIN.remove_users(users, (err, res) => {
      if (!err) {
        const adminRowsMissingUserRole = this.getAllAdminRowsWithoutUserRole();
        if (adminRowsMissingUserRole.length > 0) this.alertDeleteAdminOnDeleteUser(adminRowsMissingUserRole);
      }
    });
  }

  getAllAdminRowsWithoutUserRole() {
    const allUsers = this.props.users;
    const usersGroupedByRole = groupBy(allUsers, "role");
    const admin = usersGroupedByRole.admin;
    const users = usersGroupedByRole.user; 
    const adminUserPairs = intersectionBy(admin, users, 'identifier');
    const allAdminWithoutUserRole = differenceBy(admin, adminUserPairs, 'identifier');
    return allAdminWithoutUserRole;
  }

  alertDeleteAdminOnDeleteUser(admin) {
    const adminIdentities = admin.map(a => a.identifier);
    this.setState({
      open: true,
      message: `Would you also like to delete ${adminIdentities} with no user role?`
    });
  }

  alertAddUserOnAddAdmin(admin) {
    const adminIdentities = admin.map(a => a.identifier);
    this.setState({
      open: true,
      message: `Added user role to ${adminIdentities}.`
    });
  }

  render() {
    return (
      this.getUserRolesColumns().length > 0 ?
        <div>
          <DataGrid
            rowHeight={40}
            minHeight={500}
            rowKey="id"
            guidAutofillColumn="id"
            handleSave={this.handleSave}
            handleRemove={this.handleRemove}
            columns={this.getUserRolesColumns()}
            rows={this.props.users} />
          <Snackbar
            open={this.state.open}
            message={this.state.message}
            autoHideDuration={5000}
            onRequestClose={this.handleRequestClose}
          />
        </div>
        : <div />
    );
  }
}

export default UserRoles;