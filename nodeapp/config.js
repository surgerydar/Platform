let fs = require('fs');

function key() {
    try {
        return fs.readFileSync('./ssl/privkey.pem');
    } catch( err ) {
        return fs.readFileSync('./ssl/server.key');
    }
}

function cert() {
    try {
        return fs.readFileSync('./ssl/fullchain.pem');
    } catch( err ) {
        return fs.readFileSync('./ssl/server.crt');
    }
}

function ca() {
    try {
        return fs.readFileSync('./ssl/chain.pem');
    } catch( err ) {
        return undefined;
    }
}

module.exports = {
    ssl : {
        key: key(),
        cert: cert(),
        ca: ca(),
    },
    
    facebook : {
        appId: '2027805940877102',
        appSecret: '3917a8a26cbca87daaf2bfd2b85a3197',
        callbackUrl: 'https://platformgame.net/facebook/callback'
    },
    
    twitter : {
        appId: 'SbzjrPgfcHRMzPkc4jNnrjllQ',
        appSecret: 'bGZUOcNLsrk2cX1FyfmAk4CMlQ40FCRbsTAzbIikXGnM3GHXyt',
        callbackUrl: 'https://platformgame.net/twitter/callback'
    }
};