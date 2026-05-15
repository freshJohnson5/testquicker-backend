import { Router } from 'express'

import { auth } from './auth'
import { users } from './users'
import { media } from './media'
import aiRouter from './ai'
import linksRouter from './links'

const router: Router = Router()

const routes: {
  [key: string]: (router: Router) => void
} = { auth, users, media }

for (const route in routes) {
  routes[route](router)
}

router.use('/ai', aiRouter)
router.use('/api/links', linksRouter)

export { router }