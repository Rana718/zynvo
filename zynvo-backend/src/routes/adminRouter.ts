import { Router, Request, Response } from 'express';
import prisma from '../db/db';
import { AuthMiddleware } from '../middleware/AuthMiddleware';

const router = Router();

router.get('/clubMembers', AuthMiddleware, async(req: Request, res: Response) => {
  const userId = req.id;
  
  try {
    const user = await prisma.user.findFirst({
      where: { id: userId },
      select: { email: true }
    });

    if (!user) {
      res.status(404).json({ msg: 'User not found' });
      return;
    }

    const club = await prisma.clubs.findUnique({
      where: { founderEmail: user.email },
      select: { 
        id: true,
        name: true,
        members: {
          select: {
            id: true,
            name: true,
            email: true,
            collegeName: true,
            bio: true,
            course: true,
            year: true,
            tags: true,
            twitter: true,
            linkedin: true,
            instagram: true,
            createdAt: true,
            isVerified: true
          }
        }
      }
    });

    if (!club) {
      res.status(403).json({ msg: 'Not a club founder' });
      return;
    }

    res.status(200).json({
      clubName: club.name,
      totalMembers: club.members.length,
      members: club.members
    });

  } catch (error) {
    console.log(error);
    res.status(500).json({ msg: 'Internal server error' });
  }
});

export const adminRouter = router;
