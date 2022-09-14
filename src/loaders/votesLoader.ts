import DataLoader from "dataloader";
import { In } from "typeorm";
import { Post } from "../entities/Post";
import { Vote } from "../entities/Vote";

export const createVotesFromPostsLoader = (): DataLoader<Post["id"], Vote[]> =>
  new DataLoader(async (postIds) => {
    const votes = await Vote.find({
      where: {
        post: { id: In(postIds.slice()) },
      },
    });

    const postIdToVotes: Record<Post["id"], Vote[]> = {};

    for (const vote of votes) {
      const postId = (await vote.post).id;

      if (postIdToVotes[postId] !== undefined) {
        postIdToVotes[postId].push(vote);
      }
    }

    const orderedVotes: Vote[][] = postIds.map(
      (postId) => postIdToVotes[postId]
    );

    return orderedVotes;
  });
