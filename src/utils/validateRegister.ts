import { UsernamePasswordInput } from "../graphql_types/input_types";
import { UserResponse } from "../graphql_types/object_types";

/*
 * Returns a UserResponse error if registerInfo is invalid.
 */
export default function validateRegister(
  registerInfo: UsernamePasswordInput
): UserResponse | void {
  if (registerInfo.username.length <= 2) {
    return {
      errors: [
        {
          message: "Username must have at least 3 characters.",
          field: "username",
        },
      ],
    };
  }

  if (!registerInfo.email.includes("@")) {
    return {
      errors: [
        {
          message: "Invalid email.",
          field: "email",
        },
      ],
    };
  }

  if (registerInfo.password.length <= 4) {
    return {
      errors: [
        {
          message: "Password must have at least 5 characters.",
          field: "password",
        },
      ],
    };
  }
}
