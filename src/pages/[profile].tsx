import Head from "next/head";
import React from "react";
import { api } from "~/utils/api";

function Profile({ userId }: { userId: string }) {
  const { data: userProfile, isLoading } =
    api.profile.getUserByUsername.useQuery({
      userId: userId,
    });

  if (!userProfile) throw new Error("Page not found");

  return (
    <>
      <Head>
        <title>{userProfile.username}</title>
      </Head>
      <div className=" relative mb-20 flex h-48 border-b border-gray-400  bg-gray-700 p-5 px-12 pb-0">
        <Avatar
          width_height={180}
          className="absolute  top-20  border-8 border-gray-800 bg-gray-800"
          src={userProfile.profilePicture}
        />
        <div className=" mb-5 ml-auto mt-auto  text-3xl font-semibold">
          {userProfile.username}
        </div>
      </div>
      <ProfileFeed userId={userId} />
    </>
  );
}

function ProfileFeed(props: { userId: string }) {
  const { data, isLoading } = api.posts.getPostsByUserId.useQuery({
    userId: props.userId,
  });

  if (isLoading) return <LoadingPage />;

  if (!data || data.length === 0) return <div>User has not posted</div>;

  return (
    <div className="flex flex-col">
      {data.map((postWithAuthor) => (
        <PostsView
          post={postWithAuthor.post}
          key={postWithAuthor.post.id}
          author={postWithAuthor.author}
        />
      ))}
    </div>
  );
}

import type { GetStaticPaths, GetStaticProps } from "next";
import { Avatar } from "~/components/Avatar";
import { LoadingPage } from "~/components/Loading";
import { PostsView } from "~/components/PostView";
import { generateSSGHelper } from "~/server/helpers/ssgHelper";

//ssg with trpc helpers cuz u cant use hooks in getstaticprops
export const getStaticProps: GetStaticProps = async (context) => {
  const ssg = generateSSGHelper();
  const searchParamsUserId = context.params?.profile;

  if (typeof searchParamsUserId !== "string") throw new Error("no params");

  //ssg works like api here bc the router was defined as appRouter
  await ssg.profile.getUserByUsername.prefetch({ userId: searchParamsUserId });

  return {
    props: {
      trpcState: ssg.dehydrate(),
      userId: searchParamsUserId,
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

export default Profile;
