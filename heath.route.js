'use strict';

const 
    Handler = {}
  , Pkg = require('../../package.json')
  , Joi = require('joi');

var current = {
  serviceStart: new Date(),
  alive: 0,
  pid: process.pid,
  name: Pkg.name,
  version: Pkg.version,
  baseUrl: process.env.BASEURL_SITE
};

function updateCodeCount(code) {
  try {
    const type = code.toString()[0];
    switch (type) {
      case "2":
        current.Status2xx++;
        break;
      case "4":
        current.Status4xx++;
        break;
      case "5":
        current.Status5xx++;
        break;
    }
  } 
  catch (err) {
    current.Status4xx++;
  }
}

module.exports = {
  route: {
    path: '/health',
    method: 'GET',
    handler: (request, reply) => {
      const currentTime = new Date();
      current.alive = (currentTime.getTime() - current.serviceStart.getTime()) / 1000;
      reply(current);
    },
    config: {
      auth: false,
      tags: ['Health Check', 'api'],
      description: 'Used for testing the health of the system.',
      response: {
        schema: Joi.object({
          serviceStart: Joi.date().description('UTC time the service was started'),
          alive:        Joi.number().description('Number of seconds it has been running for'),
          pid:          Joi.number().description('The OS processes id running on'),
          name:         Joi.string().description('The name of the serivce as defined in package.json'),
          version:      Joi.string().description('The version of the serivce as defined in package.json'),
          baseUrl:      Joi.string().description('The base url where the service has be referenced from'),
          Status2xx:    Joi.number().description('The number of 2xx status codes returned'),
          Status4xx:    Joi.number().description('The number of 4xx status codes returned'),
          Status5xx:    Joi.number().description('The number of 5xx status codes returned')
        })
      }
    }
  },

  updateCodeCount: updateCodeCount,

  includeStatus: (flag) => {
    if (flag) {
      current['Status2xx'] = 0;
      current['Status4xx'] = 0;
      current['Status5xx'] = 0;
    } 
    else {
      delete current.Status2xx;
      delete current.Status4xx;
      delete current.Status5xx;
    }
  }
};
