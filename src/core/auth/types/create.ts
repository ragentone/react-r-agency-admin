/**
 * Interfaces for UserCreate GraphQL Mutation
 */

export interface IUserCreateParams {
  alias: string;
  email: string;
  password: string;
}

export interface IUserCreateVariables {
  params: IUserCreateParams;
}

export interface IUserCreateReturn {
  success?: boolean | null;
  userId?: string | null;
}

export interface IUserCreateResponse {
  userCreate?: IUserCreateReturn | null;
}

export type IUserCreateMutation = IUserCreateResponse;
