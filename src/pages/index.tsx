import { SignInButton, useUser } from "@clerk/nextjs";
import { type NextPage } from "next";
import { api } from "~/utils/api";
import { LoadingSpinner, LoadingPage } from "~/components/Loading";
import { FormEvent, useRef } from "react";
import toast from "react-hot-toast";
import { Avatar } from "~/components/Avatar";
import { PostsView } from "~/components/PostView";

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
      ctx.posts.getAll.invalidate().catch((err) => console.error(err));
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
      <div className="flex items-center  border-b border-gray-400  p-4">
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
