import { Request } from 'express';

/** Shape of the data we encode into the JWT. */
export type JwtPayload = {
	sub: string; // organizerId
	email: string;
};

/** What `req.user` looks like once JwtStrategy.validate() has run. */
export type AuthenticatedOrganizer = {
	organizerId: string;
	email: string;
};

export type AuthenticatedRequest = Request & {
	user?: AuthenticatedOrganizer;
};
