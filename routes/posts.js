const
  path = require('path'),
  express = require('express'),
  multer = require('multer'),
  {nanoid} = require('nanoid'),
  isAuth= require('../middlewares/isAuth'),
  PostService = require('../services/post'),
  Post = require('../models/Post'),
  config = require('../config'),
  router = express.Router();

const storage = multer.diskStorage({
  destination: (req, file, cd) => cd(null, config.uploadPath),
  filename: (req, file, cd) => cd(null, nanoid() + path.extname(file.originalname))
});
const upload = multer({storage});

router.post('/', isAuth, upload.single('postImage'), async (req, res) => {
  try {
    let
      user = req.currentUser,
      text = req.body.text,
      postImage = req.body.postImage,
      tags = req.body.tags;

    if(req.file) postImage = req.file.filename;

    const service = new PostService();
    const post = await service.addPost(user, text, tags, postImage);

    res.send(post)
  } catch (e) {
    console.log(e);
    res.status(500).send(e)
  }
});

router.get('/', isAuth, async (req, res) => {
  try {
    const
      user = req.currentUser;

    const service = new PostService();
    const posts = await service.fetchPosts(user);

    res.send(posts)
  } catch (e) {
    res.status(500).send(e)
  }
});

router.get('/tags', isAuth, async (req, res) => {
  try {
    const tags = await Post.distinct('tags');

    res.send(tags);
  } catch (e) {
    res.status(500).send(e)
  }
});

module.exports = router;