const mongoose = require('mongoose');

const PostSchema = mongoose.Schema({
  user: {
    type: mongoose.Schema.Types.ObjectId,
    ref: 'User',
    required: true
  },
  date: {
    type: Date,
    default: new Date().toISOString()
  },
  text: String,
  postImage: String,
  tags: [String]
});

module.exports = mongoose.model('Post', PostSchema);