//tested
import { Router, Request, Response, response } from 'express';
import prisma from '../db/db';
import { logger } from '../utils/logger';
import { newPWschema, signupSchema } from '../types/formtypes';
import jwt from 'jsonwebtoken';
import dotenv from 'dotenv';
import bcrypt from 'bcrypt';
import crypto from 'crypto';
import mail from '../utils/nodemailer';
import { AuthMiddleware } from '../middleware/AuthMiddleware';
dotenv.config();
const router = Router();


const FF_URL = process.env.FRONTEND_URL || "http://localhost:3000"

const genToken = () => {
  return crypto.randomBytes(20).toString('hex');
};

router.post('/signup', async (req: Request, res: Response) => {
  const { name, email, password, collegeName } = req.body;
  const avatarUrl = req.body.avatarUrl;
  const parsedData = signupSchema.safeParse(req.body);

  if (!parsedData.success) {
    res.status(411).json({ msg: 'incorrect inputs' });
    logger.error(parsedData.error);
    return;
  }
  try {
    const resposne = await prisma.user.findUnique({
      where: {
        email: email,
      },
    });

    console.log("response:", resposne)

    if (resposne && resposne?.isVerified) { 

  if(collegeName !== "zynvo college" || name !== "zynvo" ) {
        res.json({
          msg : "Please Sign Up first"
        })
        return;
      }

      const userPw = resposne.password;
      const id = resposne.id;

      if (bcrypt.compareSync(password, userPw)) {
        const token = jwt.sign({ id, email, pfp : resposne.profileAvatar, name : resposne.name }, process.env.JWT_SECRET!);
        res.status(200).json({
          msg: 'login success',
          token,
        });
        return;
      } else {
        res.status(401).json({
          msg: 'Invalid email or password',
          token: 'no token',
        });
        return;
      }
    } else if (resposne && !resposne.isVerified) {
      res.status(400).json({
        msg: 'Account exists but not verified. Please check your email or request a new verification link.'
      });
      return;
    } else {

       if(collegeName == "zynvo college" || name == "zynvo" ) {
        res.json({
          msg : "Please Sign Up first and verify yourself."
        })
        return;
      }

      const hashedPassword = bcrypt.hashSync(
        parsedData.data?.password as string,
        10
      );
      const vToken = genToken();

      const response = await prisma.user.create({
        data: {
          email: parsedData.data?.email as string,
          name: parsedData.data?.name,
          password: hashedPassword,
          collegeName: collegeName,
          profileAvatar: avatarUrl,
          vToken: vToken,
          expiryToken: Math.floor(Date.now() / 1000),
          ValidFor: 86400000,
        },
      });

      const url = `${FF_URL}/verification-mail?token=${vToken}&email=${parsedData.data.email}`;
      await mail(
        parsedData.data.name,
        parsedData.data.email,
        'One click away from greatness (seriously, just one)',
        `  <div style="font-family: Arial, sans-serif; padding: 0; margin: 0;">
    <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
      <tr>
        <td>
          <img 
            src="https://pbs.twimg.com/profile_banners/1916901326887522304/1750314868/1500x500" 
            alt="Welcome to Zynvo" 
            style="width: 100%; height: auto; display: block;"
          />
        </td>
      </tr>

      <tr>
        <td style="padding: 24px;">
          <h2 style="color: #333333;">Hey there! ${name} 👋</h2>

          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Welcome to <strong>Zynvo</strong>! You've got excellent taste in platforms (we're not biased at all).
          </p>

          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            We just need to make sure you're not a robot trying to take over the world. 🤖
          </p>

          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            <strong>Click the link below and boom – you're officially part of the cool kids club:</strong>
          </p>

          <p style="margin: 24px 0;">
            <a 
              href="${url}" 
              style="background-color: #facc15; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;"
            >
              Verify My Account
            </a>
          </p>

          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Got questions? Just reply to this email — we're always here to help.
          </p>

          <p style="color: #555555; font-size: 16px; line-height: 1.6;">
            Welcome aboard! <br />
            The Zynvo Team 🚀
          </p>

          <p style="color: #999999; font-size: 14px; font-style: italic;">
            P.S. This link expires in 24 hours, so don't overthink it like choosing a Netflix show.
          </p>
        </td>
      </tr>
    </table>
  </div>
        `
      );
      const id = response.id;
      const token = jwt.sign({ id, email, pfp : response.profileAvatar, name : response.name  }, process.env.JWT_SECRET!);
      res.status(200).json({
        msg: 'account created',
      });
    }
  } catch (error: any) {
    logger.info(error.message);
    logger.error(error);
    res.status(500).json({ msg: 'internal server error' });
  }
});


router.post('/ResendEmail', async (req: Request, res: Response) => {
  const email = req.query.email as string;
  try {
    const exists = await prisma.user.findUnique({
      where : {
        email : email
      }, 
      select : {
        name : true
      }
    })

    if(exists && exists.name){
      const vToken = genToken();
      const update = await prisma.user.update({
        where : {
          email : email
        }, 
        data : {
          vToken : vToken,
          expiryToken: Math.floor(Date.now() / 1000)
        }
      })
      if(update) {
         const url = `${FF_URL}/verification-mail?token=${vToken}&email=${email}`;
              await mail(
                exists.name,
                email,
                'Resend: Verify your Zynvo account',
                `  <div style="font-family: Arial, sans-serif; padding: 0; margin: 0;">
                  <table width="100%" cellpadding="0" cellspacing="0" style="max-width: 600px; margin: auto; background-color: #ffffff; border: 1px solid #e0e0e0; border-radius: 8px; overflow: hidden;">
                    <tr>
                      <td>
                        <img 
                          src="https://pbs.twimg.com/profile_banners/1916901326887522304/1750314868/1500x500" 
                          alt="Welcome to Zynvo" 
                          style="width: 100%; height: auto; display: block;"
                        />
                      </td>
                    </tr>
                    <tr>
                      <td style="padding: 24px;">
                        <h2 style="color: #333333;">Resend Verification Link</h2>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                          Hi ${exists.name},<br/>
                          It looks like you requested a new verification link for your Zynvo account.
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                          Click the button below to verify your email and activate your account:
                        </p>
                        <p style="margin: 24px 0;">
                          <a 
                            href="${url}" 
                            style="background-color: #facc15; color: #000000; text-decoration: none; padding: 12px 24px; border-radius: 6px; font-weight: bold; display: inline-block;"
                          >
                            Verify My Account
                          </a>
                        </p>
                        <p style="color: #555555; font-size: 16px; line-height: 1.6;">
                          If you did not request this, you can safely ignore this email.
                        </p>
                        <p style="color: #999999; font-size: 14px; font-style: italic;">
                          This link expires in 24 hours.
                        </p>
                      </td>
                    </tr>
                  </table>
                </div>
                `
              );
          res.status(200).json({
            msg : "Verification mail sent"
          })
          return;
      }else {
        res.status(501).json({
          msg : "some error occured"
        })
        return
      }
    } else {
      res.status(200).json({
        msg : "No such user"
      })
      return;
    }

  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg : "internal server error"
    })
  }
});

router.post('/verify', async (req: Request, res: Response) => {
  const vToken = req.query.vToken as string;
  console.log('1');
  if (!vToken) {
    res.status(404).json({
      msg: 'bad response, invalid token',
    });
  }
  try {
    const response = await prisma.user.findFirst({
      where: {
        vToken: vToken,
      },
    });

    if (!response) {
      res.status(400).json({
        msg: 'no user found, Invalid token',
      });
      return;
    }

    const expTime = response?.expiryToken as number;
    const currentTime = Math.floor(Date.now() / 1000);
    const ValidFor = response?.ValidFor as number;

    if (currentTime - expTime <= ValidFor / 1000) {
      console.log(2);
      const Res = await prisma.user.update({
        where: {
          id: response?.id,
        },
        data: {
          isVerified: true,
        },
      });

      const id = Res.id;
      const isVerified = Res.isVerified;

      const token = jwt.sign({ id, isVerified }, process.env.JWT_SECRET!);

      if (!Res) {
        res.status(500).json({
          msg: 'internal server error, try again',
        });
        return;
      }

      res.status(200).json({
        msg: 'Verified successfully',
        token,
      });
    } else {
      res.status(400).json({
        msg: 'expired',
      });
    }
  } catch (error) {
    logger.error(error);
    res.status(500).json({
      msg: 'internal server error',
    });
  }
});

router.put(
  '/reset-password',
  AuthMiddleware,
  async (req: Request, res: Response) => {
    const userID = req.id;
    const { password, newPassword } = req.body;
    const parsedData = newPWschema.safeParse(req.body);

    if (!parsedData.success) {
      res.json({
        msg: 'invalid passwrd format',
      });
      return;
    }

    try {
      const response = await prisma.user.findFirst({
        where: {
          id: userID,
        },
      });

      if (!response) {
        res.status(404).json({
          msg: 'invalid user, no such user',
        });
        return;
      }

      const pw = response?.password as string;

      if (bcrypt.compareSync(password, pw)) {
        const update = await prisma.user.update({
          where: {
            id: response?.id,
          },
          data: {
            password: bcrypt.hashSync(parsedData.data?.password as string, 10),
          },
        });

        if (!update){
          res.status(500).json({ msg: 'internal server error, try again' });
          return;
        }
        
        res.status(200).json({
          msg: 'password updated successfully',
        });
        return;
      }
    } catch (error) {
      logger.info(error);
      logger.error(error);
      res.status(500).json({ msg: 'internal server error' });

    }
  }
);

router.get('/getUser', AuthMiddleware, async (req: Request, res: Response) => {
  const userId = req.id;
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        collegeName : true,
        twitter : true,
        instagram : true,
        linkedin : true,
        createdAt : true,
        id : true,
        bio : true,
        year : true,
        tags : true,
        course : true,
        profileAvatar: true,
        name: true,
        clubName: true,
        email: true,
        isVerified: true,
        eventAttended: {
          where: {
            userId: userId,
          },
          select: {
            event: {
              select: {
                EventName: true,
                id: true,
              },
            },
          },
        },
        CreatePost : {
          where : {
            authorId : userId
          }, 
          select : {
            id : true,
            description : true
          }
        }
      },
    });

    if (!user) {
      res.status(404);
      console.log('error');
      return;
    } else {
      res.status(200).json({
        user,
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg : "error fetching details"
    })
  }
});

router.post(
  '/joinClub/:id',
  AuthMiddleware,
  async (req: Request, res: Response) => {
    // maybe allow users to join multiple clubs.
    const ClubId = req.params.id;
    const userId = req.id;
    try {
      const club = await prisma.clubs.findFirst({
        where: {
          id: ClubId,
        },
        select: {
          name: true,
        },
      });

      if (!club) {
        res.json({
          msg: 'no club found',
        });
        return
      }

      const clubName = club?.name as string;

      const userClub = await prisma.user.findUnique({
        where : {
          id : userId
        },
        select : {
          clubName : true, 
          clubId : true
        }
      })

      if(userClub?.clubId && userClub.clubName) {
        res.json({
          msg : "you are alredy a part of club, leave that first to join this."
        })
      }

      const JoinClub = await prisma.user.update({
        where: {
          id: userId,
        },
        data: {
          clubName: clubName,
          clubId: ClubId,
        },
      });

      if (JoinClub) {
        res.status(200).json({
          msg: 'yay club joined',
        });
        return
      }

      console.log('working');
    } catch (error) {
      logger.error(error);
    }
  }
);

router.get('/isFounder', AuthMiddleware, async(req : Request, res: Response) => {
   const userId = req.id;
   const eventId = req.query.id as string

    try {
      const user = await prisma.user.findFirst({
        where: {
          id: userId,
        },
        select: {
          email: true,
        },
      });


      if (!user) {
        res.status(404).json({
          msg: 'No user Found',
        });
        return;
      }

      console.log(user.email)

      const club = await prisma.clubs.findUnique({
        where: {
          founderEmail: user.email,
        },
        select: {
          name: true,
          id: true,
        },
      });

      if(!club){
        res.json({
          msg : "you nihh not a founder"
        })
        return;
      }
      console.log(club.name)
      const event = await prisma.event.findUnique({
        where : {
          id : eventId
        },
        select : {
          clubId : true
        }
      })

       if(!event){
        res.json({
          msg : "you nihh not a founder"
        })
        return;
      }

      console.log(event.clubId)

      if (club?.id == event?.clubId) {
         res.status(200).json({
          msg : "identified"
        })
        return
      } else {
        res.json({
          msg: 'invalid president identification',
        });
        return;
      }
    } catch (e) {
      console.log(e)
      res.status(500).json({
        msg : "internal server error"
      })
    }
})

router.put('/updateProfile',AuthMiddleware, async(req : Request, res: Response) => {
  const userId = req.id;
  const {bio , tags, course, year, twitter, instagram, linkedin} = req.body;
  try {
    const update = await prisma.user.update({
      where : {
        id : userId
      }, 
      data : {
        bio : bio,
        tags : tags,
        course : course,
        year : year,
        twitter : twitter ? twitter : "",
        instagram : instagram ? instagram : "",
        linkedin : linkedin ? linkedin : ""
      }
    })

    if(update) {
      res.status(200).json({
        msg : "Profile updated successfully"
      })
    } else {
      res.status(400).json({
        msg : "some error occured"
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg : "Internal server error"
    })
  }
} )

router.get(`/getSidebarUser`, AuthMiddleware, async(req : Request, res: Response) => {
  const userId = req.id
  try {
    const data = await prisma.user.findUnique({
      where : {
        id : userId
      },
      select : {
        name : true,
        profileAvatar : true
      }
    })

    if(data) {
      res.status(200).json({
        data
      })
      return
    } else {
      res.status(404).json({
        msg : "no user found"
      })
      return
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
        msg : "internal server error"
      })
    return
  }
})


router.get('/SearchUser', async(req : Request, res: Response) => {
  const name = req.query.name as string
  if(!name || name == "") {
    res.status(404).json({
      msg : "Please enter user's name"
    })
    return 
  }
  try {
    const users = await prisma.user.findMany({
      where : {
        name : {
          contains : name,
          mode : "insensitive"
        }
      }, 
      select : {
        id : true,
        name : true,
        profileAvatar : true,
        collegeName : true
      }
    })

    if(users) {
      res.status(200).json({
        users
      })
      return
    } else {
      res.status(404).json({
        msg : "no users found",
        users : []
      })
      return
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg : "internal server error"
    })
  }
})


router.get('/getPublicUser',AuthMiddleware, async (req: Request, res: Response) => {
  const userId = req.query.id as string
  try {
    const user = await prisma.user.findUnique({
      where: {
        id: userId,
      },
      select: {
        collegeName : true,
        twitter : true,
        instagram : true,
        linkedin : true,
        createdAt : true,
        id : true,
        bio : true,
        year : true,
        tags : true,
        course : true,
        profileAvatar: true,
        name: true,
        clubName: true,
        email: true,
        isVerified: true,
        eventAttended: {
          where: {
            userId: userId,
          },
          select: {
            event: {
              select: {
                EventName: true,
                id: true,
              },
            },
          },
        },
        CreatePost : {
          where : {
            authorId : userId
          }, 
          select : {
            id : true,
            description : true
          }
        }
      },
    });

    if (!user) {
      res.status(404).json({
        msg : "user not found"
      })
      return;
    } else {
      res.status(200).json({
        user,
      });
      return;
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg : "internal server error"
    })
  }
});

router.get("/getAllUsers", async(req: Request, res : Response) => {
    const page = parseInt(req.query.page as string) || 1
    const limit = 10
    const skip = (page - 1) * limit
  
  try {
     const users = await prisma.user.findMany({ 
      take : limit,
      skip,
      orderBy : {
        createdAt : "desc"
      },
      select : {
        id : true,
        name : true,
        profileAvatar : true,
        collegeName : true,
        clubName : true,
        year : true,
        course : true
      }
    })

    const totalData = await prisma.user.count();

    if(users){
      res.status(200).json({
        users,
        totalPages : Math.ceil(totalData/limit)
      })
      return;
    } else {
      res.status(404).json({
        msg : "users not found"
      })
    }
  } catch (error) {
    console.log(error);
    res.status(500).json({
      msg : "internal server error"
    })
  }
})

export const userRouter = router;
