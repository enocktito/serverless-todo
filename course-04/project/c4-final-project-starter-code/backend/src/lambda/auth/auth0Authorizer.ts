import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
// import Axios from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth');
// import JwksClient from 'jwks-client'

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
// const jwksUrl = 'https://dev-nh-hm0e8.us.auth0.com/.well-known/jwks.json'
const cert = `-----BEGIN CERTIFICATE-----
MIIDDTCCAfWgAwIBAgIJIfl+PKO7xXsSMA0GCSqGSIb3DQEBCwUAMCQxIjAgBgNV
BAMTGWRldi1uaC1obTBlOC51cy5hdXRoMC5jb20wHhcNMjIwOTI4MjAzNjAxWhcN
MzYwNjA2MjAzNjAxWjAkMSIwIAYDVQQDExlkZXYtbmgtaG0wZTgudXMuYXV0aDAu
Y29tMIIBIjANBgkqhkiG9w0BAQEFAAOCAQ8AMIIBCgKCAQEAsV5M8j09i3f1MLxd
FGPWmdPbQPfsP6y0GUOI7YalcvmSSlC2XzRz5GRl7GdUVx2X9k48dx9jD0f7xZ3X
jdu6sYz9a/QBpQ8V5hwGVNO3q5ARlqBkGebV4KLVDaENib2q50P1WyTfcb2WIglV
RVtXmTiGO9Xh0lSy4wQTO5678BuKl3lyxJ7pctA5dymNm3k/vhT6VWpT/+tMyI3o
S2ysOk4VhYrMR91TwaTN2tNmydt6dpWYSmSLEHlE6WRXKJNaH5U3+lJaH8AYascy
EdtMG+K4+RPX0uX2eepkOG38QuhowdAP5aMfke6SOWVHyUnL0Qx0SRJuadTNm9aY
QYpJywIDAQABo0IwQDAPBgNVHRMBAf8EBTADAQH/MB0GA1UdDgQWBBTN5nvOGmpg
e0wm72NW7wTe0Vw2CDAOBgNVHQ8BAf8EBAMCAoQwDQYJKoZIhvcNAQELBQADggEB
ABPFef22/QBaL9yKM03CNII1TsyFFHq9RiL528Wj6dxEVLo4xTE9NtSokEhhqPjN
wFLJ+6tFc+U+2HBkWrsrM+BnyuRWONAOCwiPgrSuz2Ls2OYZfewZ5s/Ausjsc0ma
sWNifj262QdVMqW5/CwVCKIGFd5GlWjCnuH/+Rmd82ugNgBYu51xCHcVPHRzrHf4
O4yhbuVdVFxM4dvbkX7HNUUKjx5RC+NPIshhuGklrClIFgVAj8vom9PB7kSp7Lu9
S3eMh+iehmOKaef6/Gk53HzRTs/Sazjcm5P9gV9NkrnqKl/fnA7NjAsqQnlsVS/8
5RB1fVEqa0fgeGLHyhg33hI=
-----END CERTIFICATE-----`

export const handler = async (
  event: CustomAuthorizerEvent
): Promise<CustomAuthorizerResult> => {
  logger.info('Authorizing a user', event.authorizationToken)
  try {
    const jwtToken = await verifyToken(event.authorizationToken)
    logger.info('User was authorized', jwtToken)

    return {
      principalId: jwtToken.sub,
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Allow',
            Resource: '*'
          }
        ]
      }
    }
  } catch (e) {
    logger.error('User not authorized', { error: e.message })

    return {
      principalId: 'user',
      policyDocument: {
        Version: '2012-10-17',
        Statement: [
          {
            Action: 'execute-api:Invoke',
            Effect: 'Deny',
            Resource: '*'
          }
        ]
      }
    }
  }
}

async function verifyToken(authHeader: string): Promise<JwtPayload> {
  const token = getToken(authHeader)
  const jwt: Jwt = decode(token, { complete: true }) as Jwt
  console.log(jwt);

  // TODO: Implement token verification
  // You should implement it similarly to how it was implemented for the exercise for the lesson 5
  // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
  // const client = jwksClient({
  //   strictSsl: true, // Default value
  //   jwksUri: jwksUrl
  // });
  // const options = {
  //     strictSsl: true, // Default value
  //     jwksUri: jwksUrl
  //   }
  // const client = new JwksClient(options);
  // client.getJwks((err, res) =>{
  //   if (err) {
  //     console.log(err);
  //     return null;
  //   }
  //   console.log(res);
  // })
  
  // const kid = 'RkI5MjI5OUY5ODc1N0Q4QzM0OUYzNkVGMTJDOUEzQkFCOTU3NjE2Rg';
  // client.getSigningKey(kid, (err, key) => {
  //   const signingKey = key.publicKey;
  // });
  
  return verify( token,cert, {algorithms: ['RS256']} ) as JwtPayload
}

function getToken(authHeader: string): string {
  if (!authHeader) throw new Error('No authentication header')

  if (!authHeader.toLowerCase().startsWith('bearer '))
    throw new Error('Invalid authentication header')

  const split = authHeader.split(' ')
  const token = split[1]

  return token
}
