const express = require('express');
const axios = require('axios');
const hbs = require('hbs');
const {mongoose} = require('./server/db/mongoose');
const {Player} = require('./server/models/player');
const _ = require('lodash');


var app = express();
const bodyParser= require('body-parser');
app.use(bodyParser.urlencoded({extended: true}));

const port = process.env.PORT || 3000;


app.set('view engine', 'hbs');
app.use(express.static(__dirname + '/resources'));

hbs.registerPartials(__dirname + '/views/partials');

hbs.registerHelper('ifCon', (x, y, options) => {
  if(x === y)
    return options.fn(this);
   return options.inverse(this);
});


hbs.registerHelper('math', (x, operator, y, options) => {
  x = parseFloat(x);
  y = parseFloat(y);

  return{
    "+": x + y,
    "-": x - y,
    "*": x * y,
    "/": x / y
  }[operator];
});

app.get('/', (req, res) => {
  res.render('index.hbs', {
    directory: __dirname
  });

});

app.post('/submitid', (req, res) => {
  var id = parseInt(req.body.id);
  var key = "NpWBYl8ujFW4ZmN0LoFRfcCITFn1";
  console.log(id);
  // var cricURI = `http://cricapi.com/api/playerStats?pid=${id}&apikey=NpWBYl8ujFW4ZmN0LoFRfcCITFn1`;
  var cricURI = `http://cricapi.com/api/playerStats`
  var cricObj = {
    pid: id,
    apikey: key
  }
  axios.post(cricURI, cricObj).then((response) => {
    if(response.data.error === "error"){
      throw new Error('Unable to find that address');
    }
    var cricresult = response.data;
    // console.log(JSON.stringify(result, null, 2));
    var player = new Player({
      name: cricresult.name,
      userid: id,
      bowlingStyle: cricresult.bowlingStyle,
      battingStyle: cricresult.battingStyle,
      playerRole: req.body.playerRole,
      imageURL: (req.body.imageurl || cricresult.imageURL),
      batting: JSON.stringify(cricresult.data.batting),
      bowling: JSON.stringify(cricresult.data.bowling),
      price: req.body.price
    });
    player.save().then((doc) => {
      res.render('index.hbs', {
        name: cricresult.name
      });
    }, (e) => {
      res.status(400).send(e);
    });


  }).catch((errorMessage) => {

    res.send({
      error: errorMessage.message
    });


});;

});

app.get('/player', (req, res) => {
  Player.find({}, 'name userid playerRole').then((player) => {
    if(!player){
      res.sendStatus(404).send();
    }
    console.log(player);
    var roles = ["batsman", "bowler", "all-rounder", "wicket-keeper", "legend"];
    var returnG = roles.reduce((obj, role) => {
      obj[role] = player.filter((p) => {
        return p.playerRole.toLowerCase() === role;
      });
      return obj;
    }, {});
    console.log(returnG);
    res.render('players.hbs', {
      player: returnG,
    });
  }).catch((e) => {

    res.sendStatus(400);
  });
});

app.get('/player/editId', (req, res) => {
  res.render('editId.hbs');
});

app.post('/player/editId', (req, res) => {
  var obj = {
    name: req.body.name,
    userid: parseInt(req.body.id)
  };
  Player.find({name: obj.name}).then((player) => {
    if(!player){
      res.sendStatus(404).send();
    }
    Player.findOneAndUpdate({"name": obj.name}, {"userid": obj.userid}).then((player) => {
      if(!player){
        res.status(404).send();
      }
      res.render('editId.hbs');
    }).catch((err) => {
      res.status(400).send();
    });
    res.render('editId.hbs');
  }).catch((e) => {

    res.sendStatus(400);
  });


});


app.get('/player/:id', (req, res) => {
  var id = req.params.id;
  Player.findOne({userid: id}).then((player) => {
    if(!player){
      res.redirect('/player/' + (parseInt(id)+1));
    }
    // console.log(JSON.parse(player.batting));
    var resPlayer = {
      batting: JSON.parse(player.batting),
      bowling: JSON.parse(player.bowling)
    }
    // console.log(resPlayer.batting["ODIs"]);
    var requiredFields = ["twenty20", "ODIs", "tests", "firstClass", "listA"];
    var requiredParameters = {
      batting: ['Ave', 'SR', '50', '100', '6s', '4s', 'Mat'],
      bowling: ['Ave', 'SR', 'Econ', 'Wkts', 'Mat']
    };
    var reqArray;
    var resPlayer2 = {};
    resPlayer2['batting'] = _.reduce(requiredParameters.batting, (obj, parameter) => {
      obj[parameter] = obj[parameter] || [];
      reqArray = [];
      requiredFields.every((requiredField) => {
        if(resPlayer.batting[requiredField]){
          var val = resPlayer.batting[requiredField];
          obj[parameter].push(val[parameter]);
          reqArray.push(requiredField);
        }
        if(reqArray.length === 3){
          return false;
        }
        return true;
      })
      return obj;
    }, {});
    resPlayer2['bowling'] = _.reduce(requiredParameters.bowling, (obj, parameter) => {
      obj[parameter] = obj[parameter] || [];
      reqArray = [];
      requiredFields.every((requiredField) => {
        if(resPlayer.bowling[requiredField]){
          var val = resPlayer.bowling[requiredField];
          obj[parameter].push(val[parameter]);
          reqArray.push(requiredField);
        }
        if(reqArray.length === 3){
          return false;
        }
        return true;

      })
      return obj;
    }, {});
    console.log(reqArray);
    // console.log(resPlayer2);
    // resPlayer.batting.ODIs = _.pick(resPlayer.batting.ODIs, ['50', '100', 'St', 'Ct', 'Mat']);
    // resPlayer.bowling.ODIs = _.pick(resPlayer.bowling.ODIs, ['SR', 'Econ', 'Ave', 'Wkts', 'Mat']);
    // var odi = _.pick(resPlayer, ['batting', 'bowling']);

    res.render('result.hbs',{
      name: player.name,
      userid: parseInt(player.userid),
      imageURL: player.imageURL,
      battingStyle: player.battingStyle,
      bowlingStyle: player.bowlingStyle,
      batting: resPlayer2.batting,
      bowling: resPlayer2.bowling,
      price: player.price,
      reqArray: reqArray,
      playerRole: player.playerRole
    });
  }).catch((e) => {

    res.sendStatus(400);
  });;
});

app.listen(port, () => {
  console.log(`Server is up on port ${port}`);
});
