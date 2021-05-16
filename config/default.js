module.exports = {
  s3: {
    // videosBucket: "", // Name of the bucket where video are to be stored
    // accessKeyId: "",
    // secretAccessKey: "",
    // endpoint: "", // The endpoint URI to send requests to
    sslEnabled: false, // Whether to enable SSL for requests
    s3ForcePathStyle: true, // Whether to force path style URLs for S3 objects
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
    host: "localhost",
    port: 5432,
  }
};
