var libs = process.cwd() + '/libs/';
var AccessToken = require(libs + 'schemas/accessToken');
var Client = require(libs + 'schemas/client');
var Collaboration = require(libs + 'schemas/collaboration');
var Executable = require(libs + 'schemas/executable');
var Model = require(libs + 'schemas/model');
var Property = require(libs + 'schemas/property');
var Query = require(libs + 'schemas/query');
var RefreshToken = require(libs + 'schemas/refreshToken');
var User = require(libs + 'schemas/user');
var WorkBatch = require(libs + 'schemas/work_batch');

var collections = {
    'accesstokens': AccessToken,
    'clients': Client,
    'collaborations': Collaboration,
    'executables': Executable,
    'models': Model,
    'properties': Property,
    'queries': Query,
    'refreshtokens': RefreshToken,
    'users': User,
    'work_batches': WorkBatch
};

module.exports = collections;
