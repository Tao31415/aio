import { z } from 'zod'

export const signInSchema = z.object({
  username: z.string().min(1, '请输入用户名'),
  password: z.string().min(1, '请输入密码'),
  remember: z.boolean().default(false),
  callbackURL: z.string().optional(),
})

export type SignInForm = z.infer<typeof signInSchema>
