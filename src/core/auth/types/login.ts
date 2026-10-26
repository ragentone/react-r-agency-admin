import type { UserLoginParams } from '@generated/graphql/graphql';

import type { IUserMetaData } from './config';

/**
 * Interfaces for UserLogin GraphQL Mutation and authentication parameters
 */

export type ILoginParams = UserLoginParams;

export type IUserLoginParams = ILoginParams;

export interface IUserLoginVariables {
  params: IUserLoginParams;
}

export interface IUserLoginReturn {
  success?: boolean | null;
  userId?: string | null;
  authToken?: string | null;
  meta?: IUserMetaData | null;
}

export type ILoginResponse = IUserLoginReturn;

export interface IUserLoginResponse {
  userLogin?: IUserLoginReturn | null;
}

export type IUserLoginMutation = IUserLoginResponse;
