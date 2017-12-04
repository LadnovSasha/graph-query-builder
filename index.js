const _ = require('lodash');
const utils = require('./utils/stringify');


module.exports = class GraphQLBuilder {
  constructor(connection, options) {
    this.query = {};

    if (connection) {
      this.query[connection] = _.pick(options, ['args', 'connections', 'fields'])
    }
  }

  addArgs(path, args = []) {
    let connection = this.getConnection(path);

    if (!_.isArray(connection.args)) {
      throw new Error('Array expected');
    }

    connection.args = connection.args.concat(args);
  }

  addConnection(path, connection, { args = [], connections = {}, fields = [] }) {
    const basepath = path ? this.getConnection(path) : this.query;

    if (!basepath)
      throw new Error('Connection not found');

    if (!basepath.connections)
      basepath.connections = {};

    basepath.connections[connection] = { args, connections, fields }
  }

  getConnection(path) {
    path = path.replace(/\./g, '.connections.');

    return _.get(this.query, path);
  }

  buildArgs(args, callable) {
    const empty = callable ? '()' : '';
    const argsQuery = args.map((value) => utils.stringifyObject(value)).join(',');

    return argsQuery ? `(${argsQuery})` : empty;
  }

  buildFields(fields) {
    return fields.join(',');
  }

  buildConnections(name, { args = [], connections = {}, fields = [], callable = false }) {
    if (!name)
      return '';

    let connectionFields = Object.keys(connections).map((key) => {
      return this.buildConnections(key, connections[key]);
    });
    const fieldsQuery = this.buildFields(fields);

    if (fieldsQuery)
      connectionFields = connectionFields.concat(fieldsQuery);

    return `${name}${this.buildArgs(args, callable)}{${connectionFields.join(',')}}`
  }

  buildQuery(names) {
    let query = '';

    names.forEach((key) => {
      const values = this.query[key];
      query += this.buildConnections(key, values);
    });

    return `${query}`;
  }

  stringify() {
    const query = this.buildQuery(Object.keys(this.query));

    return JSON.stringify({
      query: `{${query}}`
    });
  }
}
