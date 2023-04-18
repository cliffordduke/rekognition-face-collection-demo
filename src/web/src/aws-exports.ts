export default {
  Auth: {
    identityPoolId: 'ap-southeast-1:f2678d85-c3b5-41f9-8030-10d98c738c5c',
    region: 'ap-southeast-1',
    userPoolId: 'ap-southeast-1_tFDs6BqG8',
    userPoolWebClientId: 'dn7fb5apk35h0snt0l3k8imtp',
    mandatorySignIn: false,
  },
  Storage: {
    AWSS3: {
      bucket: 'aws-event-photo-manager-ap-southeast-1-866716849012-assets',
      region: 'ap-southeast-1',
      identityPoolId: 'ap-southeast-1:f2678d85-c3b5-41f9-8030-10d98c738c5c',
    },
  },
  API: {
    endpoints: [
      {
        name: 'API',
        endpoint: 'https://xyn0b96so2.execute-api.ap-southeast-1.amazonaws.com/Prod',
      },
    ],
  },
};
