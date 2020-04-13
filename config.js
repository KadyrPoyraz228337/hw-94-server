const path = require('path'),
  rootPath = __dirname;

module.exports = {
  rootPath,
  uploadPath: path.join(rootPath, 'public', 'uploads'),
  port: 8000,
  facebook: {
    appId: '214862699931338',
    appSecret: '2e5389d7299dad6aba90cc24a28cd1ec'
  }
};