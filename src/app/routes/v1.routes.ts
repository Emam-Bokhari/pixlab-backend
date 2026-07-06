import express from 'express';
import { AuthRoutes } from '../modules/auth/auth.route';
import { SupportRoutes } from '../modules/support/support.route';
import { ContentPageRoutes } from '../modules/contentPage/contentPage.route';
import { FaqRoutes } from '../modules/faq/faq.route';
import { BlogRoutes } from '../modules/blog/blog.route';
import { AdminRoutes } from '../modules/admin/admin.route';
import { UserRoutes } from '../modules/user/user.route';
import { ChatRoutes } from '../modules/chat/chat.route';
import { MessageRoutes } from '../modules/message/message.route';
import { FcmTokenRoutes } from '../modules/fcmToken/fcmToken.route';
import { PhotoRoutes } from '../modules/photo/photo.route';
import { UpscaleRoutes } from '../modules/upscale/upscale.route';
import { PaymentRoutes } from '../modules/payment/payment.route';
import { WalletRoutes } from '../modules/wallet/wallet.route';
import { CreditSettingRoutes } from '../modules/creditSetting/creditSetting.route';
import { ReduceRoutes } from '../modules/reduce/reduce.route';

const v1Router = express.Router();

const apiRoutes = [
  {
    path: '/auth',
    route: AuthRoutes,
  },
  {
    path: '/supports',
    route: SupportRoutes,
  },
  {
    path: '/content-pages',
    route: ContentPageRoutes,
  },
  {
    path: '/faqs',
    route: FaqRoutes,
  },
  {
    path: '/blogs',
    route: BlogRoutes,
  },
  {
    path: '/admins',
    route: AdminRoutes,
  },
  {
    path: '/users',
    route: UserRoutes,
  },
  {
    path: '/chats',
    route: ChatRoutes,
  },
  {
    path: '/messages',
    route: MessageRoutes,
  },
  {
    path: '/fcm-tokens',
    route: FcmTokenRoutes,
  },
  {
    path: '/photos',
    route: PhotoRoutes,
  },
  {
    path: '/upscales',
    route: UpscaleRoutes,
  },
  {
    path: '/payments',
    route: PaymentRoutes,
  },
  {
    path: '/wallets',
    route: WalletRoutes,
  },
  {
    path: '/credit-settings',
    route: CreditSettingRoutes,
  },
  {
    path: '/reduce',
    route: ReduceRoutes,
  }
];

apiRoutes.forEach((route) => v1Router.use(route.path, route.route));

export default v1Router;
