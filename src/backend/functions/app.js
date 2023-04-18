// const axios = require('axios')
// const url = 'http://checkip.amazonaws.com/';
let response;
const AWS = require('aws-sdk');
const mime = require('mime-types');
const uuid = require('uuid/v4');
const path = require('path');

const s3 = new AWS.S3();
const rekognition = new AWS.Rekognition();
const dynamodb = new AWS.DynamoDB();

exports.uploadPhoto = async (event, context) => {
  let payload = JSON.parse(event.body);
  let imageId = uuid();
  let params = {
    Bucket: process.env.S3BUCKET,
    Key: `images/${imageId}.${mime.extension(payload.contentType)}`,
    Body: Buffer.from(payload.image, 'base64'),
    Metadata: {
      imageId: imageId,
    },
  };
  try {
    await s3.upload(params).promise();
    
    return {
      statusCode: 201,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
    };
  } catch (exception) {
    return {
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      statusCode: 500,
    };
  }
};

exports.findFaceFromImage = async(event, context) => {
  let payload = JSON.parse(event.body);
  let image = Buffer.from(payload.image, 'base64');
  let params = {
    CollectionId: process.env.REKOGNITION_COLLECTION,
    Image: {
      Bytes: image
    },
    FaceMatchThreshold: 85,
    MaxFaces: 100
  }
  let result = await rekognition.searchFacesByImage(params).promise();
  let processor = result.FaceMatches.map(async match => {
    return {
      faceId: match.Face.FaceId,
      imageKey: await s3.getSignedUrlPromise('getObject', {Bucket:process.env.S3_BUCKET, Key: `public/${match.Face.ExternalImageId}`})
    }
  })

  let faces = await Promise.all(processor);
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({faces:faces}),
  }
}

exports.getFaceId = async(event, context) => {
  let payload = JSON.parse(event.body);
  let image = Buffer.from(payload.image, 'base64');
  let params = {
    CollectionId: process.env.REKOGNITION_COLLECTION,
    Image: {
      Bytes: image
    }
  }
  let result = await rekognition.indexFaces(params).promise();
  if(result.FaceRecords.length > 1 || result.FaceRecords.length === 0) {
    return {
      statusCode: 403,
      headers: {
        'Content-Type': 'application/json',
        'Access-Control-Allow-Origin': '*'
      },
      body: JSON.stringify({ error: "Your image should only contain yourself!" }),
    };
  }
  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ faceId: result.FaceRecords[0].Face.FaceId }),
  }; 
}

exports.processPhotos = async (event, context) => {
  const bucket = event.Records[0].s3.bucket.name;
  const key = event.Records[0].s3.object.key;
  //console.log(JSON.stringify(event, null, 4));
  let params = {
    CollectionId: process.env.REKOGNITION_COLLECTION,
    ExternalImageId: path.basename(key),
    Image: {
      S3Object: {
        Bucket: bucket,
        Name: key,
      },
    },
    MaxFaces: 100,
  };
  //console.log(JSON.stringify(params, null, 4));
  let result = await rekognition.indexFaces(params).promise();
  // console.log(JSON.stringify(result, null, 4));
  let insertParams = {
    RequestItems: {},
  };

  insertParams.RequestItems[process.env.PHOTOS_TABLE] = result.FaceRecords.map(record => {
    return {
      PutRequest: {
        Item: AWS.DynamoDB.Converter.marshall({
          personId: record.Face.FaceId,
          photoPath: key,
        }),
      },
    };
  });
  // console.log(JSON.stringify(insertParams, null, 4));

  await dynamodb.batchWriteItem(insertParams).promise();
};

exports.getPhotos = async (event, context) => {
  let payload = event.pathParameters;

  let params = {
    TableName: process.env.PHOTOS_TABLE,
    KeyConditionExpression: "#pid = :pid",
    ExpressionAttributeNames: {
      "#pid": "personId"
    },
    ExpressionAttributeValues: {
      ":pid": {S:payload.userId}
    }
  }

  let data = await dynamodb.query(params).promise();
  let rawResults = data.Items.map(r => AWS.DynamoDB.Converter.unmarshall(r).photoPath);
  console.log(rawResults);
  let processer = rawResults.map(async (image) => {
    return await s3.getSignedUrlPromise('getObject', {Bucket:process.env.S3_BUCKET, Key: image})
  });

  let results = await Promise.all(processer);

  return {
    statusCode: 200,
    headers: {
      'Content-Type': 'application/json',
      'Access-Control-Allow-Origin': '*'
    },
    body: JSON.stringify({ images: results }),
  };
};
