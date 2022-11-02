import { UsernamePasswordInput } from "../graphql_types/input_types";
import { FieldError } from "../graphql_types/object_types";
import validatePassword from "./validatePassword";

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

  errors.concat(validatePassword(registerInfo.password));

  return errors;
}
