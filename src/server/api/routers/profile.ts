
import { clerkClient } from "@clerk/nextjs/server";
import { TRPCError } from "@trpc/server";
import { z } from "zod";
import { createTRPCRouter, publicProcedure } from "~/server/api/trpc";
import { filterUserForClient } from "~/server/helpers/filterUserForClient";




export const profileRouter = createTRPCRouter({ 
  getUserByUsername: publicProcedure.input(z.object({userId: z.string()})).query(async ({ctx, input}) => {

    //gets the user by its id (we take the id from the input which we give in the useQuery where this is called)
    const user = await clerkClient.users.getUser(input.userId)

    if (!user) {
        throw new TRPCError({
            code: "INTERNAL_SERVER_ERROR",
            message: 'User not found'
        })
    }

    return filterUserForClient(user)
  })

});
       