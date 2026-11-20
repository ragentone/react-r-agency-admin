import { parse } from 'graphql';

/*
 * Sign-in switches (sign-up and Google login). Parsed directly, like the other admin
 * operations for new runtime fields. Backend: runtime shared/config (appAuth / appAuthSet).
 */

/** Public read – the admin shows the current state with it. */
export const AppAuthQuery = parse(`
  query AppAuth {
    configAppAuth {
      success
      allowRegister
      allowLoginWithGoogle
    }
  }
`);

/** `admin:user` only – stores the switches; omitted fields keep their value. */
export const AppAuthSetMutation = parse(`
  mutation AppAuthSet($allowRegister: Boolean, $allowLoginWithGoogle: Boolean) {
    configAppAuthSet(allowRegister: $allowRegister, allowLoginWithGoogle: $allowLoginWithGoogle) {
      success
      allowRegister
      allowLoginWithGoogle
    }
  }
`);
