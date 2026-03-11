import { getAuth } from 'firebase-admin/auth';

export const verifyFirebaseToken = async (req, res, next) => {
  try {
    const authHeader = req.headers.authorization;
    
    if (!authHeader || !authHeader.startsWith('Bearer ')) {
      return res.status(401).json({ error: 'Unauthorized - No token provided' });
    }

    const idToken = authHeader.split(' ')[1];
    const decodedToken = await getAuth().verifyIdToken(idToken);
    
    if (!decodedToken.uid) {
      return res.status(401).json({ error: 'Unauthorized - Invalid token' });
    }

    req.user = { _id: decodedToken.uid, email: decodedToken.email };
    next();
  } catch (error) {
    console.error('Error verifying token:', error);
    return res.status(401).json({ error: 'Unauthorized - Invalid token' });
  }
};
