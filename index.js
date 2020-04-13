const
  express = require('express'),
  mongoose = require('mongoose'),
  config = require('./config'),
  users = require('./routes/users'),
  posts = require('./routes/posts'),
  app = express();
const cors = require("cors");

app.use(express.json());
app.use(express.static('public'));
app.use(cors());

const run = async () => {
  await mongoose.connect(
    'mongodb://localhost:27017/SocialNetwork',
    {
      useNewUrlParser: true,
      useUnifiedTopology: true,
      useCreateIndex: true
    }
  );

  app.use('/users', users);
  app.use('/posts', posts);

  app.listen(config.port, async () => {
    console.log(`HTTP server start on ${config.port} port!`);
  })
};

run().catch(error => {
  console.error(error);
});