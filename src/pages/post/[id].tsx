import Head from "next/head";
import React from "react";

function Post({ postId }: { postId: string }) {
  const { data, isLoading } = api.posts.getPostByPostId.useQuery({
    postId: postId,
  });

  if (!data) throw new Error("Page not found");

  const postData = data[0];

  if (!postData) throw new Error("Page not found");

  return (
    <>
      <Head>{/* <title>{userProfile.username}</title> */}</Head>
      <div>
        <PostsView
          post={postData.post}
          key={postData.post.id}
          author={postData.author}
        />
      </div>
    </>
  );
}

import type { GetStaticPaths, GetStaticProps } from "next";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";
import { api } from "~/utils/api";
import { PostsView } from "~/components/PostView";

//ssg with trpc helpers cuz u cant use hooks in getstaticprops
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const searchParamsPostId = context.params?.id;

  if (typeof searchParamsPostId !== "string") throw new Error("post not found");

  await ssg.posts.getPostByPostId.prefetch({ postId: searchParamsPostId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      postId: searchParamsPostId,
    },
  };
};

export const getStaticPaths: GetStaticPaths = () => {
  //no need to prerender all routes
  return {
    paths: [],
    fallback: "blocking",
  };
};

export default Post;
