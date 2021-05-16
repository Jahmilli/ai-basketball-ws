module.exports = {
  s3: {
    // videosBucket: "", // Name of the bucket where video are to be stored
    // endpoint: "", // The endpoint URI to send requests to
    // sslEnabled: false, // Whether to enable SSL for requests
    // s3ForcePathStyle: true, // Whether to force path style URLs for S3 objects
    videosBucket: "aibasketball",
    sslEnabled: false,
    s3ForcePathStyle: true,
    region: "ap-southeast-2",
  },
  api: {
    port: 3001, // Port that Express will use
  },
  poseService: {
    endpoint: "http:localhost:3002", // Endpoint of the pose server
    path: "/v1/video/receive", // Path that we request from the pose server
    timeout: 5000,
  },
  database: {
    type: "postgres",
    // Would be more ideal to pass this in as config per env but seeing as there's no proper CI and env config this is okay.
    // Also only accessible from within the VPC from a specific SG so it's safe...
    host: "ai-basketball.cwlop5aflogk.ap-southeast-2.rds.amazonaws.com",
    port: 5432,
  },
};
