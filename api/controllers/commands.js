var commands = require('express').Router();
var device = require('../models/device.js');
var db = require('../common/db.js');

commands.post('/create/:platform', function(req,res) {
  //Make sure the user has permissions
  if (!req.user || !hasPermission(req.user, 'can_mdm')){
    //This user isn't authorized, exit
    return res.status(401).send({ error : "User has no permissions" });
  }
  if (!hasPermission(req.user, 'is_admin') && req.body.mdmCommand == 'EraseDevice'){
    //This user isn't authorized, exit
    return res.status(401).send({ error : "The user must be an admin for the EraseDeviceCommand" });
  }
  //Make sure the request if valid
  if (!req.body.mdmCommand || !req.body.deviceType || req.body.deviceList.length < 1 || !req.params.platform){
    return res.status(400).send({ error : "Missing required fields or invalid request" });
  }
  //Send the MDM commands
  device.sendMDMCommandToDevices(req.body.deviceList, req.body.mdmCommand, req.body.options, req.params.platform)
  .then(function(results){
    return res.status(200).send({ status : "success" });
  })
  .catch(error => {
    //Show some helpful errors if it's an error from the JSS
    if ('req_data' in error && 'url' in error && 'res_data' in error){
      return res.status(500).send({ status : "failed", error : error});
    } else {
      return res.status(500).send({ status : "failed"});
    }
  });
});

function hasPermission(userObject, permisison){
  return (userObject[permisison] == 1 || userObject[permisison] == true);
}

module.exports = commands;
