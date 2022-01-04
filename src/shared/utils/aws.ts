import { Amplify } from 'aws-amplify';

export function configure() {
  Amplify.configure({
    Auth: {
      mandatorySignIn: true,
      region: process.env.REACT_APP_AWS_COGNITO_REGION,
      userPoolId: process.env.REACT_APP_AWS_COGNITO_USER_POOL_ID,
      identityPoolId: process.env.REACT_APP_AWS_COGNITO_IDENTITY_POOL_ID,
      userPoolWebClientId: process.env.REACT_APP_AWS_COGNITO_APP_CLIENT_ID,
    },
    API: {
      endpoints: [
        {
          name: 'leagues',
          endpoint: process.env.REACT_APP_AWS_API_URL,
          region: process.env.REACT_APP_AWS_API_REGION,
        },
      ],
    },
  });
}
