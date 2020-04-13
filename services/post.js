const Post = require('../models/Post');

module.exports = class PostService {
  constructor() {
  }

  async addPost(user, text, tags, postImage) {
    return new Promise(async (resolve, reject) => {
      try {

        let data = {
          user: user._id,
        };

        if (!text && postImage !== 'null') {
          data.postImage = postImage
        } else if (!!text && postImage === 'null') {
          data.text = text
        } else if(!!text && postImage !== 'null') {
          data.postImage = postImage;
          data.text = text
        } else {
          return reject({message: 'text or post image must be filled'})
        }

        if(!!tags) {
          data.tags = JSON.parse(tags)
        }

        const post = await Post.create(data);

        resolve({...post})
      } catch (e) {
        reject(e)
      }
    })
  }

  async fetchPosts(user) {
    return new Promise(async (resolve, reject) => {
      try {
        const posts = await Post.find({
          $or: [
            {user: { $in: user.subscriptions}},
            {user: user._id}
          ]
        }).populate('user', ['avatarImage', 'displayName', 'facebookId']);

        resolve(posts.reverse())
      } catch (e) {
        console.log(e);
        reject(e)
      }
    })
  }
};