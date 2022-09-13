import DataLoader from "dataloader";
import { User } from "../entities/User";

export const createUserLoader = (): DataLoader<string, User> =>
  new DataLoader(async (userIds) => {
    const users = await User.findByIds(userIds.slice());

    const userIdToUser: Record<string, User> = {};

    for (const user of users) {
      userIdToUser[user.id] = user;
    }

    const sortedUsers = userIds.map((userId) => userIdToUser[userId]);

    return sortedUsers;
  });
