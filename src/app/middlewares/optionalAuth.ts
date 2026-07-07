import { NextFunction, Request, Response } from 'express';
import { Secret } from 'jsonwebtoken';

import { User } from '../modules/user/user.model';
import { HttpError } from '../errors/HttpError';
import { verifyToken } from '../utils/verifyToken';
import config from '../config';
import { USER_STATUS } from '../types/enum';

const optionalAuth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;

      if (!tokenWithBearer) {
        return next();
      }

      if (!tokenWithBearer.startsWith('Bearer ')) {
        throw new HttpError(401, 'Token format is not valid !!');
      }

      const token = tokenWithBearer.split(' ')[1]!;

      let verifyUser: any;
      try {
        verifyUser = verifyToken(token, config.jwt.jwt_secret as Secret);
      } catch (error) {
        throw new HttpError(401, 'You are not authorized !!');
      }

      const user = await User.isExistUserById(verifyUser.id);

      if (!user) {
        throw new HttpError(404, 'This user is not found !!');
      }

      if (user?.status === USER_STATUS.BLOCKED) {
        throw new HttpError(403, 'This user is blocked !!');
      }

      if (user?.isDeleted) {
        throw new HttpError(403, 'This user account is deleted !!');
      }

      if (roles.length && !roles.includes(verifyUser?.role)) {
        throw new HttpError(403, "You don't have permission to access this api !!");
      }

      req.user = verifyUser;
      next();
    } catch (error) {
      next(error);
    }
  };

export default optionalAuth;
