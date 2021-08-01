import { UsernamePasswordInput } from "../graphql_types/input_types";
import { FieldError } from "../graphql_types/object_types";

/*
 * Returns a UserResponse error if registerInfo is invalid.
 */
export default function validateRegister(
  registerInfo: UsernamePasswordInput
): FieldError[] {
  // TODO: Improve email validation.
  const errors: FieldError[] = [];

  if (registerInfo.username.length <= 2) {
    errors.push({
      message: "Username must have at least 3 characters.",
      field: "username",
    });
  }

  if (!registerInfo.email.includes("@")) {
    errors.push({
      message: "Invalid email.",
      field: "email",
    });
  }

  if (registerInfo.password.length <= 4) {
    errors.push({
      message: "Password must have at least 5 characters.",
      field: "password",
    });
  }

  return errors;
}
