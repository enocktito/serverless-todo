import { CustomAuthorizerEvent, CustomAuthorizerResult } from 'aws-lambda'
import 'source-map-support/register'

import { verify, decode } from 'jsonwebtoken'
import { createLogger } from '../../utils/logger'
import Axios, { AxiosResponse } from 'axios'
import { Jwt } from '../../auth/Jwt'
import { JwtPayload } from '../../auth/JwtPayload'

const logger = createLogger('auth')

// TODO: Provide a URL that can be used to download a certificate that can be used
// to verify JWT token signature.
// To get this URL you need to go to an Auth0 page -> Show Advanced Settings -> Endpoints -> JSON Web Key Set
const jwksUrl = 'https://dev-nh-hm0e8.us.auth0.com/.well-known/jwks.json';

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
    const jwt: Jwt = decode(token, { complete: true }) as Jwt;

    const jwksClient = new JwksClient({ jwksUrl });

    // Get signin token certificate.
    const publicKey: string = await jwksClient.getCertificate(jwt.header.kid).catch((err: Error) => {
        throw err;
    });

    // TODO: Implement token verification
    // You should implement it similarly to how it was implemented for the exercise for the lesson 5
    // You can read more about how to do this here: https://auth0.com/blog/navigating-rs256-and-jwks/
    return verify(token, publicKey, { algorithms: [jwt.header.alg] }) as JwtPayload;
}

function getToken(authHeader: string): string {
    if (!authHeader) throw new Error('No authentication header');

    if (!authHeader.toLowerCase().startsWith('bearer '))
        throw new Error('Invalid authentication header');

    const split = authHeader.split(' ');
    const token = split[1];

    return token;
}

class JwksClient {
    private options: { strictSsl: boolean, jwksUrl: string };

    constructor(options: { jwksUrl: string }) {
        this.options = { strictSsl: true, ...options };
    }

    async getCertificate(kid: string): Promise<string> {
        // Get Auth0 keys.
        const keys: Array<any> = await Axios.get(this.options.jwksUrl).then((r: AxiosResponse) => {
            if (r.data) return r.data?.keys || [];
        }).catch(() => {
            return [];
        });

        // No keys found.
        if (!keys || !keys.length) {
            throw new Error("The JWKS endpoint did not contain any keys");
        }

        // Extract keys according to RSA algo only.
        const signingKeys: Array<{kid:string,publicKey:string}> = keys.filter((key: any) => key.use === 'sig' && key.kty === 'RSA' && key.kid && key.x5c && key.x5c.length)
            .map((key: any) => {
                // Build certificat.
                let cert: string = key.x5c[0].match(/.{1,64}/g).join('\n');
                cert = `-----BEGIN CERTIFICATE-----\n${cert}\n-----END CERTIFICATE-----\n`;

                // Return key.
                return { kid: key.kid, publicKey: cert };
            });
        
        // No key respect constraints.
        if (!signingKeys.length) {
            throw new Error("The JWKS endpoint did not contain any proper keys");
        }

        // Extract required signing key.
        const signingKey = signingKeys.find((key: {kid:string,publicKey:string}) => key.kid === kid);

        // no key found for this kid.
        if (!signingKey) {
            throw new Error(`Unable to find a signing key that matches '${kid}'`);
        }

        // Return signing key.
        return signingKey.publicKey;
    }
}