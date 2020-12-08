'use strict';

const uuid = require('uuid');
const AWS = require('aws-sdk'); 

const dynamoDb = new AWS.DynamoDB.DocumentClient();

module.exports.submit = (event, context, callback) => {
  const requestBody = JSON.parse(event.body);
  const fullname = requestBody.fullname;
  const messageText = requestBody.messageText;

  if (typeof fullname !== 'string' || typeof messageText !== 'string') {
    console.error('Validation Failed');
    callback(new Error('Couldn\'t submit message template because of validation errors.'));
    return;
  }

  submitTemplate(templateInfo(fullname, messageText))
    .then(res => {
      callback(null, {
        statusCode: 200,
        body: JSON.stringify({
          message: `Sucessfully submitted template for ${fullname}`,
          userId: res.id
        })
      });
    })
    .catch(err => {
      console.log(err);
      callback(null, {
        statusCode: 500,
        body: JSON.stringify({
          message: `Unable to submit template for ${fullname}`
        })
      })
    });
};


const submitTemplate = template => {
  console.log('Submitting template');
  const templateInfo = {
    TableName: 'Templates',
    Item: template,
  };
  return dynamoDb.put(templateInfo).promise()
    .then(res => template);
};

const templateInfo = (fullname, messageText) => {
  const timestamp = new Date().getTime();
  return {
    userId: uuid.v1(),
    fullname: fullname,
    messageText: messageText,
    submittedAt: timestamp,
    updatedAt: timestamp,
  };
};