const _ = require('lodash');

var batting = {
  twenty20: {
    "50": 2,
    "100": 3
  },
  ODIs: {
    "50": 10,
    "100": 20
  },
  tests: {
    "50": 10,
    "100": 20
  }
};

var bowling = {
  twenty20: {
    "wkts": 2,
    "matches": 3
  },
  ODIs: {
    "wkts": 10,
    "matches": 20
  },
  tests: {
    "wkts": 10,
    "matches": 20
  }
};
var requiredFields = ["twenty20", "ODIs", "tests"];

var result = requiredFields.reduce((obj, field) => {
  obj[field] = {
    batting: batting[field],
    bowling: bowling[field]
  }
  return obj;
}, {});

console.log(result);
