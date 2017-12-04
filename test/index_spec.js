const should = require('chai').should();
const GraphQlBuilder = require('../index');

describe("Initialize", function() {
  before(function() {
    this.instance = new GraphQlBuilder();
    this.connectionInstance = new GraphQlBuilder('organization', { args: [{ login: 'abc' }] });
  });

  it("should create instance with query", function() {
    this.instance.query.should.be.empty;
  });

  it("should be possible to create with connection", function() {
    const query = this.connectionInstance.query;

    query.organization.should.exist;
  });

  it ("should fill connection with parameters", function() {
    const query = this.connectionInstance.query;

    query.organization.args.should.be.deep.equal([{ login: 'abc' }]);
  });
});

describe("Modify", function() {
  before(function() {
    this.connection = {
      args: [{ name: 'repoName' }],
      fields: [],
      connections: {
        pullRequests: {
          args: [{ first: 10 }],
          fields: [],
          connections: {
            author: {
              fields: ['name']
            }
          }
        }
      }
    };

    this.instance = new GraphQlBuilder('organization', { args: [{ login: 'abc' }] });
    this.instance.addConnection('organization', 'repository', this.connection);
    this.instance.addConnection('organization', 'aliasName:repository', this.connection);
  });

  it("should be possible to add connection", function() {
    this.instance.query.organization.connections.repository.should.be.deep.equal(this.connection);
  });

  it("should be possible to add connection with alias", function() {
    this.instance.query.organization.connections['aliasName:repository'].should.be.deep.equal(this.connection);
  });

  it("should be possible to add connection to a nested path", function() {
    const connection = { fields: ['name'] };
    this.instance.addConnection('organization.repository.pullRequests', 'repository', connection);

    this.instance.getConnection('organization.repository.pullRequests.repository').should.be.deep.equal({
      args: [],
      connections: {},
      fields: connection.fields
    });
  });

  it("should be possible to add arguments to the connection", function() {
    this.instance.addArgs('organization.repository', [{name2: 'test' }]);
    this.instance.getConnection('organization.repository').args.should.be.deep.equal(this.connection.args.concat([ {name2: 'test' } ]));
  });
});

describe("Stringify", function() {
  before(function() {
    this.instance = new GraphQlBuilder();
  });

  it("should be possible to build args", function() {
    const args = [{ first: 100 }, { labels: ['Review Requested'] }, {
      states: {
        type: 'enum',
        value: ['OPEN'],
      }
    }];

    this.instance.buildArgs(args, false).should.be.equal('(first:100,labels:"Review Requested",states:[OPEN])');
  });

  it ("should be possible to build single enum", function() {
    const args = [{ state: { type: 'enum', value: 'OPEN' } }];

    console.log(this.instance.buildArgs(args, false));

  });

  it("should be possible to build fields", function() {
    this.instance.buildFields(['name', 'name2', 'name3']).should.be.eql('name,name2,name3');
  });

  it("should be possible to build connections", function() {
    const connection = {
      connections: {
        author: {
          callable: true,
          fields: ['name', 'login']
        },
        nodes: {
          fields: ['name_parent', 'value']
        }
      }
    }

    this.instance.buildConnections('alias:name', connection).should.be.equal('alias:name{author(){name,login},nodes{name_parent,value}}');
  });

  it("should be possible to stringify query", function() {
    const instance = new GraphQlBuilder('organization', {
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

    instance.stringify().should.be.equal('{"query":"{organization(login:\\\"test\\\"){alias:repository(name:\\\"repoTest\\\"){pullRequests{id}}}}"}');
  });
});
