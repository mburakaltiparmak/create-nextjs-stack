import { BaseService } from "./base.service";

export class UserService extends BaseService {
  constructor() {
    super("users");
  }

  // Future: override create() to handle Auth user creation if using Admin API
}
