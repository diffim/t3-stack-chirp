import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import Head from "next/head";
import { api } from "~/utils/api";
import type { RouterOutputs } from "~/utils/api";
import dayjs from "dayjs";
import relativeTime from "dayjs/plugin/relativeTime";
import Image from "next/image";
import { LoadingSpinner, LoadingPage } from "~/components/Loading";
import { log } from "console";
import { FormEvent, useRef } from "react";
import { send } from "process";
import toast from "react-hot-toast";
import Link from "next/link";
import { Avatar } from "~/components/Avatar";

dayjs.extend(relativeTime);

function CreatePost() {
  const { user } = useUser();
  const inputRef = useRef<HTMLInputElement>(null);
  const ctx = api.useContext();
  const { mutate, isLoading: isPosting } = api.posts.create.useMutation({
    onSuccess: () => {
      if (!inputRef.current) {
        return;
      }

      inputRef.current.value = "";
      ctx.posts.getAll.invalidate();
    },

    onError: (e) => {
      const errorMessage = e.data?.zodError?.fieldErrors.content;

      if (errorMessage && errorMessage[0]) {
        toast.error(errorMessage[0]);
      } else {
        toast.error("Failed to post! Please try again later.");
      }
    },
  });

  function sendPost(e: FormEvent<HTMLFormElement>) {
    e.preventDefault();
    if (!inputRef.current) {
      return;
    }

    mutate({ content: inputRef.current.value });
  }

  if (!user) return null;

  return (
    <div className="flex w-full  items-center">
      <Avatar src={user.profileImageUrl} />
      <form
        onSubmit={(e) => sendPost(e)}
        className="flex grow items-center justify-between"
      >
        <input
          type="text"
          ref={inputRef}
          placeholder="type some emojis"
          disabled={isPosting}
          className="grow bg-transparent p-5 outline-none"
        />

        <div>
          {isPosting && <LoadingSpinner />}
          <button
            type="submit"
            disabled={isPosting}
            className="hidden "
          ></button>
        </div>
      </form>
    </div>
  );
}

//we need one element from the getall function in post
type PostWithUser = RouterOutputs["posts"]["getAll"][number];

function PostsView(props: PostWithUser) {
  const { post, author } = props;

  return (
    <div key={post.id} className="flex gap-3  border-b border-slate-400 p-4 ">
      <Avatar src={author.profilePicture} />

      <div className="flex flex-col">
        <div className="flex text-slate-300">
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

function Feed() {
  const { data, isLoading: postsLoading } = api.posts.getAll.useQuery();

  if (postsLoading) return <LoadingPage />;

  if (!data) return <div>Something went wrong</div>;

  return (
    <div className="flex flex-col">
      {data.map((fullPost) => (
        <PostsView {...fullPost} key={fullPost.post.id} />
      ))}
    </div>
  );
}

const Home: NextPage = () => {
  const { user, isLoaded: userLoaded, isSignedIn } = useUser();

  //start fetching early
  api.posts.getAll.useQuery();

  // return empty div if both aren't loaded since user tends to load faster
  if (!userLoaded) return <div></div>;

  return (
    <>
      <div className="flex items-center  border-b border-slate-400  p-4">
        {!isSignedIn && (
          <div className="flex justify-center">
            <SignInButton />
          </div>
        )}
        {isSignedIn && <CreatePost />}
      </div>
      <Feed />
    </>
  );
};

export default Home;
