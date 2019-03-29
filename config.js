const config = {
    mongodbURL : process.env.database
    saltRounds: 8,
    secretJWT : process.env.secretJWT,
    sessionSecret : process.env.sessionSecret
};

module.exports = config;


