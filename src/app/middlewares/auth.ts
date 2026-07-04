import { NextFunction, Request, Response } from 'express';
import { StatusCodes } from 'http-status-codes';
import { Secret } from 'jsonwebtoken';
import { User } from '../modules/user/user.model';
import { HttpError } from '../errors/HttpError';
import { verifyToken } from '../utils/verifyToken';
import config from '../config';
import { USER_STATUS } from '../types/enum';

const auth =
  (...roles: string[]) =>
  async (req: Request, res: Response, next: NextFunction) => {
    try {
      const tokenWithBearer = req.headers.authorization;
      if (!tokenWithBearer) {
        throw new HttpError(StatusCodes.UNAUTHORIZED, 'You are not authorized !!');
      }
      if (!tokenWithBearer.startsWith('Bearer')) {
        throw new HttpError(StatusCodes.UNAUTHORIZED, 'Token send is not valid !!');
      }

      if (tokenWithBearer && tokenWithBearer.startsWith('Bearer')) {
        const token = tokenWithBearer.split(' ')[1]!;

        //verify token
        let verifyUser: any;
        try {
          verifyUser = verifyToken(token, config.jwt.jwt_secret as Secret);
        } catch (error) {
          throw new HttpError(StatusCodes.UNAUTHORIZED, 'You are not authorized !!');
        }

        //  user check isUserExist or not
        const user = await User.isExistUserById(verifyUser.id);
        if (!user) {
          throw new HttpError(StatusCodes.NOT_FOUND, 'This user is not found !!');
        }

        if (user?.status === USER_STATUS.BLOCKED) {
          throw new HttpError(StatusCodes.FORBIDDEN, 'This user is blocked !!');
        }

        //guard user
        if (roles.length && !roles.includes(verifyUser?.role)) {
          throw new HttpError(
            StatusCodes.FORBIDDEN,
            "You don't have permission to access this api !!",
          );
        }

        //set user to header
        req.user = verifyUser;
        next();
      }
    } catch (error) {
      next(error);
    }
  };

export default auth;
