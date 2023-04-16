import { RouterOutputs } from "~/utils/api";
import { Avatar } from "./Avatar";
import Link from "next/link";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";

//we need one element from the getall function in post
type PostWithUser = RouterOutputs["posts"]["getAll"][number];
dayjs.extend(relativeTime);

export function PostsView(props: PostWithUser) {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3  border-b border-gray-400 p-4 ">
      <Avatar src={author.profilePicture} />

      <div className="flex flex-col">
        <div className="flex text-gray-300">
          <Link href={`/${author.id}`}>
            <span>{`@${author.username}`}</span>
          </Link>{" "}
          <Link href={`/post/${post.id}`}>
            <span className="ml-2 ">{dayjs(post.createdAt).fromNow()}</span>
          </Link>
        </div>

        <span className="text-xl">{post.content}</span>
      </div>
    </div>
  );
}
