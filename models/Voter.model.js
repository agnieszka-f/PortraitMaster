const mongoose = require('mongoose');

const VoterSchema = new mongoose.Schema({
    user: { type: String, required: true },
    votes: {type: Array},
  });
  
  module.exports = mongoose.model('Voter', VoterSchema);