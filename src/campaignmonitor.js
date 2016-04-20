var api_key = process.env.NESTOR_CAMPAIGNMONITOR_API_KEY;
var client_id = process.env.NESTOR_CAMPAIGNMONITOR_CLIENT_ID;
var list_id = process.env.NESTOR_CAMPAIGNMONITOR_LIST_ID;
var CampaignMonitor = require('createsend-node');

var auth = {
  apiKey: api_key
};

module.exports = function(robot) {
  var subscribeToList = function(msg, done) {
    var api, email_address, err, error;
    email_address = msg.match[2];

    try {
      api = new CampaignMonitor(auth);
    } catch (error) {
      err = error;
      console.log(err);
      return;
    }
    api.subscribers.addSubscriber(list_id, {
      EmailAddress: email_address
    }, function(err, data) {
      if (err) {
        msg.send(formatErrorMessage(err), done);
      } else {
        msg.send("You successfully subscribed " + email_address + ".", done);
      }
    });
  };

  var unsubscribeFromList = function(msg, done) {
    var api, email_address, err, error;
    email_address = msg.match[2];
    try {
      api = new CampaignMonitor(auth);
    } catch (error) {
      err = error;
      console.log(err);
      return;
    }
    api.subscribers.deleteSubscriber(list_id, email_address, function(err, data) {
      if (err) {
        msg.send(formatErrorMessage(err), done);
      } else {
        msg.send("You successfully unsubscribed " + email_address + ".", done);
      }
    });
  };

  var latestCampaign = function(msg, done) {
    try {
      api = new CampaignMonitor(auth);
    } catch (error) {
      err = error;
      console.log(err);
      return;
    }

    api.clients.getSentCampaigns(client_id, function(err, data) {
      var campaign_name, cid;
      if (err) {
        msg.send(formatErrorMessage(err), done);
      } else {
        cid = data[0]['CampaignID'];
        campaign_name = data[0]['Name'];
        api.campaigns.getSummary(cid, function(err, data) {
          if (err) {
            msg.send(formatErrorMessage(err), done);
          } else {
            msg.send("Last campaign \"" + campaign_name + "\" was sent to " + data['Recipients'] + " subscribers (" + data['UniqueOpened'] + " opened, " + data['Clicks'] + " clicked, " + data['Unsubscribed'] + " unsubscribed)", done);
          }
        });
      }
    });
  };

  var formatErrorMessage = function(err) {
    console.log(err);
    if (err.Message) {
      return "Uh oh, something went wrong: " + err.Message;
    } else {
      err = err.toString().substring(0, 100);
      return "Uh oh, something went wrong: " + err;
    }
  };

  robot.respond(/(campaignmonitor|cm) subscribe (.+@.+)/i, { suggestions: ["campaignmonitor subscribe <email>"] }, function(msg, done) {
    subscribeToList(msg, done);
  });

  robot.respond(/(campaignmonitor|cm) unsubscribe (.+@.+)/i, { suggestions: ["campaignmonitor unsubscribe <email>"] }, function(msg, done) {
    unsubscribeFromList(msg, done);
  });

  robot.respond(/(campaignmonitor|cm) latest$/i, { suggestions: ["campaignmonitor latest"] }, function(msg, done) {
    latestCampaign(msg, done);
  });

};
