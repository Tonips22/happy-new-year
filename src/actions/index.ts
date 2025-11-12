import { ActionError, defineAction } from "astro:actions";
import { z } from "astro:schema";
import { subscribeEmail } from '@/api/subscribe.ts';

export const server = {
    subscribe: defineAction({
        input: z.object({
            email: z.string().email(),
        }),

        async handler({ email }) {
            const { success, error } = await subscribeEmail(email);
            if (error) {
                throw new ActionError({
                    code: 'BAD_REQUEST',
                    message: error,
                })
            }

            return { success: true, message: 'Subscribed successfully' };
        }
    }),
}