import { User } from "@clerk/nextjs/dist/api";
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCClientError } from "@trpc/client";
import { TRPCError } from "@trpc/server";
import { z } from "zod";

import { createTRPCRouter, privateProcedure, publicProcedure } from "~/server/api/trpc";


import { Ratelimit } from "@upstash/ratelimit"; // for deno: see above
import { Redis } from "@upstash/redis";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";
import type { Post } from "@prisma/client";

async function addUserDataToPosts(posts: Post[]) {
  const users = (await clerkClient.users.getUserList({
    userId: posts.map((post) => post.authorId),
    limit: 100 
  })).map(filterUserForClient)


  return posts.map(post => {
    const author = users.find((user) => user.id === post.authorId)
    if (!author || !author.username) throw new TRPCError({code: "INTERNAL_SERVER_ERROR", message: "Author for post not found"})


    return { 
    post, 
    author: {
      ...author,
      username: author.username
    },

    }
  })
}

// Create a new ratelimiter, that allows 5 requests per 10 seconds
const ratelimit = new Ratelimit({
  redis: Redis.fromEnv(),
  limiter: Ratelimit.slidingWindow(5, "10 s"),
  analytics: true,
  /**
   * Optional prefix for the keys used in redis. This is useful if you want to share a redis
   * instance with other applications and want to avoid key collisions. The default prefix is
   * "@upstash/ratelimit"
   */ 
  prefix: "@upstash/ratelimit",
});


export const postsRouter = createTRPCRouter({ 
  getAll: publicProcedure.query(async ({ ctx }) => {
    const posts = await ctx.prisma.post.findMany({take: 100,  orderBy: [ {createdAt: "desc"}]}); 
  
    return addUserDataToPosts(posts)
    }  

  ),

  getPostByPostId: publicProcedure.input(z.object({postId: z.string()})).query(async ({ctx,input}) => {
    const postId = input.postId

    const post = await ctx.prisma.post.findUnique({
      where: {
        id: postId
      }
    })

    if (!post) throw new TRPCError({code: "NOT_FOUND", message: "Post not found!"})
    const postArr = [post]


    return addUserDataToPosts(postArr)
  }),

  getPostsByUserId: publicProcedure.input(z.object({userId: z.string()})).query(async ({ctx,input}) => {
    const userId = input.userId

    //prisma function which checks to see where authorid of post is equal to userid which we get from input
    //note to self: learn prisma and about sql in general.
    const posts = await ctx.prisma.post.findMany({
      where: {
        authorId: userId
      },
      take: 100,
      orderBy: [{createdAt: "desc"}]
    })


    return addUserDataToPosts(posts)
  }) ,
  
  create: privateProcedure.input(z.object({ content: z.string().emoji("Only emojis allowed!").min(1).max(280) }))
  .mutation(async ({ctx, input}) => {
    const authorId = ctx.userId

    // upstash got the most godly ratelimiter 
    // https://github.com/upstash/ratelimit
    const {success} = await ratelimit.limit(authorId)

    if (!success) throw new TRPCError({code: "TOO_MANY_REQUESTS"})

    const post = await ctx.prisma.post.create({
      data: {
        authorId,
        content: input.content
      }
    })

    return post
  })



});
       