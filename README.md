# graph-query-builder
Designed for Github API v4 usage

### Install
npm install graph-query-builder

### API

const QBuilder = require('graph-query-builder');

#### constructor

`new QBuilder(name: string, options: object);`

`name` - connection name
`options` - connection options

```
const query = new QBuilder('organization', {
    args: [{ name: 'testOrg'}],
    fields: ['name'],
    connections: {
        repository: {
            connections: {
                nodes: {
                    fields: ['name', 'id']
                }
            }
        }
    }
    });
```

### addConnection(path: string, connection: string, options: object)

Adds connection to the path, if exists. Path should be splitted by dots `organization.repository`

Example:

```
const query = new QBuilder('organization', {
    connections: {
        repository: {
            connections: {
                pullRequests: {}
            }
        }
    }
    });

query.addConnection('organization.repository.pullRequests', 'author', { fields: ['name', 'login']});
```

The call above will create connection inside `pullRequests` with specified options.

### stringify()

Will stringify query, so you will be able to pass it to the body fo your POST request.
```
const query = new QBuilder('organization', {
      args: [{ login: 'test' }],
      connections: {
        'alias:repository': {
          args: [{ name: 'repoTest' }],
          connections: {
            pullRequests: {
              fields: ['id']
            }
          }
        }
      }
    });

query.stringify();
```

Will output JSON:
```
{"query":"{organization(login:\"test\"){alias:repository(name:\"repoTest\"){pullRequests{id}}}}"}
```

### Connection options

Structure:
```
const options = {
    args: [{
        name: 'test' // for string arguments, will output JSON "name:\"test\""
        }, {
            first: 1000 // number
        }, {
            states: {
                type: 'enum',
                value: ['ENUM_VALUE1', 'ENUM_VALUE2'] for enum, will output "states: [ENUM_VALUE1,ENUM_VALUE2]"
            }
        }, {
            state: {
                type: 'enum',
                value: 'ENUM_VALUE'
            }
        }
    ],
    fields: [], // string array
    connections: {
        repository: { // key - connectionName
            args: [],
            fields: [],
            connections: {}
        },
        alias:repository: { // You can use aliases also
            args: [],
            fields: [],
            connections: {}
        }
    }
}
```
