const
  argon2 = require('argon2'),
  User = require('../models/User'),
  crypto = require('crypto'),
  {nanoid} = require('nanoid');

module.exports = class AuthService {
  constructor() {
  }

  async login(username, password) {
    return new Promise(async (resolve, reject) => {
      try {
        const user = await User.findOne({username: username});
        if (!user) {
          throw new Error('Username or password not correct!');
        } else {
          const correctPassword = await argon2.verify(user.password, password);
          if (!correctPassword) {
            throw new Error('Username or password not correct!');
          }

          const token = this.createJwt(user);
          await User.updateOne({username}, {
            token: token
          });

          resolve({
            user: {
              username: user.username,
              displayName: user.displayName,
              avatarImage: user.avatarImage,
              role: user.role,
            },
            token
          })
        }
      } catch (e) {
        reject(e)
      }
    })
  }

  async logout(token) {
    return new Promise(async (resolve, reject) => {
      try {
        const message = {message: 'Logout success'};

        if (!token) resolve(message);

        const user = await User.findOne({token});

        if (!user) resolve(message);

        user.token = this.createJwt();
        await user.save();

        resolve(message);
      } catch (e) {
        reject(e)
      }
    })
  }

  async singUp(username, displayName, password, avatarImage) {
    return new Promise((async (resolve, reject) => {
      try {
        if (!password) {
          return reject({message: 'User validation failed: password: Path `password` is required.'})
        }

        const salt = crypto.randomBytes(32);
        const hash = await argon2.hash(password, {salt});
        const token = this.createJwt({name: username});

        const user = await User.create({
          username: username,
          displayName: displayName,
          password: hash,
          avatarImage: avatarImage,
          token: token,
        });

        resolve({
          user: {
            username: user.username,
            displayName: user.displayName,
            avatarImage: user.avatarImage,
            role: user.role,
          },
          token
        })
      } catch (e) {
        if (e.name === 'MongoError') {
          return reject({message: 'A user with that username already exists'})
        }
        reject(e)
      }
    }))
  }

  async editUser(user, username, displayName, password, avatarImage) {
    return new Promise(async (resolve, reject) => {
      try {

        if (username) {
          const editableUser = await User.findOne({username});

          if (editableUser) {
            return reject({message: 'A user with the same username already exists'})
          }

          if (user.facebookId && !user.changed) {
            await User.updateOne({_id: user._id}, {username, changed: true})
          } else if (user.facebookId && user.changed) {
            return reject({message: 'the facebook user can only change the username once'});
          } else {
            await User.updateOne({_id: user._id}, {username})
          }
        }

        if (displayName) await User.updateOne({_id: user._id}, {displayName});

        if (password) {
          if (user.facebookId) {
            reject({message: 'password change not available'});
          }

          const salt = crypto.randomBytes(32);
          password = await argon2.hash(password, {salt});

          await User.updateOne({_id: user._id}, {password})
        }

        if (avatarImage !== 'null') await User.updateOne({_id: user._id}, {avatarImage});

        const editedUser = await User.findOne({_id: user._id});

        let data = {
          username: editedUser.username,
          displayName: editedUser.displayName,
          avatarImage: editedUser.avatarImage,
          role: editedUser.role,
          token: editedUser.token
        };

        if (user.facebookId) {
          data.facebookId = editedUser.facebookId;
          data.changed = editedUser.changed
        }

        resolve(data)
      } catch (e) {
        reject(e)
      }
    })
  }

  async subscribe(user, subscriber) {
    return new Promise(async (resolve, reject) => {

      try {
        const subscriptionPurpose = await User.findOne({username: user});

        if(!subscriptionPurpose || subscriptionPurpose.username === subscriber.username) {
          return reject({message: 'user with this username not exists'})
        }

        const index = subscriber.subscriptions.findIndex(id => {
          return id.toString() === subscriptionPurpose._id.toString()
        });

        if(index !== -1) {
          return reject({message: 'you are already subscribed to this user'})
        }

        await User.updateOne({_id: subscriber._id}, {
          subscriptions: [...subscriber.subscriptions, subscriptionPurpose._id]
        });

        resolve(subscriptionPurpose)
      } catch (e) {
        console.log(e);
        reject(e)
      }
    })
  }

  async unsubscribe(user, subscriber) {
    return new Promise(async (resolve, reject) => {
      try {

        const unsubscribeUser = await User.findOne({username: user});

        if(!unsubscribeUser) {
          return reject({message: 'user with this username not exists'})
        }

        await User.updateOne({_id: subscriber._id}, { $pullAll: {subscriptions: [unsubscribeUser._id] } });

        resolve(unsubscribeUser)
      } catch (e) {
        console.log(e);
        reject(e)
      }
    })
  }

  createJwt(user) {
    return nanoid(15)
  }
};