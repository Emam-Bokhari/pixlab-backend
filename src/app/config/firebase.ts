import admin from 'firebase-admin';
import config from '.';

if (!admin.apps.length) {
  admin.initializeApp({
    credential: admin.credential.cert({
      projectId: config.firebase.projectId as string,
      privateKey: config.firebase.privateKey as string,
      clientEmail: config.firebase.clientEmail as string,
    }),
  });
}

export const firebaseAdmin = admin;
