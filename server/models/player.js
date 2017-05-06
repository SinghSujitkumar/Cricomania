const mongoose = require('mongoose');

var Player = mongoose.model('Player', {
    name: {
      type: String,
      required: true,
    },
    userid: {
      type: Number,
      required: true,
      unique: true,
    },
    bowlingStyle: {
      type: String,
    },
    battingStyle: {
      type: String,
    },
    imageURL: {
      type: String,
      unique: true
    },
    playerRole: {
      type: String,
      required: true
    },
    batting: {
      type: String,
      required: true
    },
    bowling: {
      type: String,
      required: true
    },
    price: {
      type: String,
      required: true
    }
});


module.exports = {Player};
