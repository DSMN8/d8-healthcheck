'use strict';
const route = require('./heath.route');

function setOption(options, name) {
  if (options.hasOwnProperty(name) === false) 
    options[name] = false;
  return options;
}

function initialiseOptions(options) {
  if (options === undefined)
    options = {};

  options = setOption(options, 'recordCodes');
  options = setOption(options, 'redirect');
  options = setOption(options, 'proxy');

  return options;
}

module.exports.register = function (server, options, next) {
  options = initialiseOptions(options);

  if (options.recordCodes) {
    route.includeStatus(true);

    server.ext('onPreResponse', function (request, reply) {
      let statusCode = request.response.statusCode;

      if (request.response.hasOwnProperty('isBoom') && statusCode === undefined) 
        statusCode = request.response.output.statusCode;
      
      route.updateCodeCount(statusCode);

      return reply.continue();
    });
  } 
  else 
    route.includeStatus(false);

  if (options.redirect) {
    server.ext('onRequest', function (request, reply) {
      let redirect = options.proxy !== false
        ? request.headers['x-forwarded-proto'] === 'http'
        : request.server.info.protocol === 'http';

      // Ok for AWS EC2 Elastic beanstalk setup we want http for the health check to pass through
      if (route.route.path.toLowerCase() === request.url.path ) 
        redirect = false;

      if (redirect) {
        return reply()
          .redirect('https://' + request.headers.host + request.url.path)
          .code(301)
      }

      reply.continue()
    });
  }

  server.route(route.route);
  
  next();
};

module.exports.register.attributes = {
  pkg: require('./package.json')
};
